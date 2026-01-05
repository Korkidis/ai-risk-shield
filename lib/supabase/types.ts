/**
 * Database type definitions
 *
 * These types are manually defined to match our schema
 * In production, you can generate these from Supabase CLI
 *
 * For now, we define the core types we'll use
 */

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
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          plan?: string
          monthly_scan_limit?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          plan?: string
          monthly_scan_limit?: number
          created_at?: string
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          tenant_id: string
          email: string
          full_name: string | null
          role: 'owner' | 'admin' | 'member'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          tenant_id: string
          email: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          email?: string
          full_name?: string | null
          role?: 'owner' | 'admin' | 'member'
          created_at?: string
          updated_at?: string
        }
      }
      scans: {
        Row: {
          id: string
          tenant_id: string
          user_id: string
          file_url: string
          file_path: string
          file_name: string
          file_size: number
          file_type: string
          status: string
          overall_risk_level: string | null
          overall_risk_score: number | null
          ip_risk_level: string | null
          ip_risk_score: number | null
          brand_safety_risk_level: string | null
          brand_safety_risk_score: number | null
          c2pa_verified: boolean | null
          completed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tenant_id: string
          user_id: string
          file_url: string
          file_path: string
          file_name: string
          file_size: number
          file_type: string
          status?: string
          overall_risk_level?: string | null
          overall_risk_score?: number | null
          ip_risk_level?: string | null
          ip_risk_score?: number | null
          brand_safety_risk_level?: string | null
          brand_safety_risk_score?: number | null
          c2pa_verified?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tenant_id?: string
          user_id?: string
          file_url?: string
          file_path?: string
          file_name?: string
          file_size?: number
          file_type?: string
          status?: string
          overall_risk_level?: string | null
          overall_risk_score?: number | null
          ip_risk_level?: string | null
          ip_risk_score?: number | null
          brand_safety_risk_level?: string | null
          brand_safety_risk_score?: number | null
          c2pa_verified?: boolean | null
          completed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      // Add other tables as needed
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
    }
    Enums: {
      [_ in never]: never
    }
  }
}
