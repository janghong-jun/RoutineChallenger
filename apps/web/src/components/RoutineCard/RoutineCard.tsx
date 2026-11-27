'use client';

import React from 'react';
import { Routine, RoutineRecord, DifficultyLevel } from '@routine-challenger/types';
import {
  useAppDispatch,
  useAppSelector,
  upsertRecord,
  removeRecord,
  addExpTransaction,
  increaseDifficulty,
  pauseRoutine,
  resumeRoutine,
  deleteRoutine,
  unlockTitles,
  setStreaks,
} from '@routine-challenger/store';
import {
  defaultExpCalculator,
  defaultTitleEvaluator,
  isDifficultyUnlocked,
  getRecommendedTarget,
  calculateStreaks,
} from '@routine-challenger/core';
import { getStorageContainer } from '@routine-challenger/storage';
import { CategoryBadge, DifficultyBadge, ExpBadge } from '@routine-challenger/ui';
import styles from './RoutineCard.module.scss';

interface RoutineCardProps {
  routine: Routine;
  date: string;
  isHoliday: boolean;
  onTitleUnlocked?: (titleName: string) => void;
}

export const RoutineCard: React.FC<RoutineCardProps> = ({
  routine,
  date,
  isHoliday,
  onTitleUnlocked,
}) => {
  const dispatch = useAppDispatch();
  const recordId = `${routine.id}_${date}`;
  const record = useAppSelector(state => state.record.recordsMap[recordId]);
  const allRecords = useAppSelector(state => state.record.recordsMap);
  const { totalExp, unlockedTitleIds } = useAppSelector(state => state.user);

  const isCompleted = record?.completed ?? false;

  // 이 루틴의 전체 누적 성공 횟수 계산
  const cumulativeCompletions = Object.values(allRecords).filter(
    r => r.routineId === routine.id && r.completed
  ).length;

  const nextDifficulty = (routine.difficultyLevel + 1) as DifficultyLevel;
  const canLevelUp =
    routine.difficultyLevel < 5 &&
    isDifficultyUnlocked(nextDifficulty, cumulativeCompletions);

  // 예상 획득 EXP 계산
  const expReward = defaultExpCalculator.getSuccessExp(isHoliday);

  const handleToggle = async () => {
    const storage = getStorageContainer();
    const nextCompleted = !isCompleted;

    if (nextCompleted) {
      // 1. 완료 처리: EXP 획득
      const { amount, type } = expReward;
      const { nextBalance } = defaultExpCalculator.applyExpDelta(totalExp, amount);

      const expTx = defaultExpCalculator.createHistoryRecord({
        routineId: routine.id,
        date,
        type,
        amount,
        balanceAfter: nextBalance,
        reason: `${routine.title} 실천 완료`,
      });

      const newRecord: RoutineRecord = {
        id: recordId,
        routineId: routine.id,
        date,
        completed: true,
        actualValue: routine.targetValue,
        expGained: amount,
        expDeducted: 0,
        isHoliday,
        completedAt: new Date().toISOString(),
      };

      // 스토리지 저장
      await storage.records.save(newRecord);
      await storage.exp.add(expTx);

      // Redux 업데이트
      dispatch(upsertRecord(newRecord));
      dispatch(addExpTransaction({ history: expTx, newTotalExp: nextBalance }));

      // 유저 프로필 스토리지 갱신
      await storage.userProfile.save({
        id: 'current_user_profile',
        totalExp: nextBalance,
        selectedTitleId: 'first_step',
        unlockedTitleIds,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });

      // 스트릭 재계산
      const allCompletedDates = Object.values(allRecords)
        .filter(r => r.completed || r.id === recordId)
        .map(r => r.date);
      const streakResult = calculateStreaks(allCompletedDates, date);
      dispatch(setStreaks(streakResult));

      // 타이틀 해금 판정
      const newUnlocks = defaultTitleEvaluator.evaluateNewUnlocks(unlockedTitleIds, {
        totalExp: nextBalance,
        totalCompletedDays: streakResult.totalActiveDays,
        currentStreak: streakResult.currentStreak,
        bestStreak: streakResult.bestStreak,
        completedCategories: [routine.category],
      });

      if (newUnlocks.length > 0) {
        dispatch(unlockTitles(newUnlocks));
        if (onTitleUnlocked) {
          onTitleUnlocked(newUnlocks.map(u => u.name).join(', '));
        }
      }
    } else {
      // 2. 취소 처리: EXP 역정산 (롤백)
      const prevGained = record?.expGained || 0;
      const { nextBalance } = defaultExpCalculator.applyExpDelta(totalExp, -prevGained);

      const expTx = defaultExpCalculator.createHistoryRecord({
        routineId: routine.id,
        date,
        type: 'ADJUSTMENT',
        amount: -prevGained,
        balanceAfter: nextBalance,
        reason: `${routine.title} 실천 취소`,
      });

      await storage.records.delete(routine.id, date);
      await storage.exp.add(expTx);

      dispatch(removeRecord({ routineId: routine.id, date }));
      dispatch(addExpTransaction({ history: expTx, newTotalExp: nextBalance }));

      // 스트릭 재계산
      const remainingDates = Object.values(allRecords)
        .filter(r => r.completed && r.id !== recordId)
        .map(r => r.date);
      const streakResult = calculateStreaks(remainingDates, date);
      dispatch(setStreaks(streakResult));
    }
  };

  const handleLevelUp = async () => {
    if (!canLevelUp) return;
    const newTarget = getRecommendedTarget(routine.targetValue, nextDifficulty);
    const storage = getStorageContainer();

    const updated: Routine = {
      ...routine,
      difficultyLevel: nextDifficulty,
      targetValue: newTarget,
      updatedAt: new Date().toISOString(),
    };

    await storage.routines.update(updated);
    dispatch(increaseDifficulty({ id: routine.id, newLevel: nextDifficulty, newTargetValue: newTarget }));
  };

  const handleTogglePause = async () => {
    const storage = getStorageContainer();
    if (routine.status === 'ACTIVE') {
      await storage.routines.update({ ...routine, status: 'PAUSED', updatedAt: new Date().toISOString() });
      dispatch(pauseRoutine(routine.id));
    } else {
      await storage.routines.update({ ...routine, status: 'ACTIVE', updatedAt: new Date().toISOString() });
      dispatch(resumeRoutine(routine.id));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`'${routine.title}' 루틴을 중단(삭제)하시겠습니까?\n기존 실천 기록과 EXP는 안전하게 보존됩니다.`)) {
      return;
    }
    const storage = getStorageContainer();
    await storage.routines.delete(routine.id);
    dispatch(deleteRoutine(routine.id));
  };

  return (
    <div
      className={`${styles.card} ${isCompleted ? styles.isCompleted : ''} ${
        routine.status === 'PAUSED' ? styles.isPaused : ''
      }`}
    >
      <div className={styles.leftSection}>
        <button
          className={`${styles.checkButton} ${isCompleted ? styles.checked : ''}`}
          onClick={handleToggle}
          title={isCompleted ? '완료 취소' : '실천 완료 체크'}
        >
          {isCompleted && '✓'}
        </button>

        <div className={styles.content}>
          <div className={styles.badgesRow}>
            <CategoryBadge category={routine.category} />
            <DifficultyBadge level={routine.difficultyLevel} />
            <ExpBadge
              amount={isCompleted ? record?.expGained || 0 : expReward.amount}
              isHolidayBonus={isHoliday}
            />
          </div>

          <h3 className={styles.routineTitle}>{routine.title}</h3>

          {routine.description && (
            <p className={styles.description}>{routine.description}</p>
          )}

          <div className={styles.targetRow}>
            <span className={styles.targetPill}>
              {routine.targetType === 'TIME' ? '⏱️' : '🎯'}{' '}
              {routine.targetValue}
              {routine.targetUnit}
            </span>
            <span>누적 성공 {cumulativeCompletions}회</span>
          </div>
        </div>
      </div>

      <div className={styles.rightSection}>
        {canLevelUp && (
          <button
            className={styles.levelUpButton}
            onClick={handleLevelUp}
            title={`Lv.${nextDifficulty}로 승급하고 목표를 올립니다.`}
          >
            ⭐ 난이도 승급
          </button>
        )}

        <button
          className={styles.actionButton}
          onClick={handleTogglePause}
          title={routine.status === 'ACTIVE' ? '루틴 일시정지' : '루틴 다시 시작'}
        >
          {routine.status === 'ACTIVE' ? '⏸️' : '▶️'}
        </button>

        <button
          className={styles.actionButton}
          onClick={handleDelete}
          title="루틴 삭제 (기존 기록 보존)"
        >
          🗑️
        </button>
      </div>
    </div>
  );
};
