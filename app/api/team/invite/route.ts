import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceRoleClient } from '@/lib/supabase/server'
import { getTenantId, requireAuth } from '@/lib/supabase/auth'
import { hasFeature, getPlan, type PlanId } from '@/lib/plans'
import { Resend } from 'resend'
import { randomUUID } from 'crypto'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const INVITE_EXPIRY_DAYS = 7

/**
 * POST /api/team/invite
 *
 * Send a team invite. Caller must be owner or admin on a TEAM+ plan.
 */
export async function POST(req: NextRequest) {
    try {
        const user = await requireAuth()
        const tenantId = await getTenantId()

        if (!tenantId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }

        // Get caller's role + tenant plan
        const supabase = await createClient()
        const adminClient = await createServiceRoleClient()

        const { data: callerProfile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .eq('tenant_id', tenantId)
            .single()

        if (!callerProfile || !['owner', 'admin'].includes(callerProfile.role)) {
            return NextResponse.json({ error: 'Only owners and admins can invite members' }, { status: 403 })
        }

        // Feature gate
        const { data: tenant } = await supabase
            .from('tenants')
            .select('plan, name, seat_limit')
            .eq('id', tenantId)
            .single()

        const plan = (tenant?.plan as PlanId) || 'free'
        if (!hasFeature(plan, 'teamDashboard')) {
            return NextResponse.json({
                error: 'Team management requires a Team plan or higher',
                code: 'FEATURE_GATED',
            }, { status: 403 })
        }

        // Parse body
        const body = await req.json()
        const email = (body.email || '').trim().toLowerCase()
        const role = body.role || 'member'

        // Validate email
        if (!email || !EMAIL_REGEX.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 })
        }

        // Validate role
        if (!['admin', 'member'].includes(role)) {
            return NextResponse.json({ error: 'Role must be admin or member' }, { status: 400 })
        }

        // Seat limit check
        const planConfig = getPlan(plan)
        const { count: memberCount } = await adminClient
            .from('profiles')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)

        const { count: pendingCount } = await adminClient
            .from('tenant_invites')
            .select('id', { count: 'exact', head: true })
            .eq('tenant_id', tenantId)
            .is('accepted_at', null)

        const totalSeats = (memberCount || 0) + (pendingCount || 0)
        if (totalSeats >= planConfig.seats) {
            return NextResponse.json({
                error: `Seat limit reached (${planConfig.seats}). Upgrade your plan for more seats.`,
                code: 'SEAT_LIMIT_REACHED',
            }, { status: 403 })
        }

        // Check for existing member
        const { data: existingMember } = await adminClient
            .from('profiles')
            .select('id')
            .eq('tenant_id', tenantId)
            .eq('email', email)
            .single()

        if (existingMember) {
            return NextResponse.json({ error: 'User is already a member of this workspace' }, { status: 409 })
        }

        // Create invite
        const token = randomUUID()
        const expiresAt = new Date()
        expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS)

        const { error: insertError } = await adminClient
            .from('tenant_invites')
            .insert({
                tenant_id: tenantId,
                email,
                role,
                token,
                invited_by: user.id,
                expires_at: expiresAt.toISOString(),
            })

        if (insertError) {
            // Unique constraint violation = duplicate pending invite
            if (insertError.code === '23505') {
                return NextResponse.json({ error: 'An invite is already pending for this email' }, { status: 409 })
            }
            console.error('Invite insert error:', insertError)
            return NextResponse.json({ error: 'Failed to create invite' }, { status: 500 })
        }

        // Send invite email via magic link
        // The invite is auto-claimed when the user clicks the magic link (auth callback checks pending invites)
        try {
            const { data: linkData, error: linkError } = await adminClient.auth.admin.generateLink({
                type: 'magiclink',
                email,
                options: {
                    redirectTo: `${req.nextUrl.origin}/auth/callback?next=/dashboard`,
                },
            })

            if (linkError || !linkData?.properties?.hashed_token) {
                console.error('Failed to generate magic link for invite:', linkError)
            } else {
                // Build the confirmation URL
                const confirmUrl = `${req.nextUrl.origin}/auth/confirm?token_hash=${linkData.properties.hashed_token}&type=magiclink&next=/dashboard`

                const resend = new Resend(process.env.RESEND_API_KEY)
                await resend.emails.send({
                    from: 'AI Content Risk Score <noreply@contentriskscore.com>',
                    to: email,
                    subject: `You've been invited to ${tenant?.name || 'a workspace'} on AI Content Risk Score`,
                    html: `
                        <div style="font-family: monospace; max-width: 480px; margin: 0 auto;">
                            <h2 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em;">Team Invite</h2>
                            <p style="font-size: 13px; color: #555;">
                                You've been invited to join <strong>${tenant?.name || 'a workspace'}</strong> as a <strong>${role}</strong>.
                            </p>
                            <a href="${confirmUrl}" style="display: inline-block; padding: 10px 24px; background: #111; color: #fff; text-decoration: none; font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; margin: 16px 0;">
                                Join Workspace
                            </a>
                            <p style="font-size: 11px; color: #999;">
                                This invite expires in ${INVITE_EXPIRY_DAYS} days.
                            </p>
                            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
                            <p style="font-size: 10px; color: #bbb; text-transform: uppercase; letter-spacing: 0.15em;">
                                AI Content Risk Score
                            </p>
                        </div>
                    `,
                })

            }
        } catch (emailErr) {
            console.error('Failed to send invite email:', emailErr)
            // Don't fail the invite — it's created, just email didn't send
        }

        // Audit log
        await adminClient.from('audit_log').insert({
            tenant_id: tenantId,
            user_id: user.id,
            action: 'team_invite_sent',
            resource_type: 'tenant_invite',
            metadata: { invited_email: email, role },
        })

        return NextResponse.json({ success: true, email, role, expiresAt: expiresAt.toISOString() })
    } catch (error) {
        console.error('Team invite API error:', error)
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
    }
}
