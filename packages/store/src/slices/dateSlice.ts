import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { defaultHolidayService } from '@routine-challenger/core';

/**
 * 대한민국 시간대(Asia/Seoul, UTC+9) 기준의 YYYY-MM-DD 문자열 생성
 */
export function getKoreaTodayDateString(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());

  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;

  if (!year || !month || !day) {
    return '';
  }

  return `${year}-${month}-${day}`;
}

export function shiftDateString(dateString: string, daysDelta: number): string {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return getKoreaTodayDateString();
  const d = new Date(year, month - 1, day);
  d.setDate(d.getDate() + daysDelta);

  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const date = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${date}`;
}

export interface DateState {
  selectedDate: string; // YYYY-MM-DD
  todayDate: string; // YYYY-MM-DD
  isHoliday: boolean;
  holidayName: string | null;
}

const initialToday = getKoreaTodayDateString();
const initialHoliday = defaultHolidayService.getHoliday(initialToday);

const initialState: DateState = {
  selectedDate: initialToday,
  todayDate: initialToday,
  isHoliday: initialHoliday !== undefined,
  holidayName: initialHoliday ? initialHoliday.name : null,
};

export const dateSlice = createSlice({
  name: 'date',
  initialState,
  reducers: {
    setSelectedDate(state, action: PayloadAction<string>) {
      state.selectedDate = action.payload;
      const holiday = defaultHolidayService.getHoliday(action.payload);
      state.isHoliday = holiday !== undefined;
      state.holidayName = holiday ? holiday.name : null;
    },
    goToToday(state) {
      const today = getKoreaTodayDateString();
      state.todayDate = today;
      state.selectedDate = today;
      const holiday = defaultHolidayService.getHoliday(today);
      state.isHoliday = holiday !== undefined;
      state.holidayName = holiday ? holiday.name : null;
    },
    goToPreviousDay(state) {
      const prevDate = shiftDateString(state.selectedDate, -1);
      state.selectedDate = prevDate;
      const holiday = defaultHolidayService.getHoliday(prevDate);
      state.isHoliday = holiday !== undefined;
      state.holidayName = holiday ? holiday.name : null;
    },
    goToNextDay(state) {
      const nextDate = shiftDateString(state.selectedDate, 1);
      state.selectedDate = nextDate;
      const holiday = defaultHolidayService.getHoliday(nextDate);
      state.isHoliday = holiday !== undefined;
      state.holidayName = holiday ? holiday.name : null;
    },
  },
});

export const { setSelectedDate, goToToday, goToPreviousDay, goToNextDay } = dateSlice.actions;

export default dateSlice.reducer;
