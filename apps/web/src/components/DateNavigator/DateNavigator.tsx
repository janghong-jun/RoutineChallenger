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
import { HolidayBadge, Icon } from '@routine-challenger/ui';
import styles from './DateNavigator.module.scss';

export const DateNavigator: React.FC = () => {
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate, isHoliday, holidayName } = useAppSelector(state => state.date);

  const [year, month, day] = selectedDate.split('-').map(Number);
  const selectedDateValue = new Date(year, month - 1, day);
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const isToday = selectedDate === todayDate;

  return (
    <nav className={styles.container} aria-label="날짜 탐색">
      <div className={styles.dateGroup}>
        <h2 className={styles.dateText}>
          <DatePicker
            className={`${styles.dateMain} ${styles.datePicker}`}
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
            dateFormat="M월 d일"
            locale={ko}
            calendarStartDay={0}
            calendarClassName={styles.calendar}
            popperClassName={styles.calendarPopper}
            calendarIconClassName={styles.calendarIcon}
            ariaLabel="날짜 선택"
            toggleCalendarOnIconClick
            showPopperArrow={false}
          />
          <span className={styles.dateSub}>
            {year}년 {dayNames[selectedDateValue.getDay()]}
          </span>
        </h2>

        <div className={styles.controls}>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => dispatch(goToPreviousDay())}
            aria-label="이전 날짜로 이동"
          >
            <Icon name="chevron-left" size={18} />
          </button>
          <button
            type="button"
            className={styles.navButton}
            onClick={() => dispatch(goToNextDay())}
            aria-label="다음 날짜로 이동"
          >
            <Icon name="chevron-right" size={18} />
          </button>
          {!isToday && (
            <button
              type="button"
              className={styles.todayButton}
              onClick={() => dispatch(goToToday())}
              aria-label="오늘로 돌아가기"
            >
              오늘
            </button>
          )}
        </div>
      </div>

      <div className={styles.statusWrapper}>
        <HolidayBadge isHoliday={isHoliday} holidayName={holidayName} />
      </div>
    </nav>
  );
};
