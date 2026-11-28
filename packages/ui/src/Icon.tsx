import React from 'react';
import { RoutineCategory } from '@routine-challenger/types';

/**
 * 24x24 stroke 기반 아이콘 모음.
 * 외부 아이콘 라이브러리 없이 필요한 것만 직접 관리한다.
 * 색상은 currentColor를 따르므로 부모의 color 로 제어한다.
 */
const ICON_PATHS = {
  // 공통 동작
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  x: <path d="M6 6l12 12M18 6L6 18" />,
  'chevron-left': <path d="M15 5l-7 7 7 7" />,
  'chevron-right': <path d="M9 5l7 7-7 7" />,
  'arrow-up': <path d="M12 19V5M6 11l6-6 6 6" />,
  pause: <path d="M9 5v14M15 5v14" />,
  play: <path d="M8 5l11 7-11 7V5z" />,
  trash: <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v5M14 11v5" />,
  save: (
    <>
      <path d="M5 3h12l4 4v14H3V3h2zM7 3v6h10V3M7 21v-8h10v8" />
    </>
  ),
  sun: (
    <>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </>
  ),
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z" />,
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M8 3v4M16 3v4" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1" />
    </>
  ),

  // 성장 지표
  zap: <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z" />,
  flame: (
    <path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.3 1.2 1 2 2 2.2C11 8 11 5.5 12 3z" />
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0V4z" />
      <path d="M8 6H5a2 2 0 0 0 0 4h3M16 6h3a2 2 0 0 1 0 4h-3M12 13v4M8 21h8M10 17h4" />
    </>
  ),
  sparkles: (
    <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16z" />
  ),
  sprout: (
    <path d="M12 21v-8M12 13c0-4-3-6-7-6 0 4 3 6 7 6zM12 15c0-3 2-5 6-5 0 3-2 5-6 5z" />
  ),
  layers: <path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" />,
  gem: <path d="M6 4h12l4 6-10 11L2 10l4-6zM2 10h20M9 4l-2 6 5 11 5-11-2-6" />,
  crown: <path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5L3 8z" />,

  // 카테고리 / 템플릿
  dumbbell: <path d="M6 8v8M3 10v4M18 8v8M21 10v4M6 12h12" />,
  'book-open': <path d="M12 7c-2-1.5-5-2-8-2v13c3 0 6 .5 8 2 2-1.5 5-2 8-2V5c-3 0-6 .5-8 2zM12 7v13" />,
  leaf: <path d="M5 19c0-8 5-14 14-14 0 9-6 14-14 14zM5 19c3-5 6-8 10-10" />,
  repeat: (
    <path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4" />
  ),
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  heart: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.5A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  message: <path d="M4 5h16v11H9l-5 4V5z" />,
  code: <path d="M9 8l-5 4 5 4M15 8l5 4-5 4" />,
  droplet: <path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z" />,
  pen: <path d="M4 20l1-4L16 5l3 3L8 19l-4 1zM14 7l3 3" />,
} satisfies Record<string, React.ReactNode>;

export type IconName = keyof typeof ICON_PATHS;

export interface IconProps {
  name: IconName;
  /** px 단위 크기 (기본 16) */
  size?: number;
  strokeWidth?: number;
  className?: string;
  /** 의미 있는 아이콘일 때만 지정한다. 없으면 장식용으로 스크린리더에서 숨긴다. */
  label?: string;
}

export const Icon: React.FC<IconProps> = ({
  name,
  size = 16,
  strokeWidth = 1.75,
  className,
  label,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={strokeWidth}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    role={label ? 'img' : undefined}
    aria-label={label}
    aria-hidden={label ? undefined : true}
    focusable="false"
  >
    {ICON_PATHS[name]}
  </svg>
);

/* ---- 데이터(타이틀/템플릿/카테고리)와 아이콘 이름 매핑 ---- */
/* 데이터 파일의 이모지는 그대로 두고, 화면에서만 SVG 아이콘으로 대체한다. */

export const CATEGORY_ICON_NAMES: Record<RoutineCategory, IconName> = {
  EXERCISE: 'dumbbell',
  LEARNING: 'book-open',
  SELF_CARE: 'leaf',
  HABIT: 'repeat',
};

const TITLE_ICON_NAMES: Record<string, IconName> = {
  first_step: 'sprout',
  small_achiever: 'zap',
  steady_achiever: 'flame',
  habit_builder: 'layers',
  diligent_challenger: 'trophy',
  unshakeable_will: 'gem',
  self_care_expert: 'crown',
};

const TEMPLATE_ICON_NAMES: Record<string, IconName> = {
  tpl_exercise_1: 'heart',
  tpl_exercise_2: 'dumbbell',
  tpl_exercise_3: 'activity',
  tpl_learning_1: 'book-open',
  tpl_learning_2: 'message',
  tpl_learning_3: 'code',
  tpl_selfcare_1: 'droplet',
  tpl_selfcare_2: 'pen',
  tpl_selfcare_3: 'leaf',
  tpl_habit_1: 'sparkles',
  tpl_habit_2: 'moon',
};

export const getTitleIconName = (titleId: string): IconName =>
  TITLE_ICON_NAMES[titleId] ?? 'trophy';

export const getTemplateIconName = (templateId: string, category: RoutineCategory): IconName =>
  TEMPLATE_ICON_NAMES[templateId] ?? CATEGORY_ICON_NAMES[category];
