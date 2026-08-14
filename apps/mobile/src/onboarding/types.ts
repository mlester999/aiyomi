import type {
  CompanionKey,
  CompanionPersonality,
  EnergyBaseline,
  LifeRoleKey,
  NotificationPermissionStatus,
  NotificationPreferenceValues,
  ObstacleKey,
  PreAuthIntent,
} from "@aiyomi/types";

import type {
  CompanionDefinition,
  FixedCommitment,
  LifeAreaDefinition,
  MobileProfile,
  NotificationPreferences,
  UserCompanion,
} from "../data/types";

export interface EditableCommitment {
  id: string;
  title: string;
  daysOfWeek: number[];
  startTime: string;
  endTime: string;
}

export interface OnboardingValues {
  preferredName: string;
  companionKey: CompanionKey | null;
  companionDefinitionId: string | null;
  companionName: string;
  personality: CompanionPersonality;
  lifeAreaKeys: string[];
  customLifeAreas: string[];
  wakeTime: string;
  sleepTime: string;
  lifeRoles: LifeRoleKey[];
  commitments: EditableCommitment[];
  improvementFocus: string;
  obstacles: ObstacleKey[];
  customObstacle: string;
  energyBaseline: EnergyBaseline | null;
  preAuthIntent: PreAuthIntent | null;
  permissionStatus: NotificationPermissionStatus;
  notificationPreferences: NotificationPreferenceValues;
  quietHoursEnabled: boolean;
  quietStart: string;
  quietEnd: string;
}

export interface OnboardingSnapshot {
  profile: MobileProfile;
  companionDefinitions: CompanionDefinition[];
  userCompanion: UserCompanion | null;
  lifeAreaDefinitions: LifeAreaDefinition[];
  activeLifeRoleKeys: LifeRoleKey[];
  values: OnboardingValues;
  rawCommitments: FixedCommitment[];
  notificationPreferences: NotificationPreferences | null;
}
