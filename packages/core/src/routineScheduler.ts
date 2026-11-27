import { DayOfWeek, Routine } from '@routine-challenger/types';

/**
 * YYYY-MM-DD 날짜 문자열로부터 요일(0: 일요일 ~ 6: 토요일) 반환
 */
export function getDayOfWeekFromDateString(dateString: string): DayOfWeek {
  const [year, month, day] = dateString.split('-').map(Number);
  if (!year || !month || !day) return 0;
  // 월은 0-indexed
  const date = new Date(year, month - 1, day);
  return date.getDay() as DayOfWeek;
}

/**
 * 특정 날짜에 해당 루틴이 실천 대상인지 판별
 */
export function isRoutineScheduledForDate(routine: Routine, dateString: string): boolean {
  // 1. 활성 상태가 아니면 제외 (삭제/일시정지된 루틴)
  if (routine.status !== 'ACTIVE') {
    return false;
  }

  // 2. 시작일 이전이면 제외
  if (dateString < routine.startDate) {
    return false;
  }

  // 3. 종료일이 존재하고 종료일 이후이면 제외
  if (routine.endDate && dateString > routine.endDate) {
    return false;
  }

  // 4. 반복 주기(매일 or 특정 요일) 확인
  if (routine.frequencyType === 'DAILY') {
    return true;
  }

  if (routine.frequencyType === 'WEEKLY_DAYS') {
    const dayOfWeek = getDayOfWeekFromDateString(dateString);
    return routine.targetDaysOfWeek.includes(dayOfWeek);
  }

  return true;
}

/**
 * 특정 날짜에 실천 대상인 루틴 목록 필터링
 */
export function filterRoutinesForDate(routines: Routine[], dateString: string): Routine[] {
  return routines.filter(routine => isRoutineScheduledForDate(routine, dateString));
}
