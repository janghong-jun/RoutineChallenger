export type ExpTransactionType =
  | 'EARN_NORMAL'
  | 'EARN_HOLIDAY'
  | 'DEDUCT_NORMAL'
  | 'DEDUCT_HOLIDAY'
  | 'ADJUSTMENT';

export interface ExpHistory {
  id: string;
  date: string; // YYYY-MM-DD
  routineId: string;
  type: ExpTransactionType;
  amount: number; // positive for gain, negative for deduction
  balanceAfter: number;
  reason: string;
  timestamp: string; // ISO string
}

export interface ExpPolicyConfig {
  normalSuccessExp: number; // default: 10
  holidaySuccessExp: number; // default: 20
  normalFailDeduction: number; // default: 5
  holidayFailDeduction: number; // default: 2
}
