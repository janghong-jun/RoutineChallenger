import { RoutineCategory, DifficultyLevel } from '@routine-challenger/types';

export interface CategoryMeta {
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const CATEGORY_METADATA: Record<RoutineCategory, CategoryMeta> = {
  EXERCISE: {
    label: '운동',
    icon: '🏃',
    color: '#06b6d4', // cyan-500
    bgColor: 'rgba(6, 182, 212, 0.12)',
    borderColor: 'rgba(6, 182, 212, 0.28)',
  },
  LEARNING: {
    label: '학습',
    icon: '📚',
    color: '#a855f7', // purple-500
    bgColor: 'rgba(168, 85, 247, 0.12)',
    borderColor: 'rgba(168, 85, 247, 0.28)',
  },
  SELF_CARE: {
    label: '자기관리',
    icon: '🌿',
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: 'rgba(16, 185, 129, 0.28)',
  },
  HABIT: {
    label: '생활습관',
    icon: '⏰',
    color: '#f59e0b', // amber-500
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: 'rgba(245, 158, 11, 0.28)',
  },
};

export interface DifficultyMeta {
  level: DifficultyLevel;
  name: string;
  badge: string;
  color: string;
}

export const DIFFICULTY_METADATA: Record<DifficultyLevel, DifficultyMeta> = {
  1: { level: 1, name: '입문', badge: '🌱', color: '#10b981' },
  2: { level: 2, name: '초급', badge: '⭐', color: '#06b6d4' },
  3: { level: 3, name: '중급', badge: '🌟', color: '#6366f1' },
  4: { level: 4, name: '상급', badge: '🔥', color: '#f59e0b' },
  5: { level: 5, name: '마스터', badge: '👑', color: '#ec4899' },
};
