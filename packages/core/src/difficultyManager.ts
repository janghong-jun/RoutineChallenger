import { DifficultyLevel } from '@routine-challenger/types';

export interface DifficultyTierInfo {
  level: DifficultyLevel;
  name: string;
  requiredCompletions: number; // 다음 단계 해금을 위한 누적 실천 횟수
  targetMultiplier: number;
  badge: string;
}

export const DIFFICULTY_TIERS: Record<DifficultyLevel, DifficultyTierInfo> = {
  1: { level: 1, name: '입문', requiredCompletions: 0, targetMultiplier: 1.0, badge: '🌱' },
  2: { level: 2, name: '초급', requiredCompletions: 7, targetMultiplier: 1.5, badge: '⭐' },
  3: { level: 3, name: '중급', requiredCompletions: 14, targetMultiplier: 2.0, badge: '🌟' },
  4: { level: 4, name: '상급', requiredCompletions: 30, targetMultiplier: 2.5, badge: '🔥' },
  5: { level: 5, name: '마스터', requiredCompletions: 60, targetMultiplier: 3.0, badge: '👑' },
};

/**
 * 특정 루틴의 누적 성공 횟수에 따라 해금된 난이도 목록 확인
 */
export function getUnlockedDifficulties(cumulativeCompletions: number): DifficultyLevel[] {
  const levels: DifficultyLevel[] = [1, 2, 3, 4, 5];
  return levels.filter(level => cumulativeCompletions >= DIFFICULTY_TIERS[level].requiredCompletions);
}

/**
 * 특정 난이도가 해금되었는지 여부
 */
export function isDifficultyUnlocked(
  level: DifficultyLevel,
  cumulativeCompletions: number
): boolean {
  return cumulativeCompletions >= DIFFICULTY_TIERS[level].requiredCompletions;
}

/**
 * 난이도에 따른 권장 목표 수치 계산 (정수로 반올림)
 */
export function getRecommendedTarget(baseTarget: number, level: DifficultyLevel): number {
  const multiplier = DIFFICULTY_TIERS[level].targetMultiplier;
  return Math.round(baseTarget * multiplier);
}
