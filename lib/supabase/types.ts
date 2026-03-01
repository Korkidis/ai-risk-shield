export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string
          name: string
          plan: string
          monthly_scan_limit: number
          monthly_report_limit: number | null
          seat_limit: number | null
          brand_profile_limit: number | null
          retention_days: number
          scans_used_this_month: number
          usage_limit_mitigation: number
          scan_overage_cost_cents: number | null
          report_overage_cost_cents: number | null
          feature_bulk_upload: boolean | null
          feature_co_branding: boolean | null
          feature_white_label: boolean | null
          feature_team_dashboard: boolean | null
          feature_audit_logs: boolean | null
          feature_priority_queue: boolean | null
          feature_sso: boolean | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_metered_item_id: string | null
          subscription_status: string | null
          billing_period_start: string | null
          current_period_start: string
          current_period_end: string
          parent_tenant_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          plan?: string
          monthly_scan_limit?: number
          monthly_report_limit?: number | null
          seat_limit?: number | null
          brand_profile_limit?: number | null
          retention_days?: number
          scans_used_this_month?: number
          usage_limit_mitigation?: number
          scan_overage_cost_cents?: number | null
          report_overage_cost_cents?: number | null
          feature_bulk_upload?: boolean | null
          feature_co_branding?: boolean | null
          feature_white_label?: boolean | null
          feature_team_dashboard?: boolean | null
          feature_audit_logs?: boolean | null
          feature_priority_queue?: boolean | null
          feature_sso?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_metered_item_id?: string | null
          subscription_status?: string | null
          billing_period_start?: string | null
          current_period_start?: string
          current_period_end?: string
          parent_tenant_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          plan?: string
          monthly_scan_limit?: number
          monthly_report_limit?: number | null
          seat_limit?: number | null
          brand_profile_limit?: number | null
          retention_days?: number
          scans_used_this_month?: number
          usage_limit_mitigation?: number
          scan_overage_cost_cents?: number | null
          report_overage_cost_cents?: number | null
          feature_bulk_upload?: boolean | null
          feature_co_branding?: boolean | null
          feature_white_label?: boolean | null
          feature_team_dashboard?: boolean | null
          feature_audit_logs?: boolean | null
          feature_priority_queue?: boolean | null
          feature_sso?: boolean | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_metered_item_id?: string | null
          subscription_status?: string | null
          billing_period_start?: string | null
          current_period_start?: string
          current_period_end?: string
          parent_tenant_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string | null
          role: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          full_name?: string | null
          role?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          tenant_id: string | null
          session_id: string | null
          filename: string
          file_type: string
          mime_type: string
          file_size: number
          storage_path: string
          storage_bucket: string
          sha256_checksum: string
          uploaded_by: string | null
          delete_after: string
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          session_id?: string | null
          filename: string
          file_type: string
          mime_type: string
          file_size: number
          storage_path: string
          storage_bucket?: string
          sha256_checksum: string
          uploaded_by?: string | null
          delete_after: string
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          session_id?: string | null
          filename?: string
          file_type?: string
          mime_type?: string
          file_size?: number
          storage_path?: string
          storage_bucket?: string
          sha256_checksum?: string
          uploaded_by?: string | null
          delete_after?: string
          created_at?: string
        }
        Relationships: []
      }
      scans: {
        Row: {
          id: string
          tenant_id: string | null
          session_id: string | null
          asset_id: string
          user_id: string | null
          analyzed_by: string | null
          brand_profile_id: string | null
          guideline_id: string | null
          status: 'pending' | 'processing' | 'complete' | 'failed'
          is_video: boolean
          ip_risk_score: number | null
          safety_risk_score: number | null
          provenance_risk_score: number | null
          composite_score: number | null
          risk_level: 'critical' | 'high' | 'review' | 'caution' | 'safe' | null
          provenance_status: string | null
          provenance_data: Json | null
          risk_profile: Json | null
          error_message: string | null
          analysis_duration_ms: number | null
          gemini_model_version: string | null
          frames_analyzed: number | null
          highest_risk_frame: number | null
          email: string | null
          email_captured_at: string | null
          purchased: boolean | null
          purchase_type: string | null
          stripe_payment_intent_id: string | null
          notes: string | null
          tags: string[] | null
          share_token: string | null
          share_expires_at: string | null
          created_at: string
          completed_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          session_id?: string | null
          asset_id: string
          user_id?: string | null
          analyzed_by?: string | null
          brand_profile_id?: string | null
          guideline_id?: string | null
          status?: string
          is_video?: boolean
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          provenance_risk_score?: number | null
          composite_score?: number | null
          risk_level?: string | null
          provenance_status?: string | null
          provenance_data?: Json | null
          risk_profile?: Json | null
          error_message?: string | null
          analysis_duration_ms?: number | null
          gemini_model_version?: string | null
          frames_analyzed?: number | null
          highest_risk_frame?: number | null
          email?: string | null
          email_captured_at?: string | null
          purchased?: boolean | null
          purchase_type?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          tags?: string[] | null
          share_token?: string | null
          share_expires_at?: string | null
          created_at?: string
          completed_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string | null
          session_id?: string | null
          asset_id?: string
          user_id?: string | null
          analyzed_by?: string | null
          brand_profile_id?: string | null
          guideline_id?: string | null
          status?: string
          is_video?: boolean
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          provenance_risk_score?: number | null
          composite_score?: number | null
          risk_level?: string | null
          provenance_status?: string | null
          provenance_data?: Json | null
          risk_profile?: Json | null
          error_message?: string | null
          analysis_duration_ms?: number | null
          gemini_model_version?: string | null
          frames_analyzed?: number | null
          highest_risk_frame?: number | null
          email?: string | null
          email_captured_at?: string | null
          purchased?: boolean | null
          purchase_type?: string | null
          stripe_payment_intent_id?: string | null
          notes?: string | null
          tags?: string[] | null
          share_token?: string | null
          share_expires_at?: string | null
          created_at?: string
          completed_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      scan_findings: {
        Row: {
          id: string
          tenant_id: string | null
          scan_id: string
          finding_type: string
          severity: string
          title: string
          description: string
          recommendation: string | null
          evidence: Json | null
          confidence_score: number | null
          location_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          scan_id: string
          finding_type: string
          severity: string
          title: string
          description: string
          recommendation?: string | null
          evidence?: Json | null
          confidence_score?: number | null
          location_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          scan_id?: string
          finding_type?: string
          severity?: string
          title?: string
          description?: string
          recommendation?: string | null
          evidence?: Json | null
          confidence_score?: number | null
          location_data?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      video_frames: {
        Row: {
          id: string
          tenant_id: string | null
          scan_id: string
          frame_number: number
          timestamp_ms: number
          storage_path: string
          ip_risk_score: number | null
          safety_risk_score: number | null
          composite_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          scan_id: string
          frame_number: number
          timestamp_ms: number
          storage_path: string
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          composite_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          scan_id?: string
          frame_number?: number
          timestamp_ms?: number
          storage_path?: string
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          composite_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      brand_profiles: {
        Row: {
          id: string
          tenant_id: string
          name: string
          industry: string | null
          encrypted_guidelines: Json
          encryption_iv: string
          encryption_auth_tag: string
          is_active: boolean
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          industry?: string | null
          encrypted_guidelines: Json
          encryption_iv: string
          encryption_auth_tag: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          industry?: string | null
          encrypted_guidelines?: Json
          encryption_iv?: string
          encryption_auth_tag?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      brand_guidelines: {
        Row: {
          id: string
          tenant_id: string
          name: string
          industry: string | null
          is_default: boolean | null
          prohibitions: string[] | null
          requirements: string[] | null
          context_modifiers: string[] | null
          target_markets: string[] | null
          target_platforms: string[] | null
          last_used_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          name: string
          industry?: string | null
          is_default?: boolean | null
          prohibitions?: string[] | null
          requirements?: string[] | null
          context_modifiers?: string[] | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          last_used_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          name?: string
          industry?: string | null
          is_default?: boolean | null
          prohibitions?: string[] | null
          requirements?: string[] | null
          context_modifiers?: string[] | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          last_used_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      provenance_details: {
        Row: {
          id: string
          scan_id: string
          tenant_id: string | null
          creator_name: string | null
          creator_link: string | null
          creation_tool: string | null
          creation_tool_version: string | null
          creation_timestamp: string | null
          signature_status: string
          certificate_issuer: string | null
          certificate_serial: string | null
          hashing_algorithm: string | null
          edit_history: Json
          raw_manifest: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          tenant_id?: string | null
          creator_name?: string | null
          creator_link?: string | null
          creation_tool?: string | null
          creation_tool_version?: string | null
          creation_timestamp?: string | null
          signature_status: string
          certificate_issuer?: string | null
          certificate_serial?: string | null
          hashing_algorithm?: string | null
          edit_history?: Json
          raw_manifest?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          scan_id?: string
          tenant_id?: string | null
          creator_name?: string | null
          creator_link?: string | null
          creation_tool?: string | null
          creation_tool_version?: string | null
          creation_timestamp?: string | null
          signature_status?: string
          certificate_issuer?: string | null
          certificate_serial?: string | null
          hashing_algorithm?: string | null
          edit_history?: Json
          raw_manifest?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      usage_ledger: {
        Row: {
          id: string
          tenant_id: string
          year: number
          month: number
          scans_used: number
          overage_scans: number
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          year: number
          month: number
          scans_used?: number
          overage_scans?: number
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          year?: number
          month?: number
          scans_used?: number
          overage_scans?: number
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          tenant_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          stripe_subscription_id: string
          stripe_customer_id: string
          stripe_price_id: string
          status: string
          current_period_start: string
          current_period_end: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          stripe_subscription_id?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          status?: string
          current_period_start?: string
          current_period_end?: string
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      audit_log: {
        Row: {
          id: string
          tenant_id: string | null
          user_id: string | null
          action: string
          resource_type: string
          resource_id: string | null
          ip_address: string | null
          user_agent: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          action: string
          resource_type: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string | null
          user_id?: string | null
          action?: string
          resource_type?: string
          resource_id?: string | null
          ip_address?: string | null
          user_agent?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      mitigation_reports: {
        Row: {
          id: string
          scan_id: string
          tenant_id: string
          advice_content: string
          created_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id: string
          tenant_id: string
          advice_content: string
          created_by?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          scan_id?: string
          tenant_id?: string
          advice_content?: string
          created_by?: string | null
          created_at?: string
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          id: string
          scan_id: string | null
          tenant_id: string | null
          event_type: string
          partner: string | null
          risk_score: number | null
          created_at: string
        }
        Insert: {
          id?: string
          scan_id?: string | null
          tenant_id?: string | null
          event_type: string
          partner?: string | null
          risk_score?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          scan_id?: string | null
          tenant_id?: string | null
          event_type?: string
          partner?: string | null
          risk_score?: number | null
          created_at?: string
        }
        Relationships: []
      }
      tenant_invites: {
        Row: {
          id: string
          tenant_id: string
          email: string
          role: string
          token: string
          invited_by: string | null
          metadata: Json | null
          created_at: string
          expires_at: string
          accepted_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          email: string
          role: string
          token: string
          invited_by?: string | null
          metadata?: Json | null
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          role?: string
          token?: string
          invited_by?: string | null
          metadata?: Json | null
          created_at?: string
          expires_at?: string
          accepted_at?: string | null
        }
        Relationships: []
      }
      tenant_switch_audit: {
        Row: {
          id: string
          actor_user_id: string | null
          actor_session_id: string | null
          from_tenant_id: string | null
          to_tenant_id: string
          ip: string | null
          user_agent: string | null
          reason: string | null
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          actor_user_id?: string | null
          actor_session_id?: string | null
          from_tenant_id?: string | null
          to_tenant_id: string
          ip?: string | null
          user_agent?: string | null
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          actor_user_id?: string | null
          actor_session_id?: string | null
          from_tenant_id?: string | null
          to_tenant_id?: string
          ip?: string | null
          user_agent?: string | null
          reason?: string | null
          metadata?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      ips: {
        Row: {
          ip_hash: string
          scan_timestamps: string[] | null
          blocked_until: string | null
          created_at: string
        }
        Insert: {
          ip_hash: string
          scan_timestamps?: string[] | null
          blocked_until?: string | null
          created_at?: string
        }
        Update: {
          ip_hash?: string
          scan_timestamps?: string[] | null
          blocked_until?: string | null
          created_at?: string
        }
        Relationships: []
      }
      failed_usage_reports: {
        Row: {
          id: string
          tenant_id: string
          quantity: number
          attempts: number
          max_attempts: number
          last_error: string | null
          next_retry_at: string
          created_at: string
          resolved_at: string | null
        }
        Insert: {
          id?: string
          tenant_id: string
          quantity?: number
          attempts?: number
          max_attempts?: number
          last_error?: string | null
          next_retry_at?: string
          created_at?: string
          resolved_at?: string | null
        }
        Update: {
          id?: string
          tenant_id?: string
          quantity?: number
          attempts?: number
          max_attempts?: number
          last_error?: string | null
          next_retry_at?: string
          created_at?: string
          resolved_at?: string | null
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          id: string
          key: string
          action: string
          timestamps: string[]
          blocked_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          action: string
          timestamps?: string[]
          blocked_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          action?: string
          timestamps?: string[]
          blocked_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      consume_quota: {
        Args: {
          p_tenant_id: string
          p_amount?: number
        }
        Returns: {
          allowed: boolean
          current_usage: number
          monthly_limit: number
          remaining: number
          overage: number
        }[]
      }
      user_tenant_id: {
        Args: Record<string, never>
        Returns: string
      }
      user_role: {
        Args: Record<string, never>
        Returns: string
      }
      assign_scans_to_user: {
        Args: {
          p_session_id: string
          p_user_id: string
        }
        Returns: number
      }
      cleanup_stale_shadow_users: {
        Args: {
          days_old: number
        }
        Returns: number
      }
      claim_failed_usage_reports: {
        Args: {
          batch_limit?: number
        }
        Returns: Database['public']['Tables']['failed_usage_reports']['Row'][]
      }
      cleanup_stale_rate_limits: {
        Args: Record<string, never>
        Returns: number
      }
      check_rate_limit_atomic: {
        Args: {
          p_key: string
          p_action: string
          p_max_attempts: number
          p_window_seconds: number
          p_block_seconds?: number | null
        }
        Returns: {
          allowed: boolean
          remaining: number
          retry_after: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
