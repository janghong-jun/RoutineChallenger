'use client';

import React from 'react';
import { RoutineCategory } from '@routine-challenger/types';
import {
  useAppDispatch,
  useAppSelector,
  setSelectedCategory,
} from '@routine-challenger/store';
import { filterRoutinesForDate } from '@routine-challenger/core';
import { RoutineCard } from '../RoutineCard/RoutineCard';
import styles from './RoutineList.module.scss';

interface RoutineListProps {
  onOpenCreateModal: () => void;
  onTitleUnlocked?: (titleName: string) => void;
}

const CATEGORY_TABS: {
  label: string;
  icon?: string;
  value: RoutineCategory | 'ALL';
}[] = [
  { label: '전체', value: 'ALL' },
  { label: '운동', icon: '🏃', value: 'EXERCISE' },
  { label: '학습', icon: '📚', value: 'LEARNING' },
  { label: '자기관리', icon: '🌿', value: 'SELF_CARE' },
  { label: '생활습관', icon: '⏰', value: 'HABIT' },
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

  return (
    <section className={styles.container} aria-labelledby="routine-list-heading">
      <h2 className={styles.srOnly} id="routine-list-heading">
        루틴 목록
      </h2>
      <div className={styles.topBar}>
        <div className={styles.categoryTabs} role="group" aria-label="루틴 카테고리 필터">
          {CATEGORY_TABS.map(tab => (
            <button
              type="button"
              key={tab.value}
              className={`${styles.tabButton} ${
                selectedCategory === tab.value ? styles.active : ''
              }`}
              onClick={() => dispatch(setSelectedCategory(tab.value))}
              aria-pressed={selectedCategory === tab.value}
              aria-label={`${tab.label} 카테고리`}
            >
              {tab.icon && <span aria-hidden="true">{tab.icon} </span>}
              {tab.label}
            </button>
          ))}
        </div>

        <button type="button" className={styles.addButton} onClick={onOpenCreateModal}>
          <span aria-hidden="true">+</span>
          <span>루틴 추가</span>
        </button>
      </div>

      {totalCount > 0 && (
        <div className={styles.progressCard}>
          <div className={styles.progressInfo}>
            <span className={styles.progressTitle}>오늘의 달성 현황</span>
            <span className={styles.progressStats}>
              {completedCount} / {totalCount} 완료 ({progressPercent}%)
            </span>
          </div>
          <progress
            className={styles.progressBar}
            value={progressPercent}
            max={100}
            aria-label={`${selectedDate} 루틴 달성률`}
          />
        </div>
      )}

      <div className={styles.list}>
        {displayRoutines.length > 0 ? (
          displayRoutines.map(routine => (
            <RoutineCard
              key={routine.id}
              routine={routine}
              date={selectedDate}
              isHoliday={isHoliday}
              onTitleUnlocked={onTitleUnlocked}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon} aria-hidden="true">
              🎯
            </span>
            <h3 className={styles.emptyTitle}>
              {selectedCategory === 'ALL'
                ? '오늘 예정된 루틴이 없습니다.'
                : '해당 카테고리에 등록된 루틴이 없습니다.'}
            </h3>
            <p className={styles.emptyDesc}>
              추천 템플릿을 선택하거나 나만의 루틴을 직접 생성하여 성장의 여정을 시작해 보세요!
            </p>
            <button type="button" className={styles.emptyCta} onClick={onOpenCreateModal}>
              첫 루틴 추가하기
            </button>
          </div>
        )}
      </div>
    </section>
  );
};
