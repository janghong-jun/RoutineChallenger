import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Title, ExpHistory, UserProfile } from '@routine-challenger/types';
import { INITIAL_TITLES_DATA } from '@routine-challenger/data';

export interface UserState {
  totalExp: number;
  selectedTitleId: string;
  unlockedTitleIds: string[];
  titles: Title[];
  expHistory: ExpHistory[];
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
  isInitialized: boolean;
}

const initialState: UserState = {
  totalExp: 0,
  selectedTitleId: 'first_step',
  unlockedTitleIds: ['first_step'],
  titles: INITIAL_TITLES_DATA,
  expHistory: [],
  currentStreak: 0,
  bestStreak: 0,
  totalActiveDays: 0,
  isInitialized: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUserProfile(state, action: PayloadAction<UserProfile>) {
      state.totalExp = action.payload.totalExp;
      state.selectedTitleId = action.payload.selectedTitleId;
      state.unlockedTitleIds = action.payload.unlockedTitleIds;
      state.isInitialized = true;
    },
    setExpHistory(state, action: PayloadAction<ExpHistory[]>) {
      state.expHistory = action.payload;
    },
    addExpTransaction(state, action: PayloadAction<{ history: ExpHistory; newTotalExp: number }>) {
      state.expHistory.push(action.payload.history);
      state.totalExp = Math.max(0, action.payload.newTotalExp);
    },
    setSelectedTitle(state, action: PayloadAction<string>) {
      if (state.unlockedTitleIds.includes(action.payload)) {
        state.selectedTitleId = action.payload;
      }
    },
    unlockTitles(state, action: PayloadAction<Title[]>) {
      action.payload.forEach(newTitle => {
        if (!state.unlockedTitleIds.includes(newTitle.id)) {
          state.unlockedTitleIds.push(newTitle.id);
        }
        const index = state.titles.findIndex(t => t.id === newTitle.id);
        if (index >= 0) {
          state.titles[index] = {
            ...state.titles[index],
            ...newTitle,
            isUnlocked: true,
          };
        }
      });
    },
    setStreaks(
      state,
      action: PayloadAction<{ currentStreak: number; bestStreak: number; totalActiveDays: number }>
    ) {
      state.currentStreak = action.payload.currentStreak;
      state.bestStreak = action.payload.bestStreak;
      state.totalActiveDays = action.payload.totalActiveDays;
    },
  },
});

export const {
  setUserProfile,
  setExpHistory,
  addExpTransaction,
  setSelectedTitle,
  unlockTitles,
  setStreaks,
} = userSlice.actions;

export default userSlice.reducer;
