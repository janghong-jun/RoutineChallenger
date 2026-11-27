import React from 'react';
import { RoutineCategory, DifficultyLevel } from '@routine-challenger/types';
import { CATEGORY_METADATA, DIFFICULTY_METADATA } from './tokens';

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
      className={`rc-category-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 8px',
        borderRadius: '6px',
        fontSize: '12px',
        fontWeight: 600,
        color: meta.color,
        backgroundColor: meta.bgColor,
        border: `1px solid ${meta.borderColor}`,
        letterSpacing: '-0.2px',
        flex: 'none',
      }}
    >
      {showIcon && <span>{meta.icon}</span>}
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
      className={`rc-difficulty-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 7px',
        borderRadius: '6px',
        fontSize: '11px',
        fontWeight: 600,
        color: meta.color,
        backgroundColor: `${meta.color}15`,
        border: `1px solid ${meta.color}35`,
      }}
    >
      <span>{meta.badge}</span>
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
  return (
    <span
      className={`rc-exp-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '3px',
        padding: '2px 8px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 700,
        color: isHolidayBonus ? '#f43f5e' : isPositive ? '#10b981' : '#ef4444',
        backgroundColor: isHolidayBonus
          ? 'rgba(244, 63, 94, 0.12)'
          : isPositive
            ? 'rgba(16, 185, 129, 0.12)'
            : 'rgba(239, 68, 68, 0.12)',
        border: `1px solid ${
          isHolidayBonus
            ? 'rgba(244, 63, 94, 0.28)'
            : isPositive
              ? 'rgba(16, 185, 129, 0.28)'
              : 'rgba(239, 68, 68, 0.28)'
        }`,
      }}
    >
      <span>{isPositive ? `+${amount}` : amount} EXP</span>
      {isHolidayBonus && <span>✨</span>}
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
        className={`rc-holiday-badge ${className}`}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '4px',
          padding: '3px 9px',
          borderRadius: '9999px',
          fontSize: '11px',
          fontWeight: 700,
          color: '#f43f5e',
          backgroundColor: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
        }}
      >
        <span>🇰🇷</span>
        <span>{holidayName || '휴식일'}</span>
        <span style={{ fontSize: '10px', opacity: 0.8 }}>(보너스 2배)</span>
      </span>
    );
  }

  return (
    <span
      className={`rc-weekday-badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 9px',
        borderRadius: '9999px',
        fontSize: '11px',
        fontWeight: 600,
        color: '#94a3b8',
        backgroundColor: 'rgba(148, 163, 184, 0.1)',
        border: '1px solid rgba(148, 163, 184, 0.2)',
      }}
    >
      <span>🏃</span>
      <span>일반일</span>
    </span>
  );
};
