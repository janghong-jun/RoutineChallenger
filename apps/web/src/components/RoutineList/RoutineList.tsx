'use client';

import React from 'react';
import { RoutineCategory } from '@routine-challenger/types';
import {
  useAppDispatch,
  useAppSelector,
  setSelectedCategory,
} from '@routine-challenger/store';
import { filterRoutinesForDate } from '@routine-challenger/core';
import { Icon, CATEGORY_ICON_NAMES, IconName } from '@routine-challenger/ui';
import { RoutineCard } from '../RoutineCard/RoutineCard';
import styles from './RoutineList.module.scss';

interface RoutineListProps {
  onOpenCreateModal: () => void;
  onTitleUnlocked?: (titleName: string) => void;
}

const CATEGORY_TABS: { label: string; value: RoutineCategory | 'ALL'; icon?: IconName }[] = [
  { label: '전체', value: 'ALL' },
  { label: '운동', value: 'EXERCISE', icon: CATEGORY_ICON_NAMES.EXERCISE },
  { label: '학습', value: 'LEARNING', icon: CATEGORY_ICON_NAMES.LEARNING },
  { label: '자기관리', value: 'SELF_CARE', icon: CATEGORY_ICON_NAMES.SELF_CARE },
  { label: '생활습관', value: 'HABIT', icon: CATEGORY_ICON_NAMES.HABIT },
];

export const RoutineList: React.FC<RoutineListProps> = ({
  onOpenCreateModal,
  onTitleUnlocked,
}) => {
  const dispatch = useAppDispatch();
  const routines = useAppSelector(state => state.routine.routines);
  const selectedCategory = useAppSelector(state => state.routine.selectedCategory);
  const { selectedDate, isHoliday } = useAppSelector(state => state.date);
  const recordsMap = useAppSelector(state => state.record.recordsMap);

  // 1. 해당 날짜에 스케줄된 루틴 필터링
  const scheduledForToday = filterRoutinesForDate(routines, selectedDate);

  // 2. 카테고리 탭 필터링
  const displayRoutines = scheduledForToday.filter(routine => {
    if (selectedCategory === 'ALL') return true;
    return routine.category === selectedCategory;
  });

  // 오늘 달성률 계산
  const totalCount = scheduledForToday.length;
  const completedCount = scheduledForToday.filter(
    r => recordsMap[`${r.id}_${selectedDate}`]?.completed
  ).length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const isAllDone = totalCount > 0 && completedCount === totalCount;

  return (
    <section className={styles.container} aria-label="루틴 목록">
      <div className={styles.topBar}>
        <div className={styles.categoryTabs} role="group" aria-label="카테고리 필터">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.value}
              type="button"
              className={`${styles.tabButton} ${
                selectedCategory === tab.value ? styles.active : ''
              }`}
              aria-pressed={selectedCategory === tab.value}
              onClick={() => dispatch(setSelectedCategory(tab.value))}
            >
              {tab.icon && <Icon name={tab.icon} size={14} />}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        <button type="button" className={styles.addButton} onClick={onOpenCreateModal}>
          <Icon name="plus" size={16} strokeWidth={2.2} />
          <span>루틴 추가</span>
        </button>
      </div>

      {totalCount > 0 && (
        <section className={styles.summary} aria-label="오늘의 달성 현황">
          <div className={styles.summaryInfo}>
            <span className={styles.summaryTitle}>
              {isAllDone ? (
                <>
                  <Icon name="check" size={16} strokeWidth={2.4} className={styles.doneIcon} />
                  오늘 루틴을 모두 완료했어요
                </>
              ) : (
                '오늘의 달성 현황'
              )}
            </span>
            <span className={styles.summaryStats}>
              <strong>{completedCount}</strong> / {totalCount} 완료 · {progressPercent}%
            </span>
          </div>
          <div
            className={styles.track}
            role="progressbar"
            aria-label="오늘의 루틴 달성률"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progressPercent}
          >
            <span className={styles.fill} style={{ width: `${progressPercent}%` }} />
          </div>
        </section>
      )}

      {displayRoutines.length > 0 ? (
        <ul className={styles.list}>
          {displayRoutines.map(routine => (
            <li key={routine.id} className={styles.listItem}>
              <RoutineCard
                routine={routine}
                date={selectedDate}
                isHoliday={isHoliday}
                onTitleUnlocked={onTitleUnlocked}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>
            <Icon name="target" size={24} />
          </span>
          <h2 className={styles.emptyTitle}>
            {selectedCategory === 'ALL'
              ? '오늘 예정된 루틴이 없습니다.'
              : '해당 카테고리에 등록된 루틴이 없습니다.'}
          </h2>
          <p className={styles.emptyDesc}>
            추천 템플릿을 선택하거나 나만의 루틴을 직접 생성하여 성장의 여정을 시작해 보세요.
          </p>
          <button type="button" className={styles.emptyCta} onClick={onOpenCreateModal}>
            첫 루틴 추가하기
          </button>
        </div>
      )}
    </section>
  );
};
