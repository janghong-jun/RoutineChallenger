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
import { getStorageContainer } from '@routine-challenger/storage';
import { calculateStreaks } from '@routine-challenger/core';
import { getKoreaTodayDateString } from '@routine-challenger/store';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    store.dispatch(goToToday());

    // 테마 설정 복원
    const savedTheme = localStorage.getItem('rc_theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // 공개 GitHub JSON 데이터 로드 및 초기화
    async function initData() {
      const storage = getStorageContainer();

      try {
        const routines = await storage.routines.getAll();
        store.dispatch(setRoutines(routines));

        // 실천 기록 로드
        const records = await storage.records.getAll();
        store.dispatch(setRecords(records));

        // 경험치 변동 이력 로드
        const expHistory = await storage.exp.getAll();
        store.dispatch(setExpHistory(expHistory));

        // 유저 프로필 로드
        let profile = await storage.userProfile.get();
        if (!profile) {
          profile = {
            id: 'current_user_profile',
            totalExp: 0,
            selectedTitleId: 'first_step',
            unlockedTitleIds: ['first_step'],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        store.dispatch(setUserProfile(profile));

        // 스트릭 계산
        const completedDates = records.filter(r => r.completed).map(r => r.date);
        const todayStr = getKoreaTodayDateString();
        const streakResult = calculateStreaks(completedDates, todayStr);
        store.dispatch(setStreaks(streakResult));
      } catch (err) {
        console.error('Failed to initialize data from GitHub JSON:', err);
      }
    }

    initData();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
