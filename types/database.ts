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

export interface ExtendedScan {
  id: string
  session_id?: string | null
  tenant_id?: string | null
  analyzed_by?: string | null
  asset_id: string
  is_video: boolean
  status: 'processing' | 'complete' | 'failed'
  risk_level?: string | null
  composite_score?: number | null
  ip_risk_score?: number | null
  safety_risk_score?: number | null
  provenance_risk_score?: number | null
  email?: string | null
  email_captured_at?: string | null
  purchased?: boolean | null
  purchase_type?: string | null
  stripe_payment_intent_id?: string | null
  created_at: string
  completed_at?: string | null
  notes?: string | null
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

export interface ScanWithRelations extends ExtendedScan {
  assets?: Pick<ExtendedAsset, 'filename' | 'file_type'>
  scan_findings?: ScanFinding[]
}
