import React from 'react';
import { RoutineCategory, DifficultyLevel } from '@routine-challenger/types';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from './tokens';
import { Icon } from './Icon';
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
    <span className={`${styles.categoryBadge} ${className}`} data-category={category}>
      {showIcon && <Icon name={meta.icon} size={14} className={styles.categoryIcon} />}
      <span>{meta.label}</span>
    </span>
  );
};

export interface DifficultyBadgeProps {
  level: DifficultyLevel;
  className?: string;
}

const DIFFICULTY_STEPS = [1, 2, 3, 4, 5];

export const DifficultyBadge: React.FC<DifficultyBadgeProps> = ({ level, className = '' }) => {
  const meta = DIFFICULTY_METADATA[level];
  return (
    <span className={`${styles.difficultyBadge} ${className}`}>
      {/* 난이도 단계 막대: 텍스트로 같은 정보를 제공하므로 장식용 */}
      <span className={styles.difficultyBars} aria-hidden="true">
        {DIFFICULTY_STEPS.map(step => (
          <span key={step} className={step <= level ? styles.barOn : styles.barOff} />
        ))}
      </span>
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
    <span className={`${styles.expBadge} ${toneClass} ${className}`}>
      <Icon name={isHolidayBonus ? 'sparkles' : 'zap'} size={12} />
      <span>{isPositive ? `+${amount}` : amount} EXP</span>
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
      <span className={`${styles.holidayBadge} ${className}`}>
        <Icon name="calendar" size={14} />
        <span>{holidayName || '휴식일'}</span>
        <span className={styles.bonusNote}>보너스 2배</span>
      </span>
    );
  }

  return (
    <span className={`${styles.weekdayBadge} ${className}`}>
      <Icon name="calendar" size={14} />
      <span>일반일</span>
    </span>
  );
};
