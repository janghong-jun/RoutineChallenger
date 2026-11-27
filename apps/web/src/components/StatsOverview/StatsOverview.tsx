'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@routine-challenger/store';
import { filterRoutinesForDate } from '@routine-challenger/core';
import styles from './StatsOverview.module.scss';

// SSR 방지를 위해 동적 임포트
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

export const StatsOverview: React.FC = () => {
  const { totalExp, currentStreak, totalActiveDays } = useAppSelector(state => state.user);
  const routines = useAppSelector(state => state.routine.routines);
  const recordsMap = useAppSelector(state => state.record.recordsMap);
  const { selectedDate } = useAppSelector(state => state.date);

  const scheduledToday = filterRoutinesForDate(routines, selectedDate);
  const completedToday = scheduledToday.filter(
    r => recordsMap[`${r.id}_${selectedDate}`]?.completed
  ).length;
  const pendingToday = Math.max(0, scheduledToday.length - completedToday);
  const hasScheduledToday = scheduledToday.length > 0;

  // 카테고리별 실천 분포 계산
  const categoryCounts: Record<string, number> = {
    EXERCISE: 0,
    LEARNING: 0,
    SELF_CARE: 0,
    HABIT: 0,
  };

  Object.values(recordsMap).forEach(r => {
    if (r.completed) {
      const routine = routines.find(rt => rt.id === r.routineId);
      if (routine && routine.category) {
        categoryCounts[routine.category] = (categoryCounts[routine.category] || 0) + 1;
      }
    }
  });

  const chartOption = {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(18, 23, 39, 0.9)',
      borderColor: 'rgba(255, 255, 255, 0.1)',
      textStyle: { color: '#f8fafc', fontSize: 12 },
    },
    legend: {
      show: hasScheduledToday,
      orient: 'horizontal',
      left: 'center',
      bottom: '2%',
      textStyle: { color: '#94a3b8', fontSize: 11 },
    },
    series: [
      {
        name: '실천 현황',
        type: 'pie',
        silent: !hasScheduledToday,
        radius: ['55%', '80%'],
        center: ['50%', '45%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 6,
          borderColor: '#111625',
          borderWidth: 2,
        },
        label: { show: false },
        data: hasScheduledToday
          ? [
              { value: completedToday, name: '완료됨', itemStyle: { color: '#10b981' } },
              {
                value: pendingToday,
                name: '미완료',
                itemStyle: { color: 'rgba(99, 102, 241, 0.25)' },
              },
            ]
          : [],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <span className={styles.title}>성장 지표 현황</span>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <span className={styles.label}>총 누적 경험치</span>
          <span className={`${styles.value} ${styles.expValue}`}>
            {totalExp.toLocaleString()} EXP
          </span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.label}>연속 실천일</span>
          <span className={`${styles.value} ${styles.streakValue}`}>{currentStreak}일</span>
        </div>

        <div className={styles.statCard}>
          <span className={styles.label}>총 실천 일수</span>
          <span className={`${styles.value} ${styles.activeDaysValue}`}>{totalActiveDays}일</span>
        </div>
      </div>

      <div className={styles.chartWrapper}>
        <ReactECharts option={chartOption} className={styles.chart} opts={{ renderer: 'svg' }} />
        {!hasScheduledToday && <span className={styles.emptyChartText}>오늘 예정된 루틴 없음</span>}
      </div>
    </div>
  );
};
