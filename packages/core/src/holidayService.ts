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
    return yearHolidays.find(h => h.date === dateString);
  }

  /**
   * 특정 연도의 모든 공휴일 목록 반환
   */
  public getYearHolidays(year: number): Holiday[] {
    return getHolidaysForYear(year, this.customHolidays);
  }
}

export const defaultHolidayService = new HolidayService();
