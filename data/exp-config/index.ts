import { ExpPolicyConfig } from '@routine-challenger/types';

/**
 * 경험치(EXP) 보상 및 차감 밸런싱 정책 설정
 * 하드코딩되지 않고 별도 데이터로 분리되어 유연하게 조정 가능합니다.
 */
export const DEFAULT_EXP_CONFIG: ExpPolicyConfig = {
  // 일반일(평일/주말 기본) 성공 시 획득 EXP
  normalSuccessExp: 10,

  // 휴식일(대한민국 공휴일/대체공휴일) 성공 시 획득 EXP (일반일의 2배 보상)
  holidaySuccessExp: 20,

  // 일반일 미실천(실패) 시 차감 EXP
  normalFailDeduction: 5,

  // 휴식일 미실천(실패) 시 차감 EXP (휴식일이므로 차감 폭 대폭 완화)
  holidayFailDeduction: 2,
};
