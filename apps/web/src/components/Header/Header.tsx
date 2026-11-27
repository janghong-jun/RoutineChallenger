'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@routine-challenger/store';
import styles from './Header.module.scss';

interface HeaderProps {
  onOpenTitleModal: () => void;
  onOpenDataModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenTitleModal, onOpenDataModal }) => {
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
        <div className={styles.brandLogo} aria-hidden="true">
          ⚡
        </div>
        <h1 className={styles.brandName}>ROUTINE CHALLENGER</h1>
      </div>

      <div className={styles.statusPills}>
        <button
          type="button"
          className={styles.titlePill}
          onClick={onOpenTitleModal}
          aria-label={`타이틀 갤러리 열기. 대표 타이틀: ${currentTitle?.name || '첫걸음'}`}
          title="클릭하여 전체 타이틀 확인 및 대표 타이틀 변경"
        >
          <span aria-hidden="true">{currentTitle?.icon || '🌱'}</span>
          <span>{currentTitle?.name || '첫걸음'}</span>
        </button>

        <div className={styles.expPill} role="status" aria-live="polite" aria-atomic="true">
          <span aria-hidden="true">✨</span>
          <span>{totalExp.toLocaleString()} EXP</span>
        </div>

        <div
          className={styles.streakPill}
          role="status"
          aria-live="polite"
          aria-atomic="true"
          title="현재 연속 실천 일수"
        >
          <span aria-hidden="true">🔥</span>
          <span>{currentStreak}일 연속</span>
        </div>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.themeButton}
          onClick={onOpenDataModal}
          aria-label="JSON 데이터 관리 열기"
          title="JSON 데이터 내보내기 및 가져오기"
        >
          <span aria-hidden="true">💾</span>
        </button>
        <button
          type="button"
          className={styles.themeButton}
          onClick={toggleTheme}
          aria-label="다크 모드"
          aria-pressed={theme === 'dark'}
          title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
        >
          <span aria-hidden="true">{theme === 'dark' ? '☀️' : '🌙'}</span>
        </button>
      </div>
    </header>
  );
};
