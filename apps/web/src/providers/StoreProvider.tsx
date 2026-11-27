'use client';

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import {
  makeStore,
  AppStore,
  setRoutines,
  setRecords,
  setExpHistory,
  setUserProfile,
  setStreaks,
  goToToday,
} from '@routine-challenger/store';
import { getStorageContainer, isAppDataSnapshot } from '@routine-challenger/storage';
import { calculateStreaks } from '@routine-challenger/core';
import { getKoreaTodayDateString } from '@routine-challenger/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(goToToday());

    // 테마 설정 복원
    const savedTheme = localStorage.getItem('rc_theme');
    localStorage.removeItem('rc_github_token');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // IndexedDB 데이터 로드 및 초기화
    async function initData() {
      const storage = getStorageContainer();

      try {
        let [routines, records, expHistory] = await Promise.all([
          storage.routines.getAll(),
          storage.records.getAll(),
          storage.exp.getAll(),
        ]);

        let profile = await storage.userProfile.get();
        if (routines.length === 0 && records.length === 0 && expHistory.length === 0 && !profile) {
          const response = await fetch('/data/routine-challenger.json', { cache: 'no-store' });
          if (response.ok) {
            const snapshot: unknown = await response.json();
            if (!isAppDataSnapshot(snapshot)) {
              throw new Error('초기 JSON 데이터의 형식이 올바르지 않습니다.');
            }
            if (
              snapshot.routines.length > 0 ||
              snapshot.records.length > 0 ||
              snapshot.expHistory.length > 0 ||
              snapshot.userProfile ||
              snapshot.customHolidays.length > 0
            ) {
              await storage.importSnapshot(snapshot);
              [routines, records, expHistory] = await Promise.all([
                storage.routines.getAll(),
                storage.records.getAll(),
                storage.exp.getAll(),
              ]);
              profile = await storage.userProfile.get();
            }
          }
        }

        store.dispatch(setRoutines(routines));
        store.dispatch(setRecords(records));
        store.dispatch(setExpHistory(expHistory));

        if (!profile) {
          profile = {
            id: 'current_user_profile',
            totalExp: 0,
            selectedTitleId: 'first_step',
            unlockedTitleIds: ['first_step'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          await storage.userProfile.save(profile);
        }
        store.dispatch(setUserProfile(profile));

        // 스트릭 계산
        const completedDates = records.filter(r => r.completed).map(r => r.date);
        const todayStr = getKoreaTodayDateString();
        const streakResult = calculateStreaks(completedDates, todayStr);
        store.dispatch(setStreaks(streakResult));
      } catch (err) {
        console.error('Failed to initialize data from IndexedDB:', err);
      }
    }

    initData();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
