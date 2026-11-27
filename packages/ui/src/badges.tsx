import React from 'react';
import { RoutineCategory, DifficultyLevel } from '@routine-challenger/types';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from './tokens';
import styles from './badges.module.scss';

export interface CategoryBadgeProps {
  category: RoutineCategory;
  showIcon?: boolean;
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({
  category,
  showIcon = true,
  className = '',
}) => {
  const meta = CATEGORY_METADATA[category];
  return (
    <span
      className={`${styles.categoryBadge} ${className}`}
      data-category={category}
    >
      {showIcon && <span aria-hidden="true">{meta.icon}</span>}
      <span>{meta.label}</span>
    </span>
  );
};

export interface DifficultyBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level, className = '' }) => {
  const meta = DIFFICULTY_METADATA[level];
  return (
    <span
      className={`${styles.difficultyBadge} ${className}`}
      data-level={level}
    >
      <span aria-hidden="true">{meta.badge}</span>
      <span>
        Lv.{meta.level} {meta.name}
      </span>
    </span>
  );
};

export interface ExpBadgeProps {
  amount: number;
  isHolidayBonus?: boolean;
  className?: string;
}

export const ExpBadge: React.FC<ExpBadgeProps> = ({
  amount,
  isHolidayBonus = false,
  className = '',
}) => {
  const isPositive = amount > 0;
  const toneClass = isHolidayBonus
    ? styles.holidayExp
    : isPositive
      ? styles.positiveExp
      : styles.negativeExp;

  return (
    <span
      className={`${styles.expBadge} ${toneClass} ${className}`}
    >
      <span>{isPositive ? `+${amount}` : amount} EXP</span>
      {isHolidayBonus && <span aria-hidden="true">✨</span>}
    </span>
  );
};

export interface HolidayBadgeProps {
  isHoliday: boolean;
  holidayName?: string | null;
  className?: string;
}

export const HolidayBadge: React.FC<HolidayBadgeProps> = ({
  isHoliday,
  holidayName,
  className = '',
}) => {
  if (isHoliday) {
    return (
      <span
        className={`${styles.holidayBadge} ${className}`}
      >
        <span aria-hidden="true">🇰🇷</span>
        <span>{holidayName || '휴식일'}</span>
        <span className={styles.bonusNote}>(보너스 2배)</span>
      </span>
    );
  }

  return (
    <span
      className={`${styles.weekdayBadge} ${className}`}
    >
    <span aria-hidden="true">🏃</span>
      <span>일반일</span>
    </span>
  );
};
