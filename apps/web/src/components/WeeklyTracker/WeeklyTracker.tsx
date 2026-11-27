'use client';

import React, { useSyncExternalStore } from 'react';
import { useAppDispatch, useAppSelector, setSelectedDate } from '@routine-challenger/store';
import { defaultHolidayService } from '@routine-challenger/core';
import styles from './WeeklyTracker.module.scss';

export const WeeklyTracker: React.FC = () => {
  const isHydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate } = useAppSelector(state => state.date);
  const recordsMap = useAppSelector(state => state.record.recordsMap);

  // 선택된 날짜가 속한 주의 일요일 ~ 토요일 7일 계산
  const getWeekDays = (targetDateStr: string) => {
    const [year, month, day] = targetDateStr.split('-').map(Number);
    if (!year || !month || !day) return [];

    const d = new Date(year, month - 1, day);
    const sunday = new Date(d);
    sunday.setDate(d.getDate() - d.getDay());

    const week = [];
    const dayLabels = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
      const cur = new Date(sunday);
      cur.setDate(sunday.getDate() + i);

      const y = cur.getFullYear();
      const m = String(cur.getMonth() + 1).padStart(2, '0');
      const dateVal = String(cur.getDate()).padStart(2, '0');
      const dateString = `${y}-${m}-${dateVal}`;

      // 해당 날짜에 완료된 기록이 있는지 확인
      const hasCompleted = Object.values(recordsMap).some(
        r => r.date === dateString && r.completed
      );

      const isHoliday = defaultHolidayService.isHoliday(dateString);

      week.push({
        dateString,
        dayNumber: cur.getDate(),
        dayLabel: dayLabels[i],
        isWeekend: i === 0 || i === 6,
        isToday: dateString === todayDate,
        isSelected: dateString === selectedDate,
        hasCompleted,
        isHoliday,
      });
    }

    return week;
  };

  const weekDays = isHydrated ? getWeekDays(selectedDate) : [];

  return (
    <section className={styles.container} aria-label="주간 날짜 선택">
      {weekDays.map(day => (
        <button
          key={day.dateString}
          type="button"
          className={`${styles.dayCard} ${day.isSelected ? styles.isSelected : ''} ${
            day.isToday ? styles.isToday : ''
          }`}
          onClick={() => dispatch(setSelectedDate(day.dateString))}
          aria-label={`${day.dateString}, ${day.dayLabel}요일${
            day.isToday ? ', 오늘' : ''
          }${day.isSelected ? ', 선택됨' : ''}${
            day.hasCompleted ? ', 완료 기록 있음' : day.isHoliday ? ', 휴식일' : ''
          }`}
          aria-pressed={day.isSelected}
        >
          <span
            className={`${styles.dayName} ${
              day.isWeekend || day.isHoliday ? styles.isWeekend : ''
            }`}
          >
            {day.dayLabel}
          </span>
          <span className={styles.dateNum}>{day.dayNumber}</span>
          <div
            title={day.hasCompleted ? '루틴 완료' : day.isHoliday ? '휴일' : '미완료'}
            aria-hidden="true"
            className={`${styles.indicator} ${
              day.hasCompleted
                ? styles.hasDone
                : day.isHoliday
                ? styles.isHoliday
                : ''
            }`}
          />
        </button>
      ))}
    </section>
  );
};
