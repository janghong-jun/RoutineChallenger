'use client';

import React from 'react';
import { useAppDispatch, useAppSelector, setSelectedDate } from '@routine-challenger/store';
import { defaultHolidayService } from '@routine-challenger/core';
import styles from './WeeklyTracker.module.scss';

export const WeeklyTracker: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate } = useAppSelector(state => state.date);
  const recordsMap = useAppSelector(state => state.record.recordsMap);

  // 선택된 날짜가 속한 주의 월요일 ~ 일요일 7일 계산
  const getWeekDays = (targetDateStr: string) => {
    const [year, month, day] = targetDateStr.split('-').map(Number);
    if (!year || !month || !day) return [];

    const d = new Date(year, month - 1, day);
    // JS: 0=일, 1=월 ... 6=토 -> 월요일(1) 기준 시작으로 보정
    const currentDay = d.getDay();
    const distanceToMonday = currentDay === 0 ? -6 : 1 - currentDay;

    const monday = new Date(d);
    monday.setDate(d.getDate() + distanceToMonday);

    const week = [];
    const dayLabels = ['월', '화', '수', '목', '금', '토', '일'];

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);

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
        isWeekend: i === 5 || i === 6,
        isToday: dateString === todayDate,
        isSelected: dateString === selectedDate,
        hasCompleted,
        isHoliday,
      });
    }

    return week;
  };

  const weekDays = getWeekDays(selectedDate);

  return (
    <div className={styles.container}>
      {weekDays.map(day => (
        <button
          key={day.dateString}
          className={`${styles.dayCard} ${day.isSelected ? styles.isSelected : ''} ${
            day.isToday ? styles.isToday : ''
          }`}
          onClick={() => dispatch(setSelectedDate(day.dateString))}
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
    </div>
  );
};
