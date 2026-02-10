/**
 * Extended Database Types
 *
 * These types extend the Supabase-generated types to include:
 * - session_id fields for freemium flow
 * - email fields for anonymous scans
 * - Additional relationships and computed fields
 */

export interface ExtendedAsset {
  id: string
  session_id?: string | null
  tenant_id?: string | null
  uploaded_by?: string | null
  filename: string
  file_type: 'image' | 'video'
  mime_type: string
  file_size: number
  storage_path: string
  storage_bucket: string
  sha256_checksum: string
  delete_after: string
  created_at: string
}

export interface BrandGuideline {
  id: string
  tenant_id: string
  name: string
  industry?: string
  is_default: boolean
  prohibitions: string[]
  requirements: string[]
  context_modifiers: string[]
  target_markets: string[]
  target_platforms: string[]
  last_used_at?: string
  created_at: string
  updated_at: string
}

export interface ExtendedScan {
  id: string
  session_id?: string | null // For anonymous scans
  tenant_id: string | null
  analyzed_by?: string | null // User ID who analyzed
  asset_id: string
  guideline_id?: string
  status: 'pending' | 'processing' | 'complete' | 'failed'
  is_video?: boolean
  ip_risk_score?: number
  safety_risk_score?: number
  provenance_risk_score?: number
  composite_score?: number
  risk_level?: 'critical' | 'high' | 'review' | 'caution' | 'safe'
  email?: string | null // For anonymous email capture
  purchased?: boolean | null
  purchase_type?: string | null
  created_at: string
  updated_at: string
  notes?: string
  tags?: string[]
  share_token?: string | null
  share_expires_at?: string | null
}

export interface ScanFinding {
  id: string
  scan_id: string
  type: string
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  title: string
  description: string
  confidence_score: number
  created_at: string
}

import { RiskProfile } from '@/lib/gemini-types'

export interface ScanWithRelations extends ExtendedScan {
  assets?: Pick<ExtendedAsset, 'filename' | 'file_type' | 'file_size'>
  scan_findings?: ScanFinding[]
  email?: string | null

  // UI Helper Props (Join Results)
  filename: string
  file_type: string
  image_url?: string | null
  asset_url?: string | null
  risk_profile?: RiskProfile | null
  brand_guidelines?: BrandGuideline | null
  provenance_details?: ProvenanceDetails | null
}

// ... (previous interfaces)

export interface ExtendedTenant {
  id: string
  name: string
  plan: 'free' | 'individual' | 'team' | 'agency' | 'enterprise'
  monthly_scan_limit: number
  scans_used_this_month: number
  usage_limit_mitigation: number
  parent_tenant_id?: string | null // For Agency/Enterprise hierarchy
  stripe_customer_id?: string | null
  subscription_status?: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete' | null
  created_at: string
}

export interface ProvenanceDetails {
  id: string
  scan_id: string
  tenant_id: string

  // -- Core Metadata --
  creator_name?: string | null
  creator_link?: string | null
  creation_tool?: string | null
  creation_tool_version?: string | null
  creation_timestamp?: string | null

  // -- Cryptography --
  signature_status: 'valid' | 'invalid' | 'caution'
  certificate_issuer?: string | null
  certificate_serial?: string | null
  hashing_algorithm: string // default 'sha256'

  // -- Deep Data (JSONB) --
  // These replace the flat columns that were previously assumed
  edit_history: any[] | null // JSONB array of edit actions
  raw_manifest?: any | null // JSONB full c2pa manifest

  created_at: string
}

export interface MitigationReport {
  id: string
  scan_id: string
  tenant_id: string
  advice_content: string
  created_at: string
}

export interface ReferralEvent {
  id: string
  user_id?: string | null
  tenant_id?: string | null
  scan_id?: string | null
  event_type: 'insurance_click' | 'expert_consult_click' | string
  metadata?: any | null
  created_at: string
}

export interface TenantInvite {
  id: string
  tenant_id: string
  email: string
  role: 'owner' | 'admin' | 'member'
  token: string
  expires_at: string
  created_by?: string | null
  created_at: string
  accepted_at?: string | null
}
