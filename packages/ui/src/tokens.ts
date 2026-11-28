import { RoutineCategory, DifficultyLevel } from '@routine-challenger/types';
import { CATEGORY_ICON_NAMES, IconName } from './Icon';

export interface CategoryMeta {
  label: string;
  icon: IconName;
}

// 카테고리 색상은 테마별로 달라야 하므로 CSS 변수(--cat-*)로 관리한다. (variables.scss)
export const CATEGORY_METADATA: Record<RoutineCategory, CategoryMeta> = {
  EXERCISE: { label: '운동', icon: CATEGORY_ICON_NAMES.EXERCISE },
  LEARNING: { label: '학습', icon: CATEGORY_ICON_NAMES.LEARNING },
  SELF_CARE: { label: '자기관리', icon: CATEGORY_ICON_NAMES.SELF_CARE },
  HABIT: { label: '생활습관', icon: CATEGORY_ICON_NAMES.HABIT },
};

export interface DifficultyMeta {
  level: DifficultyLevel;
  name: string;
}

export const DIFFICULTY_METADATA: Record<DifficultyLevel, DifficultyMeta> = {
  1: { level: 1, name: '입문' },
  2: { level: 2, name: '초급' },
  3: { level: 3, name: '중급' },
  4: { level: 4, name: '상급' },
  5: { level: 5, name: '마스터' },
};
