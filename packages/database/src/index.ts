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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      admin_audit_logs: {
        Row: {
          action: string
          actor_admin_member_id: string | null
          actor_role: Database["public"]["Enums"]["admin_member_role"] | null
          actor_user_id: string | null
          created_at: string
          id: string
          metadata: Json
          request_id: string | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          actor_admin_member_id?: string | null
          actor_role?: Database["public"]["Enums"]["admin_member_role"] | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          request_id?: string | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          actor_admin_member_id?: string | null
          actor_role?: Database["public"]["Enums"]["admin_member_role"] | null
          actor_user_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          request_id?: string | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_logs_actor_admin_member_id_fkey"
            columns: ["actor_admin_member_id"]
            isOneToOne: false
            referencedRelation: "admin_members"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_environment: {
        Row: {
          configured_at: string
          environment: Database["public"]["Enums"]["deployment_environment"]
          singleton: boolean
        }
        Insert: {
          configured_at?: string
          environment: Database["public"]["Enums"]["deployment_environment"]
          singleton?: boolean
        }
        Update: {
          configured_at?: string
          environment?: Database["public"]["Enums"]["deployment_environment"]
          singleton?: boolean
        }
        Relationships: []
      }
      admin_members: {
        Row: {
          created_at: string
          created_by: string | null
          display_name: string | null
          id: string
          last_modified_by: string | null
          role: Database["public"]["Enums"]["admin_member_role"]
          status: Database["public"]["Enums"]["admin_member_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: string
          last_modified_by?: string | null
          role: Database["public"]["Enums"]["admin_member_role"]
          status?: Database["public"]["Enums"]["admin_member_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_name?: string | null
          id?: string
          last_modified_by?: string | null
          role?: Database["public"]["Enums"]["admin_member_role"]
          status?: Database["public"]["Enums"]["admin_member_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      admin_role_permissions: {
        Row: {
          permission: Database["public"]["Enums"]["admin_permission"]
          role: Database["public"]["Enums"]["admin_member_role"]
        }
        Insert: {
          permission: Database["public"]["Enums"]["admin_permission"]
          role: Database["public"]["Enums"]["admin_member_role"]
        }
        Update: {
          permission?: Database["public"]["Enums"]["admin_permission"]
          role?: Database["public"]["Enums"]["admin_member_role"]
        }
        Relationships: []
      }
      application_settings: {
        Row: {
          created_at: string
          environment: Database["public"]["Enums"]["deployment_environment"]
          id: string
          key: Database["public"]["Enums"]["application_setting_key"]
          updated_at: string
          updated_by: string | null
          value: string
        }
        Insert: {
          created_at?: string
          environment: Database["public"]["Enums"]["deployment_environment"]
          id?: string
          key: Database["public"]["Enums"]["application_setting_key"]
          updated_at?: string
          updated_by?: string | null
          value: string
        }
        Update: {
          created_at?: string
          environment?: Database["public"]["Enums"]["deployment_environment"]
          id?: string
          key?: Database["public"]["Enums"]["application_setting_key"]
          updated_at?: string
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_members"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string
          description: string
          enabled: boolean
          environment: Database["public"]["Enums"]["deployment_environment"]
          id: string
          key: Database["public"]["Enums"]["feature_flag_key"]
          metadata: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          description: string
          enabled?: boolean
          environment: Database["public"]["Enums"]["deployment_environment"]
          id?: string
          key: Database["public"]["Enums"]["feature_flag_key"]
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          enabled?: boolean
          environment?: Database["public"]["Enums"]["deployment_environment"]
          id?: string
          key?: Database["public"]["Enums"]["feature_flag_key"]
          metadata?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "admin_members"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist_signups: {
        Row: {
          confirmation_sent_at: string | null
          consent_at: string | null
          converted_at: string | null
          converted_user_id: string | null
          created_at: string
          email: string
          first_name: string | null
          id: string
          locale: string | null
          marketing_consent: boolean
          platform_interest: Database["public"]["Enums"]["waitlist_platform_interest"]
          referral_code: string | null
          referred_by: string | null
          resend_contact_id: string | null
          source: Database["public"]["Enums"]["waitlist_signup_source"]
          status: Database["public"]["Enums"]["waitlist_signup_status"]
          updated_at: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          confirmation_sent_at?: string | null
          consent_at?: string | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          email: string
          first_name?: string | null
          id?: string
          locale?: string | null
          marketing_consent?: boolean
          platform_interest: Database["public"]["Enums"]["waitlist_platform_interest"]
          referral_code?: string | null
          referred_by?: string | null
          resend_contact_id?: string | null
          source?: Database["public"]["Enums"]["waitlist_signup_source"]
          status?: Database["public"]["Enums"]["waitlist_signup_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          confirmation_sent_at?: string | null
          consent_at?: string | null
          converted_at?: string | null
          converted_user_id?: string | null
          created_at?: string
          email?: string
          first_name?: string | null
          id?: string
          locale?: string | null
          marketing_consent?: boolean
          platform_interest?: Database["public"]["Enums"]["waitlist_platform_interest"]
          referral_code?: string | null
          referred_by?: string | null
          resend_contact_id?: string | null
          source?: Database["public"]["Enums"]["waitlist_signup_source"]
          status?: Database["public"]["Enums"]["waitlist_signup_status"]
          updated_at?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_referred_by_fkey"
            columns: ["referred_by"]
            isOneToOne: false
            referencedRelation: "waitlist_signups"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_create_member: {
        Args: {
          p_display_name?: string
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_request_id?: string
          p_role: Database["public"]["Enums"]["admin_member_role"]
          p_status?: Database["public"]["Enums"]["admin_member_status"]
          p_user_id: string
        }
        Returns: Json
      }
      admin_export_waitlist: {
        Args: {
          p_campaign?: string
          p_converted?: boolean
          p_date_from?: string
          p_date_to?: string
          p_email_status?: string
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_limit?: number
          p_platform?: Database["public"]["Enums"]["waitlist_platform_interest"]
          p_request_id?: string
          p_search?: string
          p_source?: Database["public"]["Enums"]["waitlist_signup_source"]
          p_status?: Database["public"]["Enums"]["waitlist_signup_status"]
        }
        Returns: {
          confirmation_send_requested: boolean
          confirmation_sent_at: string
          consent_at: string
          converted: boolean
          converted_at: string
          created_at: string
          email: string
          first_name: string
          id: string
          locale: string
          marketing_consent: boolean
          platform_interest: string
          referral_code: string
          referred_by_code: string
          source: string
          status: string
          updated_at: string
          utm_campaign: string
          utm_content: string
          utm_medium: string
          utm_source: string
          utm_term: string
        }[]
      }
      admin_get_current_member:
        | { Args: never; Returns: Json }
        | {
            Args: {
              p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
            }
            Returns: Json
          }
      admin_get_dashboard: { Args: { p_days?: number }; Returns: Json }
      admin_get_referral_analytics: {
        Args: {
          p_date_from?: string
          p_date_to?: string
          p_limit?: number
          p_offset?: number
        }
        Returns: Json
      }
      admin_get_waitlist_analytics: {
        Args: { p_date_from?: string; p_date_to?: string }
        Returns: Json
      }
      admin_get_waitlist_lead: { Args: { p_signup_id: string }; Returns: Json }
      admin_list_application_settings: {
        Args: never
        Returns: {
          environment: Database["public"]["Enums"]["deployment_environment"]
          id: string
          key: Database["public"]["Enums"]["application_setting_key"]
          updated_at: string
          updated_by: string
          updated_by_email: string
          value: string
        }[]
      }
      admin_list_audit_logs: {
        Args: {
          p_action?: string
          p_actor_member_id?: string
          p_date_from?: string
          p_date_to?: string
          p_page?: number
          p_page_size?: number
          p_target_id?: string
          p_target_type?: string
        }
        Returns: {
          action: string
          actor_display_name: string
          actor_email: string
          actor_member_id: string
          actor_role: Database["public"]["Enums"]["admin_member_role"]
          actor_user_id: string
          created_at: string
          id: string
          metadata: Json
          request_id: string
          target_id: string
          target_type: string
          total_count: number
        }[]
      }
      admin_list_feature_flags: {
        Args: never
        Returns: {
          description: string
          enabled: boolean
          environment: Database["public"]["Enums"]["deployment_environment"]
          id: string
          key: Database["public"]["Enums"]["feature_flag_key"]
          metadata: Json
          updated_at: string
          updated_by: string
          updated_by_email: string
        }[]
      }
      admin_list_members: {
        Args: {
          p_page?: number
          p_page_size?: number
          p_role?: Database["public"]["Enums"]["admin_member_role"]
          p_search?: string
          p_status?: Database["public"]["Enums"]["admin_member_status"]
        }
        Returns: {
          created_at: string
          created_by: string
          display_name: string
          email: string
          id: string
          last_modified_by: string
          role: Database["public"]["Enums"]["admin_member_role"]
          status: Database["public"]["Enums"]["admin_member_status"]
          total_count: number
          updated_at: string
          user_id: string
        }[]
      }
      admin_list_waitlist: {
        Args: {
          p_campaign?: string
          p_converted?: boolean
          p_date_from?: string
          p_date_to?: string
          p_email_status?: string
          p_page?: number
          p_page_size?: number
          p_platform?: Database["public"]["Enums"]["waitlist_platform_interest"]
          p_search?: string
          p_sort?: string
          p_source?: Database["public"]["Enums"]["waitlist_signup_source"]
          p_status?: Database["public"]["Enums"]["waitlist_signup_status"]
        }
        Returns: {
          converted: boolean
          created_at: string
          email: string
          email_status: string
          first_name: string
          id: string
          platform_interest: Database["public"]["Enums"]["waitlist_platform_interest"]
          referral_code: string
          referred_by_code: string
          source: Database["public"]["Enums"]["waitlist_signup_source"]
          status: Database["public"]["Enums"]["waitlist_signup_status"]
          total_count: number
          updated_at: string
          utm_campaign: string
          utm_source: string
        }[]
      }
      admin_update_application_setting: {
        Args: {
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_key: Database["public"]["Enums"]["application_setting_key"]
          p_request_id?: string
          p_value: string
        }
        Returns: Json
      }
      admin_update_feature_flag: {
        Args: {
          p_enabled: boolean
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_key: Database["public"]["Enums"]["feature_flag_key"]
          p_request_id?: string
        }
        Returns: Json
      }
      admin_update_member: {
        Args: {
          p_display_name?: string
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_member_id: string
          p_request_id?: string
          p_role: Database["public"]["Enums"]["admin_member_role"]
          p_status: Database["public"]["Enums"]["admin_member_status"]
        }
        Returns: Json
      }
      admin_update_waitlist_status: {
        Args: {
          p_expected_environment: Database["public"]["Enums"]["deployment_environment"]
          p_request_id?: string
          p_signup_id: string
          p_status: Database["public"]["Enums"]["waitlist_signup_status"]
        }
        Returns: Json
      }
      is_waitlist_enabled: { Args: never; Returns: boolean }
    }
    Enums: {
      admin_member_role: "super_admin" | "admin" | "analyst" | "support"
      admin_member_status: "active" | "suspended"
      admin_permission:
        | "dashboard.read"
        | "waitlist.read"
        | "waitlist.status.write"
        | "waitlist.export"
        | "analytics.read"
        | "referrals.read"
        | "audit.read"
        | "admins.read"
        | "admins.write"
        | "feature_flags.read"
        | "feature_flags.write"
        | "settings.read"
        | "settings.write"
      application_setting_key: "support_url" | "privacy_url" | "terms_url"
      deployment_environment: "development" | "staging" | "production"
      feature_flag_key: "waitlist_enabled"
      waitlist_platform_interest: "ios" | "android" | "both"
      waitlist_signup_source:
        | "landing_page"
        | "direct"
        | "referral"
        | "organic"
        | "social"
        | "other"
      waitlist_signup_status:
        | "pending"
        | "confirmed"
        | "invited"
        | "converted"
        | "unsubscribed"
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
    Enums: {
      admin_member_role: ["super_admin", "admin", "analyst", "support"],
      admin_member_status: ["active", "suspended"],
      admin_permission: [
        "dashboard.read",
        "waitlist.read",
        "waitlist.status.write",
        "waitlist.export",
        "analytics.read",
        "referrals.read",
        "audit.read",
        "admins.read",
        "admins.write",
        "feature_flags.read",
        "feature_flags.write",
        "settings.read",
        "settings.write",
      ],
      application_setting_key: ["support_url", "privacy_url", "terms_url"],
      deployment_environment: ["development", "staging", "production"],
      feature_flag_key: ["waitlist_enabled"],
      waitlist_platform_interest: ["ios", "android", "both"],
      waitlist_signup_source: [
        "landing_page",
        "direct",
        "referral",
        "organic",
        "social",
        "other",
      ],
      waitlist_signup_status: [
        "pending",
        "confirmed",
        "invited",
        "converted",
        "unsubscribed",
      ],
    },
  },
} as const
