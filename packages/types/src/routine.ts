export type RoutineCategory = 'EXERCISE' | 'LEARNING' | 'SELF_CARE' | 'HABIT';

export type DifficultyLevel = 1 | 2 | 3 | 4 | 5;

export type TargetType = 'TIME' | 'COUNT';

export type RoutineFrequency = 'DAILY' | 'WEEKLY_DAYS';

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6; // 0: Sunday, 1: Monday, ... 6: Saturday

export type RoutineStatus = 'ACTIVE' | 'PAUSED' | 'DELETED';

export interface Routine {
  id: string;
  title: string;
  description?: string;
  category: RoutineCategory;
  difficultyLevel: DifficultyLevel;
  targetType: TargetType;
  targetValue: number; // e.g., minutes (30) or reps (50)
  targetUnit: string; // e.g., '분', '회', '쪽'
  frequencyType: RoutineFrequency;
  targetDaysOfWeek: DayOfWeek[]; // e.g. [1, 2, 3, 4, 5] for Mon-Fri
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  status: RoutineStatus;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface CreateRoutineInput {
  title: string;
  description?: string;
  category: RoutineCategory;
  difficultyLevel?: DifficultyLevel;
  targetType: TargetType;
  targetValue: number;
  targetUnit?: string;
  frequencyType: RoutineFrequency;
  targetDaysOfWeek?: DayOfWeek[];
  startDate?: string;
  endDate?: string;
}

export interface UpdateRoutineInput {
  id: string;
  title?: string;
  description?: string;
  category?: RoutineCategory;
  difficultyLevel?: DifficultyLevel;
  targetType?: TargetType;
  targetValue?: number;
  targetUnit?: string;
  frequencyType?: RoutineFrequency;
  targetDaysOfWeek?: DayOfWeek[];
  status?: RoutineStatus;
  endDate?: string;
}
