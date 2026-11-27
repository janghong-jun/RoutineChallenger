import { describe, it, expect } from 'vitest';
import {
  ExpCalculator,
  HolidayService,
  isRoutineScheduledForDate,
  filterRoutinesForDate,
  TitleEvaluator,
  getUnlockedDifficulties,
  getRecommendedTarget,
  calculateStreaks,
} from '../src';
import { Routine } from '@routine-challenger/types';

describe('ExpCalculator', () => {
  const calculator = new ExpCalculator({
    normalSuccessExp: 10,
    holidaySuccessExp: 20,
    normalFailDeduction: 5,
    holidayFailDeduction: 2,
  });

  it('일반일 성공 시 +10 EXP를 지급하고 EARN_NORMAL 타입을 반환한다', () => {
    const result = calculator.getSuccessExp(false);
    expect(result.amount).toBe(10);
    expect(result.type).toBe('EARN_NORMAL');
  });

  it('휴식일(공휴일) 성공 시 +20 EXP를 지급하고 EARN_HOLIDAY 타입을 반환한다', () => {
    const result = calculator.getSuccessExp(true);
    expect(result.amount).toBe(20);
    expect(result.type).toBe('EARN_HOLIDAY');
  });

  it('일반일 실패 시 -5 EXP를 차감하고 DEDUCT_NORMAL 타입을 반환한다', () => {
    const result = calculator.getFailureDeduction(false);
    expect(result.amount).toBe(-5);
    expect(result.type).toBe('DEDUCT_NORMAL');
  });

  it('휴식일(공휴일) 실패 시 -2 EXP로 완화 차감하고 DEDUCT_HOLIDAY 타입을 반환한다', () => {
    const result = calculator.getFailureDeduction(true);
    expect(result.amount).toBe(-2);
    expect(result.type).toBe('DEDUCT_HOLIDAY');
  });

  it('경험치 최솟값은 0이며, 음수로 내려가지 않는다 (0 하한선 보장)', () => {
    const { nextBalance, actualDelta } = calculator.applyExpDelta(3, -5);
    expect(nextBalance).toBe(0);
    expect(actualDelta).toBe(-3);
  });

  it('동일 날짜 및 동일 루틴에 대한 중복 트랜잭션을 올바르게 감지한다', () => {
    const history = [
      calculator.createHistoryRecord({
        routineId: 'r1',
        date: '2026-11-27',
        type: 'EARN_NORMAL',
        amount: 10,
        balanceAfter: 10,
        reason: '루틴 완료',
      }),
    ];

    expect(calculator.hasDuplicateTransaction(history, 'r1', '2026-11-27')).toBe(true);
    expect(calculator.hasDuplicateTransaction(history, 'r2', '2026-11-27')).toBe(false);
    expect(calculator.hasDuplicateTransaction(history, 'r1', '2026-11-28')).toBe(false);
  });

  it('기록 취소 시 역정산(롤백)을 정확히 계산한다', () => {
    const prevTx = calculator.createHistoryRecord({
      routineId: 'r1',
      date: '2026-11-27',
      type: 'EARN_NORMAL',
      amount: 10,
      balanceAfter: 10,
      reason: '루틴 완료',
    });

    const { nextBalance, reversalRecord } = calculator.calculateReversal(prevTx, 10);
    expect(nextBalance).toBe(0);
    expect(reversalRecord.amount).toBe(-10);
    expect(reversalRecord.type).toBe('ADJUSTMENT');
  });
});

describe('HolidayService', () => {
  const holidayService = new HolidayService();

  it('대한민국 공휴일(신정 2026-01-01)을 공휴일로 정확히 판별한다', () => {
    expect(holidayService.isHoliday('2026-01-01')).toBe(true);
    const holiday = holidayService.getHoliday('2026-01-01');
    expect(holiday?.name).toBe('신정');
  });

  it('대체공휴일(삼일절 대체 2026-03-02)을 공휴일로 판별한다', () => {
    expect(holidayService.isHoliday('2026-03-02')).toBe(true);
    expect(holidayService.getHoliday('2026-03-02')?.isSubstituted).toBe(true);
  });

  it('공휴일이 아닌 일반 평일은 false를 반환한다', () => {
    expect(holidayService.isHoliday('2026-01-02')).toBe(false);
  });

  it('토요일과 일요일은 휴식일로 판정하고 휴식일 EXP 정책을 적용한다', () => {
    const calculator = new ExpCalculator();
    const normalReward = calculator.getSuccessExp(false).amount;

    expect(holidayService.isHoliday('2026-11-21')).toBe(true);
    expect(holidayService.getHoliday('2026-11-21')?.name).toBe('토요일 휴식일');
    expect(holidayService.isHoliday('2026-11-22')).toBe(true);
    expect(holidayService.getHoliday('2026-11-22')?.name).toBe('일요일 휴식일');
    expect(calculator.getSuccessExp(holidayService.isHoliday('2026-11-21')).amount).toBe(
      normalReward * 2
    );
    expect(calculator.getSuccessExp(holidayService.isHoliday('2026-11-22')).amount).toBe(
      normalReward * 2
    );
    expect(calculator.getFailureDeduction(holidayService.isHoliday('2026-11-22')).amount).toBe(-2);
  });

  it('임시공휴일을 수동 추가하면 즉시 공휴일로 반영된다', () => {
    expect(holidayService.isHoliday('2026-10-02')).toBe(false);
    holidayService.addCustomHoliday({
      date: '2026-10-02',
      name: '임시공휴일',
      isCustom: true,
    });
    expect(holidayService.isHoliday('2026-10-02')).toBe(true);
    expect(holidayService.getHoliday('2026-10-02')?.name).toBe('임시공휴일');
  });
});

describe('RoutineScheduler', () => {
  const sampleRoutine: Routine = {
    id: 'routine-1',
    title: '스트레칭',
    category: 'EXERCISE',
    difficultyLevel: 1,
    targetType: 'TIME',
    targetValue: 15,
    targetUnit: '분',
    frequencyType: 'DAILY',
    targetDaysOfWeek: [0, 1, 2, 3, 4, 5, 6],
    startDate: '2026-11-01',
    status: 'ACTIVE',
    createdAt: '2026-11-01T00:00:00Z',
    updatedAt: '2026-11-01T00:00:00Z',
  };

  it('매일 반복 루틴은 시작일 이후 모든 날짜에 스케줄된다', () => {
    expect(isRoutineScheduledForDate(sampleRoutine, '2026-11-27')).toBe(true);
  });

  it('시작일 이전 날짜에는 스케줄되지 않는다', () => {
    expect(isRoutineScheduledForDate(sampleRoutine, '2026-10-31')).toBe(false);
  });

  it('종료일이 지정된 경우 종료일 이후에는 스케줄되지 않는다', () => {
    const routineWithEnd: Routine = {
      ...sampleRoutine,
      endDate: '2026-11-20',
    };
    expect(isRoutineScheduledForDate(routineWithEnd, '2026-11-21')).toBe(false);
    expect(isRoutineScheduledForDate(routineWithEnd, '2026-11-15')).toBe(true);
  });

  it('특정 요일 반복 루틴(월/수/금)은 해당 요일에만 스케줄된다', () => {
    // 2026-11-27은 금요일 (Day 5)
    // 2026-11-28은 토요일 (Day 6)
    const mwfRoutine: Routine = {
      ...sampleRoutine,
      frequencyType: 'WEEKLY_DAYS',
      targetDaysOfWeek: [1, 3, 5],
    };
    expect(isRoutineScheduledForDate(mwfRoutine, '2026-11-27')).toBe(true); // 금요일
    expect(isRoutineScheduledForDate(mwfRoutine, '2026-11-28')).toBe(false); // 토요일
  });

  it('일시정지(PAUSED) 및 삭제(DELETED) 루틴은 스케줄 대상에서 제외된다', () => {
    expect(isRoutineScheduledForDate({ ...sampleRoutine, status: 'PAUSED' }, '2026-11-27')).toBe(false);
    expect(isRoutineScheduledForDate({ ...sampleRoutine, status: 'DELETED' }, '2026-11-27')).toBe(false);
  });

  it('filterRoutinesForDate는 특정 날짜에 해당하는 활성 루틴만 필터링한다', () => {
    const list = [
      sampleRoutine,
      { ...sampleRoutine, id: 'paused-1', status: 'PAUSED' as const },
    ];
    const filtered = filterRoutinesForDate(list, '2026-11-27');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.id).toBe('routine-1');
  });
});

describe('TitleEvaluator', () => {
  const evaluator = new TitleEvaluator();

  it('조건 충족 시 새로운 타이틀을 해금한다', () => {
    const unlocked = evaluator.evaluateNewUnlocks(['first_step'], {
      totalExp: 100,
      totalCompletedDays: 3,
      currentStreak: 3,
      bestStreak: 3,
      completedCategories: ['EXERCISE'],
    });

    const smallAchiever = unlocked.find(t => t.id === 'small_achiever');
    expect(smallAchiever).toBeDefined();
    expect(smallAchiever?.isUnlocked).toBe(true);
  });

  it('경험치가 줄어들거나 스트릭이 리셋되어도 이미 획득한 타이틀은 영구 보존된다', () => {
    const alreadyUnlocked = ['first_step', 'small_achiever', 'steady_achiever'];
    // 스트릭이 0으로 리셋되고 EXP가 0이어도 기존 타이틀 목록은 유지됨
    const newUnlocks = evaluator.evaluateNewUnlocks(alreadyUnlocked, {
      totalExp: 0,
      totalCompletedDays: 1,
      currentStreak: 0,
      bestStreak: 0,
      completedCategories: [],
    });

    // 이미 해금된 타이틀이 다시 잠기거나 해금 목록에 불필요하게 포함되지 않음
    expect(newUnlocks.some(t => t.id === 'steady_achiever')).toBe(false);
  });
});

describe('DifficultyManager', () => {
  it('기본 0회 달성 시에는 1단계(입문)만 해금된다', () => {
    const unlocked = getUnlockedDifficulties(0);
    expect(unlocked).toEqual([1]);
  });

  it('7회 달성 시 2단계(초급), 14회 달성 시 3단계(중급)가 순차 해금된다', () => {
    expect(getUnlockedDifficulties(6)).toEqual([1]);
    expect(getUnlockedDifficulties(7)).toEqual([1, 2]);
    expect(getUnlockedDifficulties(14)).toEqual([1, 2, 3]);
  });

  it('난이도에 따른 권장 목표 배율이 정확히 반영된다', () => {
    expect(getRecommendedTarget(20, 1)).toBe(20);
    expect(getRecommendedTarget(20, 2)).toBe(30);
    expect(getRecommendedTarget(20, 3)).toBe(40);
  });
});

describe('StreakCalculator', () => {
  it('연속된 날짜에 대한 현재 및 최고 스트릭을 정확히 계산한다', () => {
    const dates = ['2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27'];
    const result = calculateStreaks(dates, '2026-11-27');
    expect(result.currentStreak).toBe(4);
    expect(result.bestStreak).toBe(4);
    expect(result.totalActiveDays).toBe(4);
  });

  it('중간에 끊긴 경우 과거 최고 스트릭을 보존하고 현재 스트릭을 바르게 계산한다', () => {
    const dates = [
      '2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13', // 4일 스트릭
      '2026-11-26', '2026-11-27' // 2일 스트릭
    ];
    const result = calculateStreaks(dates, '2026-11-27');
    expect(result.bestStreak).toBe(4);
    expect(result.currentStreak).toBe(2);
    expect(result.totalActiveDays).toBe(6);
  });
});
