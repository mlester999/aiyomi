export type OnboardingStatus = "not_started" | "in_progress" | "completed";
export type OnboardingStep =
  | "preferred_name"
  | "companion_selection"
  | "companion_name"
  | "companion_personality"
  | "life_areas"
  | "normal_day"
  | "life_roles"
  | "fixed_commitments"
  | "improvement_focus"
  | "obstacles"
  | "energy_baseline"
  | "notification_setup";

export interface MobileProfile {
  id: string;
  first_name: string | null;
  timezone: string | null;
  locale: string | null;
  onboarding_status: OnboardingStatus;
  onboarding_step: OnboardingStep | null;
  onboarding_completed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface CompanionDefinition {
  id: string;
  key: "mori" | "lumi" | "piko";
  name: string;
  description: string;
  asset_key: string;
  active: boolean;
  sort_order: number;
}

export interface UserCompanion {
  user_id: string;
  companion_definition_id: string;
  custom_name: string;
  personality: "gentle" | "balanced" | "coach";
  created_at: string;
  updated_at: string;
}

export interface LifeAreaDefinition {
  id: string;
  key: string;
  name: string;
  active: boolean;
  sort_order: number;
}

export interface FixedCommitment {
  id: string;
  user_id: string;
  title: string;
  days_of_week: number[];
  start_time: string;
  end_time: string;
  timezone: string;
  active: boolean;
}

export interface NotificationPreferences {
  user_id: string;
  morning_plan: boolean;
  upcoming_activity: boolean;
  schedule_adjustments: boolean;
  focus_reminder: boolean;
  break_finished: boolean;
  daily_reflection: boolean;
  weekly_recap: boolean;
  streak_reminder: boolean;
  achievements: boolean;
  quiet_hours_enabled: boolean;
  quiet_start: string;
  quiet_end: string;
  timezone: string;
  created_at?: string;
  updated_at?: string;
}

export interface MobileBootstrapData {
  profile: MobileProfile;
  companion: (UserCompanion & { companion_definitions: CompanionDefinition }) | null;
}
