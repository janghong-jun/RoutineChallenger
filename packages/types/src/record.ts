export interface RoutineRecord {
  id: string; // `${routineId}_${date}`
  routineId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  actualValue: number;
  expGained: number;
  expDeducted: number;
  isHoliday: boolean;
  note?: string;
  completedAt?: string; // ISO string
}

export interface ToggleRecordInput {
  routineId: string;
  date: string; // YYYY-MM-DD
  completed: boolean;
  actualValue?: number;
  isHoliday?: boolean;
}
