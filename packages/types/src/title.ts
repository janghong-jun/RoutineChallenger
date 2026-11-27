import { RoutineCategory } from './routine';

export type TitleRequirementType =
  | 'DEFAULT'
  | 'TOTAL_EXP'
  | 'TOTAL_COMPLETED_DAYS'
  | 'STREAK'
  | 'CATEGORY_PRACTICE';

export interface TitleRequirement {
  type: TitleRequirementType;
  value: number;
  category?: RoutineCategory;
}

export interface Title {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: TitleRequirement;
  isUnlocked: boolean;
  unlockedAt?: string; // ISO string
}

export interface UserProfile {
  id: string;
  totalExp: number;
  selectedTitleId: string;
  unlockedTitleIds: string[];
  createdAt: string;
  updatedAt: string;
}
