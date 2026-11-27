'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@routine-challenger/store';
import styles from './Header.module.scss';

interface HeaderProps {
  onOpenTitleModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTitleModal }) => {
  const { totalExp, selectedTitleId, titles, currentStreak } = useAppSelector(state => state.user);
  const [theme, setTheme] = useState<'dark' | 'light'>('light');

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const currentTheme =
        document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      setTheme(currentTheme);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    localStorage.setItem('rc_theme', nextTheme);
  };

  const currentTitle = titles.find(t => t.id === selectedTitleId) || titles[0];

  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.brandLogo}>⚡</div>
        <span className={styles.brandName}>ROUTINE CHALLENGER</span>
      </div>

      <div className={styles.statusPills}>
        <button
          className={styles.titlePill}
          onClick={onOpenTitleModal}
          title="클릭하여 전체 타이틀 확인 및 대표 타이틀 변경"
        >
          <span>{currentTitle?.icon || '🌱'}</span>
          <span>{currentTitle?.name || '첫걸음'}</span>
        </button>

        <div
          className={styles.expPill}
          title="현재 보유 경험치 (성공 시 획득, 일반일 미실천 시 차감)"
        >
          <span>✨</span>
          <span>{totalExp.toLocaleString()} EXP</span>
        </div>

        <div className={styles.streakPill} title="현재 연속 실천 일수">
          <span>🔥</span>
          <span>{currentStreak}일 연속</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          className={styles.themeButton}
          onClick={toggleTheme}
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </header>
  );
};
