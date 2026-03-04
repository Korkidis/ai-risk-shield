export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      assets: {
        Row: {
          created_at: string
          delete_after: string
          file_size: number
          file_type: string
          filename: string
          id: string
          mime_type: string
          session_id: string | null
          sha256_checksum: string
          storage_bucket: string
          storage_path: string
          tenant_id: string | null
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          delete_after: string
          file_size: number
          file_type: string
          filename: string
          id?: string
          mime_type: string
          session_id?: string | null
          sha256_checksum: string
          storage_bucket?: string
          storage_path: string
          tenant_id?: string | null
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          delete_after?: string
          file_size?: number
          file_type?: string
          filename?: string
          id?: string
          mime_type?: string
          session_id?: string | null
          sha256_checksum?: string
          storage_bucket?: string
          storage_path?: string
          tenant_id?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assets_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_guidelines: {
        Row: {
          context_modifiers: string[] | null
          created_at: string | null
          id: string
          industry: string | null
          is_default: boolean | null
          last_used_at: string | null
          name: string
          prohibitions: string[] | null
          requirements: string[] | null
          target_markets: string[] | null
          target_platforms: string[] | null
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          context_modifiers?: string[] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_default?: boolean | null
          last_used_at?: string | null
          name: string
          prohibitions?: string[] | null
          requirements?: string[] | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          context_modifiers?: string[] | null
          created_at?: string | null
          id?: string
          industry?: string | null
          is_default?: boolean | null
          last_used_at?: string | null
          name?: string
          prohibitions?: string[] | null
          requirements?: string[] | null
          target_markets?: string[] | null
          target_platforms?: string[] | null
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_guidelines_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_profiles: {
        Row: {
          created_at: string
          encrypted_guidelines: Json
          encryption_auth_tag: string
          encryption_iv: string
          id: string
          industry: string | null
          is_active: boolean
          name: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          encrypted_guidelines: Json
          encryption_auth_tag: string
          encryption_iv: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          encrypted_guidelines?: Json
          encryption_auth_tag?: string
          encryption_iv?: string
          id?: string
          industry?: string | null
          is_active?: boolean
          name?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      failed_usage_reports: {
        Row: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string
          quantity: number
          resolved_at: string | null
          tenant_id: string
        }
        Insert: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string
          quantity?: number
          resolved_at?: string | null
          tenant_id: string
        }
        Update: {
          attempts?: number
          created_at?: string
          id?: string
          last_error?: string | null
          max_attempts?: number
          next_retry_at?: string
          quantity?: number
          resolved_at?: string | null
          tenant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "failed_usage_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      ips: {
        Row: {
          blocked_until: string | null
          created_at: string | null
          ip_hash: string
          scan_timestamps: string[] | null
        }
        Insert: {
          blocked_until?: string | null
          created_at?: string | null
          ip_hash: string
          scan_timestamps?: string[] | null
        }
        Update: {
          blocked_until?: string | null
          created_at?: string | null
          ip_hash?: string
          scan_timestamps?: string[] | null
        }
        Relationships: []
      }
      mitigation_reports: {
        Row: {
          advice_content: string
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          error_message: string | null
          generation_inputs: Json | null
          generator_version: string
          id: string
          idempotency_key: string | null
          report_content: Json | null
          report_version: number
          scan_id: string | null
          status: string
          tenant_id: string | null
        }
        Insert: {
          advice_content: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          generation_inputs?: Json | null
          generator_version?: string
          id?: string
          idempotency_key?: string | null
          report_content?: Json | null
          report_version?: number
          scan_id?: string | null
          status?: string
          tenant_id?: string | null
        }
        Update: {
          advice_content?: string
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          error_message?: string | null
          generation_inputs?: Json | null
          generator_version?: string
          id?: string
          idempotency_key?: string | null
          report_content?: Json | null
          report_version?: number
          scan_id?: string | null
          status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mitigation_reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mitigation_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      provenance_details: {
        Row: {
          certificate_issuer: string | null
          certificate_serial: string | null
          created_at: string | null
          creation_timestamp: string | null
          creation_tool: string | null
          creation_tool_version: string | null
          creator_link: string | null
          creator_name: string | null
          edit_history: Json
          hashing_algorithm: string | null
          id: string
          raw_manifest: Json | null
          scan_id: string
          signature_status: string
          tenant_id: string | null
        }
        Insert: {
          certificate_issuer?: string | null
          certificate_serial?: string | null
          created_at?: string | null
          creation_timestamp?: string | null
          creation_tool?: string | null
          creation_tool_version?: string | null
          creator_link?: string | null
          creator_name?: string | null
          edit_history?: Json
          hashing_algorithm?: string | null
          id?: string
          raw_manifest?: Json | null
          scan_id: string
          signature_status: string
          tenant_id?: string | null
        }
        Update: {
          certificate_issuer?: string | null
          certificate_serial?: string | null
          created_at?: string | null
          creation_timestamp?: string | null
          creation_tool?: string | null
          creation_tool_version?: string | null
          creator_link?: string | null
          creator_name?: string | null
          edit_history?: Json
          hashing_algorithm?: string | null
          id?: string
          raw_manifest?: Json | null
          scan_id?: string
          signature_status?: string
          tenant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "provenance_details_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: true
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provenance_details_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          action: string
          blocked_until: string | null
          created_at: string | null
          id: string
          key: string
          timestamps: string[]
          updated_at: string | null
        }
        Insert: {
          action: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          key: string
          timestamps?: string[]
          updated_at?: string | null
        }
        Update: {
          action?: string
          blocked_until?: string | null
          created_at?: string | null
          id?: string
          key?: string
          timestamps?: string[]
          updated_at?: string | null
        }
        Relationships: []
      }
      referral_events: {
        Row: {
          created_at: string | null
          event_type: string
          id: string
          partner: string | null
          risk_score: number | null
          scan_id: string | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          event_type: string
          id?: string
          partner?: string | null
          risk_score?: number | null
          scan_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          event_type?: string
          id?: string
          partner?: string | null
          risk_score?: number | null
          scan_id?: string | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referral_events_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_events_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_findings: {
        Row: {
          confidence_score: number | null
          created_at: string
          description: string
          evidence: Json | null
          finding_type: string
          id: string
          location_data: Json | null
          recommendation: string
          scan_id: string
          severity: string
          tenant_id: string | null
          title: string
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          description: string
          evidence?: Json | null
          finding_type: string
          id?: string
          location_data?: Json | null
          recommendation: string
          scan_id: string
          severity: string
          tenant_id?: string | null
          title: string
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          description?: string
          evidence?: Json | null
          finding_type?: string
          id?: string
          location_data?: Json | null
          recommendation?: string
          scan_id?: string
          severity?: string
          tenant_id?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "scan_findings_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scan_findings_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      scans: {
        Row: {
          analysis_duration_ms: number | null
          analyzed_by: string | null
          asset_id: string
          brand_profile_id: string | null
          completed_at: string | null
          composite_score: number | null
          created_at: string
          email: string | null
          email_captured_at: string | null
          error_message: string | null
          frames_analyzed: number | null
          gemini_model_version: string | null
          guideline_id: string | null
          highest_risk_frame: number | null
          id: string
          ip_hash: string | null
          ip_risk_score: number | null
          is_video: boolean
          notes: string | null
          provenance_data: Json | null
          provenance_risk_score: number | null
          provenance_status: string | null
          purchase_type: string | null
          purchased: boolean | null
          purchased_by: string | null
          risk_level: string | null
          risk_profile: Json | null
          safety_risk_score: number | null
          session_id: string | null
          share_expires_at: string | null
          share_token: string | null
          status: string
          stripe_payment_intent_id: string | null
          tags: string[] | null
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          analysis_duration_ms?: number | null
          analyzed_by?: string | null
          asset_id: string
          brand_profile_id?: string | null
          completed_at?: string | null
          composite_score?: number | null
          created_at?: string
          email?: string | null
          email_captured_at?: string | null
          error_message?: string | null
          frames_analyzed?: number | null
          gemini_model_version?: string | null
          guideline_id?: string | null
          highest_risk_frame?: number | null
          id?: string
          ip_hash?: string | null
          ip_risk_score?: number | null
          is_video?: boolean
          notes?: string | null
          provenance_data?: Json | null
          provenance_risk_score?: number | null
          provenance_status?: string | null
          purchase_type?: string | null
          purchased?: boolean | null
          purchased_by?: string | null
          risk_level?: string | null
          risk_profile?: Json | null
          safety_risk_score?: number | null
          session_id?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          analysis_duration_ms?: number | null
          analyzed_by?: string | null
          asset_id?: string
          brand_profile_id?: string | null
          completed_at?: string | null
          composite_score?: number | null
          created_at?: string
          email?: string | null
          email_captured_at?: string | null
          error_message?: string | null
          frames_analyzed?: number | null
          gemini_model_version?: string | null
          guideline_id?: string | null
          highest_risk_frame?: number | null
          id?: string
          ip_hash?: string | null
          ip_risk_score?: number | null
          is_video?: boolean
          notes?: string | null
          provenance_data?: Json | null
          provenance_risk_score?: number | null
          provenance_status?: string | null
          purchase_type?: string | null
          purchased?: boolean | null
          purchased_by?: string | null
          risk_level?: string | null
          risk_profile?: Json | null
          safety_risk_score?: number | null
          session_id?: string | null
          share_expires_at?: string | null
          share_token?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          tags?: string[] | null
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scans_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_brand_profile_id_fkey"
            columns: ["brand_profile_id"]
            isOneToOne: false
            referencedRelation: "brand_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_guideline_id_fkey"
            columns: ["guideline_id"]
            isOneToOne: false
            referencedRelation: "brand_guidelines"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scans_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean
          canceled_at: string | null
          created_at: string
          current_period_end: string
          current_period_start: string
          id: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          tenant_id: string
          updated_at: string
        }
        Insert: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end: string
          current_period_start: string
          id?: string
          status: string
          stripe_customer_id: string
          stripe_price_id: string
          stripe_subscription_id: string
          tenant_id: string
          updated_at?: string
        }
        Update: {
          cancel_at_period_end?: boolean
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          status?: string
          stripe_customer_id?: string
          stripe_price_id?: string
          stripe_subscription_id?: string
          tenant_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_invites: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          email: string
          expires_at: string | null
          id: string
          invited_by: string | null
          metadata: Json | null
          role: string
          tenant_id: string | null
          token: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          email: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          role: string
          tenant_id?: string | null
          token?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          invited_by?: string | null
          metadata?: Json | null
          role?: string
          tenant_id?: string | null
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_invites_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_switch_audit: {
        Row: {
          actor_session_id: string | null
          actor_user_id: string | null
          created_at: string | null
          from_tenant_id: string | null
          id: string
          ip: unknown
          metadata: Json | null
          reason: string | null
          to_tenant_id: string
          user_agent: string | null
        }
        Insert: {
          actor_session_id?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          from_tenant_id?: string | null
          id?: string
          ip?: unknown
          metadata?: Json | null
          reason?: string | null
          to_tenant_id: string
          user_agent?: string | null
        }
        Update: {
          actor_session_id?: string | null
          actor_user_id?: string | null
          created_at?: string | null
          from_tenant_id?: string | null
          id?: string
          ip?: unknown
          metadata?: Json | null
          reason?: string | null
          to_tenant_id?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_switch_audit_from_tenant_id_fkey"
            columns: ["from_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_switch_audit_to_tenant_id_fkey"
            columns: ["to_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenants: {
        Row: {
          billing_period_start: string | null
          brand_profile_limit: number
          created_at: string
          current_period_end: string
          current_period_start: string
          feature_audit_logs: boolean
          feature_bulk_upload: boolean
          feature_co_branding: boolean
          feature_priority_queue: boolean
          feature_sso: boolean
          feature_team_dashboard: boolean
          feature_white_label: boolean
          id: string
          mitigations_used_this_month: number
          monthly_mitigation_limit: number
          monthly_report_limit: number
          monthly_scan_limit: number
          name: string
          parent_tenant_id: string | null
          plan: string
          report_overage_cost_cents: number
          retention_days: number
          scan_overage_cost_cents: number
          scans_used_this_month: number | null
          seat_limit: number
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          updated_at: string
          usage_limit_mitigation: number | null
        }
        Insert: {
          billing_period_start?: string | null
          brand_profile_limit?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          feature_audit_logs?: boolean
          feature_bulk_upload?: boolean
          feature_co_branding?: boolean
          feature_priority_queue?: boolean
          feature_sso?: boolean
          feature_team_dashboard?: boolean
          feature_white_label?: boolean
          id?: string
          mitigations_used_this_month?: number
          monthly_mitigation_limit?: number
          monthly_report_limit?: number
          monthly_scan_limit?: number
          name: string
          parent_tenant_id?: string | null
          plan?: string
          report_overage_cost_cents?: number
          retention_days?: number
          scan_overage_cost_cents?: number
          scans_used_this_month?: number | null
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          usage_limit_mitigation?: number | null
        }
        Update: {
          billing_period_start?: string | null
          brand_profile_limit?: number
          created_at?: string
          current_period_end?: string
          current_period_start?: string
          feature_audit_logs?: boolean
          feature_bulk_upload?: boolean
          feature_co_branding?: boolean
          feature_priority_queue?: boolean
          feature_sso?: boolean
          feature_team_dashboard?: boolean
          feature_white_label?: boolean
          id?: string
          mitigations_used_this_month?: number
          monthly_mitigation_limit?: number
          monthly_report_limit?: number
          monthly_scan_limit?: number
          name?: string
          parent_tenant_id?: string | null
          plan?: string
          report_overage_cost_cents?: number
          retention_days?: number
          scan_overage_cost_cents?: number
          scans_used_this_month?: number | null
          seat_limit?: number
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          updated_at?: string
          usage_limit_mitigation?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenants_parent_fkey"
            columns: ["parent_tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      usage_ledger: {
        Row: {
          created_at: string
          id: string
          month: number
          overage_reports: number
          overage_scans: number
          reports_used: number
          scans_used: number
          tenant_id: string
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          id?: string
          month: number
          overage_reports?: number
          overage_scans?: number
          reports_used?: number
          scans_used?: number
          tenant_id: string
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          id?: string
          month?: number
          overage_reports?: number
          overage_scans?: number
          reports_used?: number
          scans_used?: number
          tenant_id?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "usage_ledger_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      video_frames: {
        Row: {
          composite_score: number | null
          created_at: string
          frame_number: number
          id: string
          ip_risk_score: number | null
          safety_risk_score: number | null
          scan_id: string
          storage_path: string
          tenant_id: string
          timestamp_ms: number
        }
        Insert: {
          composite_score?: number | null
          created_at?: string
          frame_number: number
          id?: string
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          scan_id: string
          storage_path: string
          tenant_id: string
          timestamp_ms: number
        }
        Update: {
          composite_score?: number | null
          created_at?: string
          frame_number?: number
          id?: string
          ip_risk_score?: number | null
          safety_risk_score?: number | null
          scan_id?: string
          storage_path?: string
          tenant_id?: string
          timestamp_ms?: number
        }
        Relationships: [
          {
            foreignKeyName: "video_frames_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "video_frames_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "tenants"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      assign_scans_to_user:
        | { Args: { p_session_id: string; p_user_id: string }; Returns: number }
        | { Args: { p_session_id: string; p_user_id: string }; Returns: number }
      check_rate_limit_atomic: {
        Args: {
          p_action: string
          p_block_seconds?: number
          p_key: string
          p_max_attempts: number
          p_window_seconds: number
        }
        Returns: {
          allowed: boolean
          remaining: number
          retry_after: number
        }[]
      }
      claim_failed_usage_reports: {
        Args: { batch_limit?: number }
        Returns: {
          attempts: number
          created_at: string
          id: string
          last_error: string | null
          max_attempts: number
          next_retry_at: string
          quantity: number
          resolved_at: string | null
          tenant_id: string
        }[]
        SetofOptions: {
          from: "*"
          to: "failed_usage_reports"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      cleanup_stale_rate_limits: { Args: never; Returns: number }
      cleanup_stale_shadow_users: {
        Args: { days_old: number }
        Returns: number
      }
      consume_mitigation_quota: {
        Args: { p_amount?: number; p_tenant_id: string }
        Returns: {
          allowed: boolean
          current_usage: number
          monthly_limit: number
          remaining: number
        }[]
      }
      consume_quota: {
        Args: { p_amount?: number; p_tenant_id: string }
        Returns: {
          allowed: boolean
          current_usage: number
          monthly_limit: number
          overage: number
          remaining: number
        }[]
      }
      current_session_id: { Args: never; Returns: string }
      increment_tenant_mitigation_usage: {
        Args: { p_amount?: number; p_tenant_id: string }
        Returns: number
      }
      increment_tenant_scan_usage: {
        Args: { p_amount?: number; p_tenant_id: string }
        Returns: number
      }
      get_active_tenant: { Args: never; Returns: string }
      get_user_tenant_id: { Args: { p_user: string }; Returns: string }
      is_agency_admin: { Args: never; Returns: boolean }
      user_role: { Args: never; Returns: string }
      user_tenant_id: { Args: never; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
