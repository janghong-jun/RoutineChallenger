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
import styles from './page.module.scss';

export default function Home() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTitleOpen, setIsTitleOpen] = useState(false);
  const [isDataOpen, setIsDataOpen] = useState(false);
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
        onOpenTitleModal={() => setIsTitleOpen(true)}
        onOpenDataModal={() => setIsDataOpen(true)}
      />
      <DateNavigator />
      <WeeklyTracker />

      <main className={styles.contentWrapper}>
        <div className={styles.leftCol}>
          <RoutineList
            onOpenCreateModal={() => setIsCreateOpen(true)}
            onTitleUnlocked={handleTitleUnlocked}
          />
        </div>

        <aside className={styles.sidebar}>
          <StatsOverview />
        </aside>
      </main>

      {isCreateOpen && (
        <CreateRoutineModal
          onClose={() => setIsCreateOpen(false)}
          selectedDate={selectedDate}
        />
      )}

      <TitleGalleryModal
        isOpen={isTitleOpen}
        onClose={() => setIsTitleOpen(false)}
      />

      {isDataOpen && (
        <DataModal
          onClose={() => setIsDataOpen(false)}
        />
      )}

      {unlockedToast && (
        <div className={styles.toast}>
          <span className={styles.toastIcon}>🎉</span>
          <div>
            <div className={styles.toastTitle}>새로운 타이틀 해금!</div>
            <div className={styles.toastMessage}>
              축하합니다! <strong>{unlockedToast}</strong> 타이틀을 획득했습니다.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
