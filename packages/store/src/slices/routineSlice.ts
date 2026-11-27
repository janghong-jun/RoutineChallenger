import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DifficultyLevel, Routine, RoutineCategory } from '@routine-challenger/types';

export interface RoutineState {
  routines: Routine[];
  selectedCategory: RoutineCategory | 'ALL';
  isLoading: boolean;
  error: string | null;
}

const initialState: RoutineState = {
  routines: [],
  selectedCategory: 'ALL',
  isLoading: false,
  error: null,
};

export const routineSlice = createSlice({
  name: 'routine',
  initialState,
  reducers: {
    setRoutines(state, action: PayloadAction<Routine[]>) {
      state.routines = action.payload;
    },
    addRoutine(state, action: PayloadAction<Routine>) {
      state.routines.push(action.payload);
    },
    updateRoutine(state, action: PayloadAction<Routine>) {
      const index = state.routines.findIndex(r => r.id === action.payload.id);
      if (index >= 0) {
        state.routines[index] = action.payload;
      }
    },
    pauseRoutine(state, action: PayloadAction<string>) {
      const routine = state.routines.find(r => r.id === action.payload);
      if (routine) {
        routine.status = 'PAUSED';
        routine.updatedAt = new Date().toISOString();
      }
    },
    resumeRoutine(state, action: PayloadAction<string>) {
      const routine = state.routines.find(r => r.id === action.payload);
      if (routine) {
        routine.status = 'ACTIVE';
        routine.updatedAt = new Date().toISOString();
      }
    },
    deleteRoutine(state, action: PayloadAction<string>) {
      const routine = state.routines.find(r => r.id === action.payload);
      if (routine) {
        // 기록 보존을 위해 상태를 DELETED로 변경
        routine.status = 'DELETED';
        routine.updatedAt = new Date().toISOString();
      }
    },
    increaseDifficulty(state, action: PayloadAction<{ id: string; newLevel: DifficultyLevel; newTargetValue: number }>) {
      const routine = state.routines.find(r => r.id === action.payload.id);
      if (routine) {
        routine.difficultyLevel = action.payload.newLevel;
        routine.targetValue = action.payload.newTargetValue;
        routine.updatedAt = new Date().toISOString();
      }
    },
    setSelectedCategory(state, action: PayloadAction<RoutineCategory | 'ALL'>) {
      state.selectedCategory = action.payload;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setError(state, action: PayloadAction<string | null>) {
      state.error = action.payload;
    },
  },
});

export const {
  setRoutines,
  addRoutine,
  updateRoutine,
  pauseRoutine,
  resumeRoutine,
  deleteRoutine,
  increaseDifficulty,
  setSelectedCategory,
  setLoading,
  setError,
} = routineSlice.actions;

export default routineSlice.reducer;
