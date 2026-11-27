/**
 * 두 YYYY-MM-DD 날짜 간의 일수 차이 계산 (d1 - d2)
 */
export function getDaysDifference(d1: string, d2: string): number {
  const t1 = new Date(d1).getTime();
  const t2 = new Date(d2).getTime();
  return Math.round((t1 - t2) / (1000 * 60 * 60 * 24));
}

export interface StreakResult {
  currentStreak: number;
  bestStreak: number;
  totalActiveDays: number;
}

/**
 * 실천 완료된 날짜 목록(YYYY-MM-DD)을 기반으로 현재 연속 실천일(Streak) 및 역대 최장 연속 실천일 계산
 */
export function calculateStreaks(
  completedDates: string[],
  todayDateString: string
): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, bestStreak: 0, totalActiveDays: 0 };
  }

  // 중복 제거 후 오름차순 정렬
  const uniqueDates = Array.from(new Set(completedDates)).sort();
  const totalActiveDays = uniqueDates.length;

  let bestStreak = 1;
  let tempStreak = 1;

  for (let i = 1; i < uniqueDates.length; i++) {
    const prev = uniqueDates[i - 1];
    const curr = uniqueDates[i];
    if (prev && curr && getDaysDifference(curr, prev) === 1) {
      tempStreak++;
    } else {
      tempStreak = 1;
    }
    if (tempStreak > bestStreak) {
      bestStreak = tempStreak;
    }
  }

  // 현재 스트릭 계산
  // 마지막 실천일이 '오늘'이거나 '어제'인 경우 연속성이 유지됨
  const lastCompletedDate = uniqueDates[uniqueDates.length - 1];
  let currentStreak = 0;

  if (lastCompletedDate) {
    const diffFromToday = getDaysDifference(todayDateString, lastCompletedDate);
    if (diffFromToday === 0 || diffFromToday === 1) {
      // 거꾸로 추적하며 연속 일수 카운트
      currentStreak = 1;
      for (let i = uniqueDates.length - 1; i > 0; i--) {
        const curr = uniqueDates[i];
        const prev = uniqueDates[i - 1];
        if (curr && prev && getDaysDifference(curr, prev) === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }
  }

  return {
    currentStreak,
    bestStreak,
    totalActiveDays,
  };
}
