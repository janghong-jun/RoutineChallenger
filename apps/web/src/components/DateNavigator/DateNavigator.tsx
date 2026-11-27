'use client';

import React from 'react';
import { useAppDispatch, useAppSelector, goToPreviousDay, goToNextDay, goToToday } from '@routine-challenger/store';
import { HolidayBadge } from '@routine-challenger/ui';
import styles from './DateNavigator.module.scss';

export const DateNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate, isHoliday, holidayName } = useAppSelector(state => state.date);

  const formatKoreanDate = (dateString: string) => {
    const [year, month, day] = dateString.split('-').map(Number);
    if (!year || !month || !day) return dateString;
    const dateObj = new Date(year, month - 1, day);
    const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
    const dayName = dayNames[dateObj.getDay()];
    return `${year}년 ${month}월 ${day}일 (${dayName})`;
  };

  const isToday = selectedDate === todayDate;

  return (
    <div className={styles.container}>
      <div className={styles.dateGroup}>
        <button
          className={styles.navButton}
          onClick={() => dispatch(goToPreviousDay())}
          title="이전 날짜로 이동"
        >
          ‹
        </button>

        <span className={styles.dateText}>{formatKoreanDate(selectedDate)}</span>

        <button
          className={styles.navButton}
          onClick={() => dispatch(goToNextDay())}
          title="다음 날짜로 이동"
        >
          ›
        </button>

        {!isToday && (
          <button
            className={styles.todayButton}
            onClick={() => dispatch(goToToday())}
            title="오늘로 돌아가기"
          >
            오늘
          </button>
        )}
      </div>

      <div className={styles.statusWrapper}>
        <HolidayBadge isHoliday={isHoliday} holidayName={holidayName} />
      </div>
    </div>
  );
};
