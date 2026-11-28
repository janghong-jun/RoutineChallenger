'use client';

import React, { useRef, useSyncExternalStore } from 'react';
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

const MOBILE_MEDIA_QUERY = '(max-width: 640px)';

const ReadOnlyDateInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentPropsWithoutRef<'input'>
>((props, ref) => <input {...props} ref={ref} readOnly />);
ReadOnlyDateInput.displayName = 'ReadOnlyDateInput';

const subscribeToMobileLayout = (onChange: () => void) => {
  const mediaQuery = window.matchMedia(MOBILE_MEDIA_QUERY);
  mediaQuery.addEventListener('change', onChange);
  return () => mediaQuery.removeEventListener('change', onChange);
};

const getIsMobileLayout = () => window.matchMedia(MOBILE_MEDIA_QUERY).matches;
const getServerMobileLayout = () => false;

export const DateNavigator: React.FC = () => {
  const isMobileLayout = useSyncExternalStore(
    subscribeToMobileLayout,
    getIsMobileLayout,
    getServerMobileLayout
  );
  const dispatch = useAppDispatch();
  const { selectedDate, todayDate, isHoliday, holidayName } = useAppSelector(state => state.date);
  const datePickerRef = useRef<DatePicker | null>(null);
  const calendarOpenRef = useRef(false);
  const restoreInputFocusRef = useRef(false);

  const [year, month, day] = selectedDate.split('-').map(Number);
  const selectedDateValue = new Date(year, month - 1, day);
  const dayNames = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const isToday = selectedDate === todayDate;

  return (
    <nav className={styles.container} aria-label="날짜 탐색">
      <div className={styles.dateGroup}>
        <h2
          className={styles.dateText}
          onKeyDownCapture={event => {
            if (calendarOpenRef.current && event.key === 'Escape') {
              restoreInputFocusRef.current = true;
            }
          }}
        >
          <DatePicker
            ref={datePickerRef}
            customInput={<ReadOnlyDateInput />}
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
            dateFormat="yyyy년 M월 d일"
            locale={ko}
            calendarStartDay={0}
            calendarClassName={styles.calendar}
            popperClassName={styles.calendarPopper}
            popperPlacement="bottom-start"
            popperProps={{ strategy: 'fixed' }}
            calendarIconClassName={styles.calendarIcon}
            ariaLabel="날짜 선택"
            toggleCalendarOnIconClick
            showPopperArrow={false}
            withPortal={isMobileLayout}
            onCalendarOpen={() => {
              calendarOpenRef.current = true;
              requestAnimationFrame(() => {
                document
                  .querySelector<HTMLElement>(
                    `.${styles.calendar} .react-datepicker__day[tabindex="0"]`
                  )
                  ?.focus({ preventScroll: true });
              });
            }}
            onCalendarClose={() => {
              calendarOpenRef.current = false;
              if (!restoreInputFocusRef.current) return;
              restoreInputFocusRef.current = false;
              requestAnimationFrame(() => datePickerRef.current?.setFocus());
            }}
            renderCustomHeader={({ date, decreaseMonth, increaseMonth }) => (
              <div className={styles.calendarHeader}>
                <button
                  type="button"
                  className={styles.calendarNavButton}
                  onClick={decreaseMonth}
                  aria-label="이전 달"
                >
                  <Icon name="chevron-left" size={16} />
                </button>
                <h3 className={styles.calendarMonth}>
                  {date.getFullYear()}년 {date.getMonth() + 1}월
                </h3>
                <button
                  type="button"
                  className={styles.calendarNavButton}
                  onClick={increaseMonth}
                  aria-label="다음 달"
                >
                  <Icon name="chevron-right" size={16} />
                </button>
              </div>
            )}
          />
          <span className={styles.dateSub}>{dayNames[selectedDateValue.getDay()]}</span>
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
