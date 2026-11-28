'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useAppSelector } from '@routine-challenger/store';
import { filterRoutinesForDate } from '@routine-challenger/core';
import { Icon, IconName } from '@routine-challenger/ui';
import styles from './StatsOverview.module.scss';

// SSR 방지를 위해 동적 임포트
const ReactECharts = dynamic(() => import('echarts-for-react'), { ssr: false });

// ECharts 는 CSS 변수를 읽지 못하므로, 현재 테마의 색을 계산해서 전달한다.
interface ChartColors {
  accent: string;
  track: string;
  surface: string;
  text: string;
}

const DEFAULT_CHART_COLORS: ChartColors = {
  accent: '#0e9f6e',
  track: '#e8eaee',
  surface: '#ffffff',
  text: '#101418',
};

const readChartColors = (): ChartColors => {
  const style = getComputedStyle(document.documentElement);
  const read = (name: string, fallback: string) => style.getPropertyValue(name).trim() || fallback;
  return {
    accent: read('--accent', DEFAULT_CHART_COLORS.accent),
    track: read('--border-subtle', DEFAULT_CHART_COLORS.track),
    surface: read('--bg-surface', DEFAULT_CHART_COLORS.surface),
    text: read('--text-primary', DEFAULT_CHART_COLORS.text),
  };
};

// 테마(data-theme)가 바뀌면 차트 색도 함께 갱신한다.
const useChartColors = () => {
  const [colors, setColors] = useState<ChartColors>(DEFAULT_CHART_COLORS);

  useEffect(() => {
    const update = () => setColors(readChartColors());
    update();

    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => observer.disconnect();
  }, []);

  return colors;
};

const STAT_ITEMS: { key: 'exp' | 'streak' | 'days'; label: string; icon: IconName; tone: string }[] = [
  { key: 'exp', label: '총 누적 경험치', icon: 'zap', tone: 'expTone' },
  { key: 'streak', label: '연속 실천일', icon: 'flame', tone: 'streakTone' },
  { key: 'days', label: '총 실천 일수', icon: 'calendar', tone: 'daysTone' },
];

export const StatsOverview: React.FC = () => {
  const colors = useChartColors();
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

  const statValues = {
    exp: `${totalExp.toLocaleString()} EXP`,
    streak: `${currentStreak}일`,
    days: `${totalActiveDays}일`,
  };

  const progressPercent =
    scheduledToday.length > 0 ? Math.round((completedToday / scheduledToday.length) * 100) : 0;

  const chartOption = {
    tooltip: {
      show: hasScheduledToday,
      trigger: 'item',
      backgroundColor: colors.surface,
      borderColor: colors.track,
      textStyle: { color: colors.text, fontSize: 12 },
    },
    series: [
      {
        name: '실천 현황',
        type: 'pie',
        silent: !hasScheduledToday,
        radius: ['72%', '92%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        emptyCircleStyle: { color: colors.track },
        itemStyle: {
          borderRadius: 99,
          borderColor: colors.surface,
          borderWidth: 3,
        },
        label: { show: false },
        data: hasScheduledToday
          ? [
              { value: completedToday, name: '완료', itemStyle: { color: colors.accent } },
              { value: pendingToday, name: '남음', itemStyle: { color: colors.track } },
            ]
          : [],
      },
    ],
  };

  return (
    <div className={styles.container}>
      <section className={styles.panel} aria-labelledby="stats-title">
        <h2 id="stats-title" className={styles.title}>
          성장 지표
        </h2>

        <dl className={styles.statsList}>
          {STAT_ITEMS.map(item => (
            <div key={item.key} className={styles.statRow}>
              <dt className={styles.label}>
                <span className={`${styles.statIcon} ${styles[item.tone]}`}>
                  <Icon name={item.icon} size={16} />
                </span>
                {item.label}
              </dt>
              <dd className={styles.value}>{statValues[item.key]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className={styles.panel} aria-labelledby="today-title">
        <h2 id="today-title" className={styles.title}>
          오늘의 실천
        </h2>

        <div
          className={styles.chartWrapper}
          role="img"
          aria-label={
            hasScheduledToday
              ? `${selectedDate} 루틴 실천 현황: ${scheduledToday.length}개 중 ${completedToday}개 완료, ${pendingToday}개 남음`
              : `${selectedDate}에 예정된 루틴이 없습니다`
          }
        >
          <ReactECharts
            option={chartOption}
            className={styles.chart}
            opts={{ renderer: 'svg' }}
            style={{ height: '100%', width: '100%' }}
          />
          <div className={styles.chartCenter}>
            {hasScheduledToday ? (
              <>
                <span className={styles.chartPercent}>{progressPercent}%</span>
                <span className={styles.chartCaption}>
                  {completedToday} / {scheduledToday.length} 완료
                </span>
              </>
            ) : (
              <span className={styles.chartCaption}>오늘 예정된 루틴 없음</span>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
