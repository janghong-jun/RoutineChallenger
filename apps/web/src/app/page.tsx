'use client';

import React, { useState } from 'react';
import { Header } from '@/components/Header/Header';
import { DateNavigator } from '@/components/DateNavigator/DateNavigator';
import { WeeklyTracker } from '@/components/WeeklyTracker/WeeklyTracker';
import { RoutineList } from '@/components/RoutineList/RoutineList';
import { StatsOverview } from '@/components/StatsOverview/StatsOverview';
import { CreateRoutineModal } from '@/components/CreateRoutineModal/CreateRoutineModal';
import { TitleGalleryModal } from '@/components/TitleGalleryModal/TitleGalleryModal';
import { DataModal } from '@/components/DataModal/DataModal';
import { useAppSelector } from '@routine-challenger/store';
import { Icon } from '@routine-challenger/ui';
import styles from './page.module.scss';

export default function Home() {
  const [activeModal, setActiveModal] = useState<'create' | 'titles' | 'data' | null>(null);
  const [unlockedToast, setUnlockedToast] = useState<string | null>(null);
  const { selectedDate } = useAppSelector(state => state.date);

  const handleTitleUnlocked = (titleName: string) => {
    setUnlockedToast(titleName);
    setTimeout(() => {
      setUnlockedToast(null);
    }, 4500);
  };

  return (
    <div className={styles.mainLayout}>
      <Header
        onOpenTitleModal={() => setActiveModal('titles')}
        onOpenDataModal={() => setActiveModal('data')}
      />

      <div className={styles.page}>
        <section className={styles.dateSection} aria-label="날짜 선택">
          <DateNavigator />
          <WeeklyTracker />
        </section>

        <main className={styles.contentWrapper} id="main-content" tabIndex={-1}>
          <div className={styles.leftCol}>
            <RoutineList
              onOpenCreateModal={() => setActiveModal('create')}
              onTitleUnlocked={handleTitleUnlocked}
            />
          </div>

          <aside className={styles.sidebar} aria-labelledby="stats-title">
            <StatsOverview />
          </aside>
        </main>
      </div>

      {activeModal === 'create' && (
        <CreateRoutineModal
          onClose={() => setActiveModal(null)}
          selectedDate={selectedDate}
        />
      )}

      <TitleGalleryModal
        isOpen={activeModal === 'titles'}
        onClose={() => setActiveModal(null)}
      />

      {activeModal === 'data' && (
        <DataModal
          onClose={() => setActiveModal(null)}
        />
      )}

      <div className={styles.toastRegion} role="status" aria-live="polite" aria-atomic="true">
        {unlockedToast && (
          <div className={styles.toast}>
            <span className={styles.toastIcon}>
              <Icon name="trophy" size={18} />
            </span>
            <div>
              <div className={styles.toastTitle}>새로운 타이틀 해금!</div>
              <div className={styles.toastMessage}>
                축하합니다! <strong>{unlockedToast}</strong> 타이틀을 획득했습니다.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
