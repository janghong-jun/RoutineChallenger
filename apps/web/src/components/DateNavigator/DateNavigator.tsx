'use client';

import React from 'react';
import DatePicker from 'react-datepicker';
import { ko } from 'date-fns/locale';
import {
  useAppDispatch,
  useAppSelector,
  goToPreviousDay,
  goToNextDay,
  goToToday,
  setSelectedDate,
} from '@routine-challenger/store';
import { HolidayBadge } from '@routine-challenger/ui';
import styles from './DateNavigator.module.scss';

export const DateNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate, isHoliday, holidayName } = useAppSelector(state => state.date);

  const [year, month, day] = selectedDate.split('-').map(Number);
  const selectedDateValue = new Date(year, month - 1, day);
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

        <DatePicker
          className={styles.datePicker}
          selected={selectedDateValue}
          onChange={(date: Date | null) => {
            if (!date) return;
            const dateString = [
              date.getFullYear(),
              String(date.getMonth() + 1).padStart(2, '0'),
              String(date.getDate()).padStart(2, '0'),
            ].join('-');
            dispatch(setSelectedDate(dateString));
          }}
          dateFormat="yyyy년 M월 d일 (EEEE)"
          locale={ko}
          calendarStartDay={0}
          calendarClassName={styles.calendar}
          popperClassName={styles.calendarPopper}
          calendarIconClassName={styles.calendarIcon}
          ariaLabel="날짜 선택"
          toggleCalendarOnIconClick
          showPopperArrow={false}
        />

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
