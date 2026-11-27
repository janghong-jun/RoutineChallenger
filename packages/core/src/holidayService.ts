import { Holiday } from '@routine-challenger/types';
import { getHolidaysForYear } from '@routine-challenger/data';

export class HolidayService {
  private customHolidays: Holiday[] = [];

  constructor(customHolidays: Holiday[] = []) {
    this.customHolidays = [...customHolidays];
  }

  /**
   * 임시공휴일 또는 사용자 지정 휴식일 수동 추가
   */
  public addCustomHoliday(holiday: Holiday): void {
    const existingIndex = this.customHolidays.findIndex(h => h.date === holiday.date);
    if (existingIndex >= 0) {
      this.customHolidays[existingIndex] = holiday;
    } else {
      this.customHolidays.push(holiday);
    }
  }

  /**
   * 특정 날짜(YYYY-MM-DD)가 공휴일/휴식일인지 판정
   */
  public isHoliday(dateString: string): boolean {
    const holiday = this.getHoliday(dateString);
    return holiday !== undefined;
  }

  /**
   * 특정 날짜(YYYY-MM-DD)의 공휴일 정보 조회 (없으면 undefined)
   */
  public getHoliday(dateString: string): Holiday | undefined {
    // 1. 커스텀/임시공휴일 우선 확인
    const customMatch = this.customHolidays.find(h => h.date === dateString);
    if (customMatch) {
      return customMatch;
    }

    // 2. 연도별 데이터에서 확인
    const year = parseInt(dateString.slice(0, 4), 10);
    if (isNaN(year)) return undefined;

    const yearHolidays = getHolidaysForYear(year, this.customHolidays);
    const holiday = yearHolidays.find(h => h.date === dateString);
    if (holiday) return holiday;

    return this.getWeekendHoliday(dateString);
  }

  /**
   * 특정 연도의 모든 공휴일 목록 반환
   */
  public getYearHolidays(year: number): Holiday[] {
    const holidays = getHolidaysForYear(year, this.customHolidays);
    const holidayDates = new Set(holidays.map(holiday => holiday.date));

    for (let month = 1; month <= 12; month++) {
      const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
      for (let day = 1; day <= lastDay; day++) {
        const dateString = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const weekendHoliday = this.getWeekendHoliday(dateString);
        if (weekendHoliday && !holidayDates.has(dateString)) {
          holidays.push(weekendHoliday);
        }
      }
    }

    return holidays.sort((a, b) => a.date.localeCompare(b.date));
  }

  private getWeekendHoliday(dateString: string): Holiday | undefined {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
    if (!match) return undefined;

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);
    const date = new Date(Date.UTC(year, month - 1, day));
    if (date.toISOString().slice(0, 10) !== dateString) return undefined;

    const weekday = date.getUTCDay();
    if (weekday !== 0 && weekday !== 6) return undefined;

    return {
      date: dateString,
      name: weekday === 6 ? '토요일 휴식일' : '일요일 휴식일',
    };
  }
}

export const defaultHolidayService = new HolidayService();
