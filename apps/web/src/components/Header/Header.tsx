'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@routine-challenger/store';
import { Icon, getTitleIconName } from '@routine-challenger/ui';
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
      <div className={styles.inner}>
        <div className={styles.brand}>
          {/* 로고: 진행 링 + 체크. 장식용이므로 스크린리더에서 숨긴다. */}
          <svg className={styles.brandMark} viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="12" r="9" className={styles.brandRing} />
            <path d="M12 3a9 9 0 0 1 9 9" className={styles.brandArc} />
            <path d="M8.5 12.5l2.4 2.4 4.6-5" className={styles.brandCheck} />
          </svg>
          <h1 className={styles.brandName}>Routine Challenger</h1>
        </div>

        <div className={styles.status}>
          <button
            type="button"
            className={styles.titleButton}
            onClick={onOpenTitleModal}
            aria-label={`대표 타이틀 ${currentTitle?.name || '첫걸음'}. 전체 타이틀 보기`}
            title="전체 타이틀 확인 및 대표 타이틀 변경"
          >
            <Icon name={getTitleIconName(currentTitle?.id || 'first_step')} size={16} />
            <span>{currentTitle?.name || '첫걸음'}</span>
          </button>

          <div
            className={styles.stat}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            title="현재 보유 경험치 (성공 시 획득, 일반일 미실천 시 차감)"
          >
            <Icon name="zap" size={16} className={styles.expIcon} />
            <span className={styles.statValue}>{totalExp.toLocaleString()}</span>
            <span className={styles.statUnit}>EXP</span>
          </div>

          <div
            className={styles.stat}
            role="status"
            aria-live="polite"
            aria-atomic="true"
            title="현재 연속 실천 일수"
          >
            <Icon name="flame" size={16} className={styles.streakIcon} />
            <span className={styles.statValue}>{currentStreak}</span>
            <span className={`${styles.statUnit} ${styles.statUnitTight}`}>일 연속</span>
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
            <Icon name="save" size={18} />
          </button>
          <button
            type="button"
            className={styles.themeButton}
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
            aria-pressed={theme === 'dark'}
            title={theme === 'dark' ? '라이트 모드로 전환' : '다크 모드로 전환'}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
          </button>
        </div>
      </div>
    </header>
  );
};
