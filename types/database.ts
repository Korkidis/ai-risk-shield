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
  status: 'pending' | 'processing' | 'completed' | 'failed'
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
  assets?: Pick<ExtendedAsset, 'filename' | 'file_type'>
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

export interface ProvenanceDetails {
  id: string
  scan_id: string
  manifest_store: 'detected' | 'missing'
  claim_signature: 'valid' | 'invalid' | 'missing'
  signature_algorithm?: string
  cert_authority?: string
  c2pa_version?: string
  assertion_store_count?: number
  creator_identity?: string
  generation_tool?: string
  model_version?: string
  tool_chain?: string[]
  timestamp?: string
  edit_count?: number
  action_sequence?: string[]
  ai_generated?: 'confirmed' | 'undeclared'
  ai_training_allowed?: boolean
  generative_model?: string
  thumbnail_hash?: 'verified' | 'missing'
  geolocation?: string
  device_info?: string
  ingredient_count?: number
  chain_custody: 'full' | 'partial' | 'incomplete' | 'broken'
  overall_status: 'verified' | 'invalid' | 'incomplete'
  raw_manifest?: any
  created_at: string
}
