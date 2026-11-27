import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RoutineRecord } from '@routine-challenger/types';

export interface RecordState {
  recordsMap: Record<string, RoutineRecord>; // `${routineId}_${date}`
  isLoading: boolean;
}

const initialState: RecordState = {
  recordsMap: {},
  isLoading: false,
};

export const recordSlice = createSlice({
  name: 'record',
  initialState,
  reducers: {
    setRecords(state, action: PayloadAction<RoutineRecord[]>) {
      action.payload.forEach(record => {
        state.recordsMap[record.id] = record;
      });
    },
    upsertRecord(state, action: PayloadAction<RoutineRecord>) {
      state.recordsMap[action.payload.id] = action.payload;
    },
    removeRecord(state, action: PayloadAction<{ routineId: string; date: string }>) {
      const id = `${action.payload.routineId}_${action.payload.date}`;
      delete state.recordsMap[id];
    },
    setRecordLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
  },
});

export const { setRecords, upsertRecord, removeRecord, setRecordLoading } = recordSlice.actions;

export default recordSlice.reducer;
