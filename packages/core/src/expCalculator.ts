import {
  ExpHistory,
  ExpPolicyConfig,
  ExpTransactionType,
} from '@routine-challenger/types';
import { DEFAULT_EXP_CONFIG } from '@routine-challenger/data';

export class ExpCalculator {
  private config: ExpPolicyConfig;

  constructor(config: ExpPolicyConfig = DEFAULT_EXP_CONFIG) {
    this.config = { ...config };
  }

  public updateConfig(newConfig: Partial<ExpPolicyConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  public getConfig(): ExpPolicyConfig {
    return { ...this.config };
  }

  /**
   * 성공 시 획득할 경험치 및 트랜잭션 타입 계산
   */
  public getSuccessExp(isHoliday: boolean): { amount: number; type: ExpTransactionType } {
    return isHoliday
      ? { amount: this.config.holidaySuccessExp, type: 'EARN_HOLIDAY' }
      : { amount: this.config.normalSuccessExp, type: 'EARN_NORMAL' };
  }

  /**
   * 미실천(실패) 시 차감할 경험치 및 트랜잭션 타입 계산
   */
  public getFailureDeduction(isHoliday: boolean): { amount: number; type: ExpTransactionType } {
    return isHoliday
      ? { amount: -this.config.holidayFailDeduction, type: 'DEDUCT_HOLIDAY' }
      : { amount: -this.config.normalFailDeduction, type: 'DEDUCT_NORMAL' };
  }

  /**
   * 잔여 경험치에 변동액을 적용하고 0 미만으로 내려가지 않도록 보정
   */
  public applyExpDelta(
    currentBalance: number,
    delta: number
  ): { nextBalance: number; actualDelta: number } {
    const calculated = currentBalance + delta;
    const nextBalance = Math.max(0, calculated);
    const actualDelta = nextBalance - currentBalance;
    return { nextBalance, actualDelta };
  }

  /**
   * 동일 날짜, 동일 루틴에 대한 중복 처리 여부 확인
   */
  public hasDuplicateTransaction(
    history: ExpHistory[],
    routineId: string,
    date: string,
    type?: ExpTransactionType
  ): boolean {
    return history.some(item => {
      const isMatch = item.routineId === routineId && item.date === date;
      if (!isMatch) return false;
      if (type) return item.type === type;
      return true;
    });
  }

  /**
   * EXP 변동 이력 객체 생성
   */
  public createHistoryRecord(params: {
    routineId: string;
    date: string;
    type: ExpTransactionType;
    amount: number;
    balanceAfter: number;
    reason: string;
  }): ExpHistory {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    return {
      id,
      routineId: params.routineId,
      date: params.date,
      type: params.type,
      amount: params.amount,
      balanceAfter: params.balanceAfter,
      reason: params.reason,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * 기존 기록 수정/취소 시 역정산(정산 롤백) 트랜잭션 계산
   */
  public calculateReversal(
    previousTx: ExpHistory,
    currentBalance: number
  ): { nextBalance: number; reversalRecord: ExpHistory } {
    // 이전 변동이 +10이었으면 -10을 적용, -5였으면 +5를 적용
    const inverseAmount = -previousTx.amount;
    const { nextBalance, actualDelta } = this.applyExpDelta(currentBalance, inverseAmount);

    const reversalRecord = this.createHistoryRecord({
      routineId: previousTx.routineId,
      date: previousTx.date,
      type: 'ADJUSTMENT',
      amount: actualDelta,
      balanceAfter: nextBalance,
      reason: `기록 취소로 인한 EXP 정산 (${previousTx.reason})`,
    });

    return { nextBalance, reversalRecord };
  }
}

export const defaultExpCalculator = new ExpCalculator();
