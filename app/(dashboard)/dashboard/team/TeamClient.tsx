'use client'

import { useCallback, useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { UserPlus, X, Trash2 } from 'lucide-react'
import { RSButton } from '@/components/rs/RSButton'

interface Member {
    id: string
    email: string
    full_name: string
    role: string
    created_at: string
}

interface Invite {
    id: string
    email: string
    role: string
    invited_by: string
    created_at: string
    expires_at: string
}

interface TeamClientProps {
    seatLimit: number
}

export function TeamClient({ seatLimit }: TeamClientProps) {
    const [members, setMembers] = useState<Member[]>([])
    const [invites, setInvites] = useState<Invite[]>([])
    const [loading, setLoading] = useState(true)
    const [showInviteModal, setShowInviteModal] = useState(false)
    const [inviteEmail, setInviteEmail] = useState('')
    const [inviteRole, setInviteRole] = useState('member')
    const [inviting, setInviting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = useCallback(async () => {
        try {
            const [membersRes, invitesRes] = await Promise.all([
                fetch('/api/team/members'),
                fetch('/api/team/invites'),
            ])
            if (membersRes.ok) {
                const data = await membersRes.json()
                setMembers(data.members || [])
            }
            if (invitesRes.ok) {
                const data = await invitesRes.json()
                setInvites(data.invites || [])
            }
        } catch {
            console.error('Failed to fetch team data')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return
        setInviting(true)
        setError(null)

        try {
            const res = await fetch('/api/team/invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error || 'Failed to send invite')
                return
            }
            setShowInviteModal(false)
            setInviteEmail('')
            setInviteRole('member')
            fetchData()
        } catch {
            setError('Failed to send invite')
        } finally {
            setInviting(false)
        }
    }

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            const res = await fetch('/api/team/members', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, role: newRole }),
            })
            if (res.ok) fetchData()
        } catch {
            console.error('Role change failed')
        }
    }

    const handleRemoveMember = async (userId: string) => {
        if (!confirm('Remove this member from the workspace?')) return
        try {
            const res = await fetch('/api/team/members', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            })
            if (res.ok) fetchData()
        } catch {
            console.error('Member removal failed')
        }
    }

    const handleRevokeInvite = async (inviteId: string) => {
        try {
            const res = await fetch('/api/team/invites', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ inviteId }),
            })
            if (res.ok) fetchData()
        } catch {
            console.error('Invite revocation failed')
        }
    }

    const totalOccupied = members.length + invites.length
    const seatPercentage = Math.min(100, (totalOccupied / seatLimit) * 100)

    if (loading) {
        return (
            <div className="p-6 space-y-4">
                <div className="h-6 w-48 bg-[var(--rs-bg-element)] animate-pulse rounded-sm" />
                <div className="h-32 bg-[var(--rs-bg-element)] animate-pulse rounded-sm" />
            </div>
        )
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-sm font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                        Team Management
                    </h1>
                    <span className="text-[9px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        {members.length} MEMBER{members.length !== 1 ? 'S' : ''}
                    </span>
                </div>
                <RSButton
                    variant="primary"
                    size="sm"
                    onClick={() => setShowInviteModal(true)}
                    disabled={totalOccupied >= seatLimit}
                    className="text-[9px] uppercase tracking-widest font-black flex items-center gap-1.5"
                >
                    <UserPlus className="w-3 h-3" />
                    Invite Member
                </RSButton>
            </div>

            {/* Seat Gauge — linear capacity indicator */}
            <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                    <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        SEAT CAPACITY
                    </span>
                    <span className="text-[9px] font-mono font-bold text-[var(--rs-text-primary)] uppercase tracking-widest">
                        {totalOccupied}/{seatLimit} SEATS
                    </span>
                </div>
                <div className="h-1.5 bg-[var(--rs-bg-element)] rounded-full overflow-hidden border border-[var(--rs-border-primary)]/20">
                    <div
                        className={cn(
                            "h-full rounded-full transition-all duration-500",
                            seatPercentage >= 90 ? "bg-[var(--rs-signal)]" :
                                seatPercentage >= 70 ? "bg-[var(--rs-risk-caution)]" :
                                    "bg-[var(--rs-text-primary)]"
                        )}
                        style={{ width: `${seatPercentage}%` }}
                    />
                </div>
            </div>

            {/* Members Table */}
            <section className="border border-[var(--rs-border-primary)]/40 rounded-sm overflow-hidden">
                <div className="px-4 py-2.5 bg-[var(--rs-bg-element)] border-b border-[var(--rs-border-primary)]/40">
                    <span className="text-[8px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                        ACTIVE MEMBERS
                    </span>
                </div>
                <div className="divide-y divide-[var(--rs-border-primary)]/20">
                    {members.map((member) => (
                        <div key={member.id} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--rs-bg-element)]/30 transition-colors">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <span className="text-[11px] font-bold text-[var(--rs-text-primary)] truncate">
                                        {member.full_name}
                                    </span>
                                    <span className={cn(
                                        "text-[8px] font-mono font-bold uppercase tracking-widest px-1.5 py-0.5 rounded-sm",
                                        member.role === 'owner'
                                            ? "bg-[var(--rs-text-primary)] text-white"
                                            : member.role === 'admin'
                                                ? "bg-[var(--rs-bg-element)] text-[var(--rs-text-primary)] border border-[var(--rs-border-primary)]/40"
                                                : "bg-[var(--rs-bg-element)] text-[var(--rs-text-tertiary)]"
                                    )}>
                                        {member.role}
                                    </span>
                                </div>
                                <span className="text-[10px] font-mono text-[var(--rs-text-tertiary)]">
                                    {member.email}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {member.role !== 'owner' && (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member.id, e.target.value)}
                                            className="text-[9px] font-mono bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)]/40 rounded-sm px-1.5 py-1 text-[var(--rs-text-secondary)] cursor-pointer"
                                        >
                                            <option value="member">Member</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveMember(member.id)}
                                            className="p-1 text-[var(--rs-text-tertiary)] hover:text-[var(--rs-destruct)] transition-colors"
                                            title="Remove member"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Pending Invites */}
            {invites.length > 0 && (
                <section className="border border-[var(--rs-border-primary)]/40 rounded-sm overflow-hidden">
                    <div className="px-4 py-2.5 bg-[var(--rs-bg-element)] border-b border-[var(--rs-border-primary)]/40">
                        <span className="text-[8px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                            PENDING INVITES ({invites.length})
                        </span>
                    </div>
                    <div className="divide-y divide-[var(--rs-border-primary)]/20">
                        {invites.map((invite) => (
                            <div key={invite.id} className="px-4 py-3 flex items-center justify-between hover:bg-[var(--rs-bg-element)]/30 transition-colors">
                                <div className="flex-1 min-w-0">
                                    <span className="text-[11px] text-[var(--rs-text-primary)] truncate block">
                                        {invite.email}
                                    </span>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)] uppercase tracking-widest">
                                            {invite.role}
                                        </span>
                                        <span className="text-[8px] font-mono text-[var(--rs-text-tertiary)]">
                                            expires {new Date(invite.expires_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleRevokeInvite(invite.id)}
                                    className="p-1 text-[var(--rs-text-tertiary)] hover:text-[var(--rs-destruct)] transition-colors"
                                    title="Revoke invite"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* Invite Modal */}
            {showInviteModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className="absolute inset-0 bg-black/50"
                        onClick={() => setShowInviteModal(false)}
                    />
                    <div className="relative bg-[var(--rs-bg-surface)] border border-[var(--rs-border-primary)] rounded-sm shadow-xl w-full max-w-md mx-4">
                        {/* Modal Header */}
                        <div className="px-5 py-4 border-b border-[var(--rs-border-primary)]/40 flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[var(--rs-text-primary)] uppercase tracking-tight">
                                Invite Team Member
                            </span>
                            <button
                                onClick={() => setShowInviteModal(false)}
                                className="p-1 text-[var(--rs-text-tertiary)] hover:text-[var(--rs-text-primary)] transition-colors"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="p-5 space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-[8px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest block">
                                    EMAIL ADDRESS
                                </label>
                                <input
                                    type="email"
                                    value={inviteEmail}
                                    onChange={(e) => setInviteEmail(e.target.value)}
                                    placeholder="colleague@company.com"
                                    className="w-full px-3 py-2 text-[11px] font-mono bg-[var(--rs-bg-well)] border border-[var(--rs-border-primary)]/40 rounded-sm text-[var(--rs-text-primary)] placeholder:text-[var(--rs-text-tertiary)]/50 focus:outline-none focus:border-[var(--rs-text-primary)]"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[8px] font-mono font-bold text-[var(--rs-text-tertiary)] uppercase tracking-widest block">
                                    ROLE
                                </label>
                                <select
                                    value={inviteRole}
                                    onChange={(e) => setInviteRole(e.target.value)}
                                    className="w-full px-3 py-2 text-[11px] font-mono bg-[var(--rs-bg-well)] border border-[var(--rs-border-primary)]/40 rounded-sm text-[var(--rs-text-primary)] cursor-pointer focus:outline-none focus:border-[var(--rs-text-primary)]"
                                >
                                    <option value="member">Member — can scan and view reports</option>
                                    <option value="admin">Admin — can invite members and manage scans</option>
                                </select>
                            </div>

                            {error && (
                                <p className="text-[10px] font-mono text-[var(--rs-destruct)]">{error}</p>
                            )}
                        </div>

                        {/* Modal Footer */}
                        <div className="px-5 py-4 border-t border-[var(--rs-border-primary)]/40 flex justify-end gap-2">
                            <RSButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setShowInviteModal(false)}
                                className="text-[9px] uppercase tracking-widest"
                            >
                                Cancel
                            </RSButton>
                            <RSButton
                                variant="primary"
                                size="sm"
                                onClick={handleInvite}
                                disabled={inviting || !inviteEmail.trim()}
                                className="text-[9px] uppercase tracking-widest font-black"
                            >
                                {inviting ? 'Sending...' : 'Send Invite'}
                            </RSButton>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
