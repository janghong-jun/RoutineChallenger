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
} from '@routine-challenger/store';
import { getStorageContainer } from '@routine-challenger/storage';
import { ROUTINE_TEMPLATES_DATA } from '@routine-challenger/data';
import { calculateStreaks } from '@routine-challenger/core';
import { Routine } from '@routine-challenger/types';

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store] = useState<AppStore>(() => makeStore());

  useEffect(() => {
    // 테마 설정 복원
    const savedTheme = localStorage.getItem('rc_theme');
    const theme = savedTheme === 'dark' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', theme);

    // IndexedDB로부터 데이터 로드 및 초기화
    async function initData() {
      const storage = getStorageContainer();

      try {
        let routines = await storage.routines.getAll();

        // 앱 첫 실행 시 템플릿 루틴 자동 시딩
        if (routines.length === 0) {
          const starterTemplates = ROUTINE_TEMPLATES_DATA.slice(0, 4); // 대표 4개 루틴
          const now = new Date().toISOString();
          const todayDate = now.slice(0, 10);

          for (const tpl of starterTemplates) {
            const newRoutine: Routine = {
              id: `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              title: tpl.title,
              description: tpl.description,
              category: tpl.category,
              difficultyLevel: tpl.difficultyLevel || 1,
              targetType: tpl.targetType,
              targetValue: tpl.targetValue,
              targetUnit: tpl.targetUnit || '분',
              frequencyType: tpl.frequencyType,
              targetDaysOfWeek: tpl.targetDaysOfWeek || [0, 1, 2, 3, 4, 5, 6],
              startDate: todayDate,
              status: 'ACTIVE',
              createdAt: now,
              updatedAt: now,
            };
            await storage.routines.create(newRoutine);
          }
          routines = await storage.routines.getAll();
        }

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
          await storage.userProfile.save(profile);
        }
        store.dispatch(setUserProfile(profile));

        // 스트릭 계산
        const completedDates = records.filter(r => r.completed).map(r => r.date);
        const todayStr = new Date().toISOString().slice(0, 10);
        const streakResult = calculateStreaks(completedDates, todayStr);
        store.dispatch(setStreaks(streakResult));
      } catch (err) {
        console.error('Failed to initialize local data from IndexedDB:', err);
      }
    }

    initData();
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
