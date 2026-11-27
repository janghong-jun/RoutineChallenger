import { Title } from '@routine-challenger/types';

export const INITIAL_TITLES_DATA: Title[] = [
  {
    id: 'first_step',
    name: '첫걸음',
    description: '루틴 챌린저를 시작하고 성장의 여정을 시작했습니다.',
    icon: '🌱',
    requirement: {
      type: 'DEFAULT',
      value: 0,
    },
    isUnlocked: true,
  },
  {
    id: 'small_achiever',
    name: '작은 실천가',
    description: '루틴을 누적 3일 이상 완수하며 실천의 즐거움을 알게 되었습니다.',
    icon: '⚡',
    requirement: {
      type: 'TOTAL_COMPLETED_DAYS',
      value: 3,
    },
    isUnlocked: false,
  },
  {
    id: 'steady_achiever',
    name: '꾸준한 실천가',
    description: '7일 연속으로 루틴을 실천하며 자신과의 약속을 지켰습니다.',
    icon: '🔥',
    requirement: {
      type: 'STREAK',
      value: 7,
    },
    isUnlocked: false,
  },
  {
    id: 'habit_builder',
    name: '습관 형성자',
    description: '14일 연속 실천으로 나만의 굳건한 일상 루틴을 정착시켰습니다.',
    icon: '🧱',
    requirement: {
      type: 'STREAK',
      value: 14,
    },
    isUnlocked: false,
  },
  {
    id: 'diligent_challenger',
    name: '성실한 도전자',
    description: '누적 실천 30일을 달성하며 끊임없이 성장하고 있습니다.',
    icon: '🏆',
    requirement: {
      type: 'TOTAL_COMPLETED_DAYS',
      value: 30,
    },
    isUnlocked: false,
  },
  {
    id: 'unshakeable_will',
    name: '흔들림 없는 의지',
    description: '30일 연속으로 실천하여 어떤 유혹에도 흔들리지 않는 의지를 증명했습니다.',
    icon: '💎',
    requirement: {
      type: 'STREAK',
      value: 30,
    },
    isUnlocked: false,
  },
  {
    id: 'self_care_expert',
    name: '자기관리 전문가',
    description: '누적 2,000 EXP를 달성하며 완벽한 자기관리의 모범이 되었습니다.',
    icon: '👑',
    requirement: {
      type: 'TOTAL_EXP',
      value: 2000,
    },
    isUnlocked: false,
  },
];
