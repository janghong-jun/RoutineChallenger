import {
  AppDataSnapshot,
  IRoutineRepository,
  IRecordRepository,
  IExpRepository,
  IUserProfileRepository,
  IHolidayRepository,
} from '@routine-challenger/types';
import {
  IndexedDbExpRepository,
  IndexedDbHolidayRepository,
  IndexedDbRecordRepository,
  IndexedDbRoutineRepository,
  IndexedDbUserProfileRepository,
  replaceDatabaseData,
} from './indexeddb/repositories';
import { getDatabase } from './indexeddb/db';

export * from './indexeddb/db';
export * from './indexeddb/repositories';

export interface StorageContainer {
  routines: IRoutineRepository;
  records: IRecordRepository;
  exp: IExpRepository;
  userProfile: IUserProfileRepository;
  holidays: IHolidayRepository;
  exportSnapshot(): Promise<AppDataSnapshot>;
  importSnapshot(snapshot: AppDataSnapshot): Promise<void>;
}

export function isAppDataSnapshot(value: unknown): value is AppDataSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snapshot = value as Partial<AppDataSnapshot>;
  return (
    snapshot.schemaVersion === 1 &&
    Array.isArray(snapshot.routines) &&
    Array.isArray(snapshot.records) &&
    Array.isArray(snapshot.expHistory) &&
    Array.isArray(snapshot.customHolidays) &&
    (snapshot.userProfile === null || typeof snapshot.userProfile === 'object')
  );
}

let activeStorageContainer: StorageContainer | null = null;

export function getStorageContainer(): StorageContainer {
  if (!activeStorageContainer) {
    const routines = new IndexedDbRoutineRepository();
    const records = new IndexedDbRecordRepository();
    const exp = new IndexedDbExpRepository();
    const userProfile = new IndexedDbUserProfileRepository();
    const holidays = new IndexedDbHolidayRepository();

    activeStorageContainer = {
      routines,
      records,
      exp,
      userProfile,
      holidays,
      async exportSnapshot() {
        const [allRoutines, allRecords, expHistory, profile, customHolidays] = await Promise.all([
          routines.getAll(),
          records.getAll(),
          exp.getAll(),
          userProfile.get(),
          (await getDatabase()).getAll('custom_holidays'),
        ]);
        return {
          schemaVersion: 1,
          routines: allRoutines,
          records: allRecords,
          expHistory,
          userProfile: profile ?? null,
          customHolidays,
        };
      },
      async importSnapshot(snapshot) {
        if (!isAppDataSnapshot(snapshot)) {
          throw new Error('가져올 JSON 데이터의 형식이 올바르지 않습니다.');
        }
        await replaceDatabaseData(snapshot);
      },
    };
  }
  return activeStorageContainer;
}

export function setStorageContainer(customContainer: StorageContainer): void {
  activeStorageContainer = customContainer;
}
