import type {
  WaitlistPlatformInterest,
  WaitlistSource,
  WaitlistStatus,
} from "@aiyomi/types";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type WaitlistSignupRow = {
  id: string;
  email: string;
  first_name: string | null;
  platform_interest: WaitlistPlatformInterest;
  status: WaitlistStatus;
  source: WaitlistSource;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  referral_code: string | null;
  referred_by: string | null;
  locale: string | null;
  marketing_consent: boolean;
  consent_at: string | null;
  resend_contact_id: string | null;
  confirmation_sent_at: string | null;
  converted_user_id: string | null;
  converted_at: string | null;
  created_at: string;
  updated_at: string;
};

export type WaitlistSignupInsert = {
  id?: string;
  email: string;
  first_name?: string | null;
  platform_interest: WaitlistPlatformInterest;
  status?: WaitlistStatus;
  source?: WaitlistSource;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  referral_code?: string | null;
  referred_by?: string | null;
  locale?: string | null;
  marketing_consent?: boolean;
  consent_at?: string | null;
  resend_contact_id?: string | null;
  confirmation_sent_at?: string | null;
  converted_user_id?: string | null;
  converted_at?: string | null;
  created_at?: string;
  updated_at?: string;
};

export type WaitlistSignupUpdate = Partial<WaitlistSignupInsert>;

export type Database = {
  public: {
    Tables: {
      waitlist_signups: {
        Row: WaitlistSignupRow;
        Insert: WaitlistSignupInsert;
        Update: WaitlistSignupUpdate;
        Relationships: [
          {
            foreignKeyName: "waitlist_signups_referred_by_fkey";
            columns: ["referred_by"];
            isOneToOne: false;
            referencedRelation: "waitlist_signups";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      waitlist_platform_interest: WaitlistPlatformInterest;
      waitlist_signup_status: WaitlistStatus;
      waitlist_signup_source: WaitlistSource;
    };
    CompositeTypes: Record<never, never>;
  };
};
