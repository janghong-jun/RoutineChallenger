import { Holiday } from '@routine-challenger/types';
import { HOLIDAYS_2025 } from './2025';
import { HOLIDAYS_2026 } from './2026';
import { HOLIDAYS_2027 } from './2027';

// 수동으로 추가 가능한 임시공휴일 목록 (사용자 지정 및 정부 임시공휴일 선포 시 추가)
export const MANUAL_TEMPORARY_HOLIDAYS: Holiday[] = [
  // 예시: { date: '2026-10-02', name: '임시공휴일', isCustom: true }
  { date: '2026-11-28', name: '임시공휴일', isCustom: true },
];

export const HOLIDAYS_BY_YEAR: Record<number, Holiday[]> = {
  2025: HOLIDAYS_2025,
  2026: HOLIDAYS_2026,
  2027: HOLIDAYS_2027,
};

export function getHolidaysForYear(year: number, extraCustomHolidays: Holiday[] = []): Holiday[] {
  const base = HOLIDAYS_BY_YEAR[year] || [];
  const manual = MANUAL_TEMPORARY_HOLIDAYS.filter(h => h.date.startsWith(`${year}-`));
  const custom = extraCustomHolidays.filter(h => h.date.startsWith(`${year}-`));

  // Merge and deduplicate by date
  const map = new Map<string, Holiday>();
  [...base, ...manual, ...custom].forEach(h => map.set(h.date, h));
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export function getAllKnownHolidays(extraCustomHolidays: Holiday[] = []): Holiday[] {
  const map = new Map<string, Holiday>();
  Object.values(HOLIDAYS_BY_YEAR)
    .flat()
    .forEach(h => map.set(h.date, h));
  MANUAL_TEMPORARY_HOLIDAYS.forEach(h => map.set(h.date, h));
  extraCustomHolidays.forEach(h => map.set(h.date, h));
  return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
}

export * from './2025';
export * from './2026';
export * from './2027';
