import {
  IRoutineRepository,
  IRecordRepository,
  IExpRepository,
  IUserProfileRepository,
  IHolidayRepository,
} from '@routine-challenger/types';
import {
  IndexedDbRoutineRepository,
  IndexedDbRecordRepository,
  IndexedDbExpRepository,
  IndexedDbUserProfileRepository,
  IndexedDbHolidayRepository,
} from './indexeddb/repositories';

export * from './indexeddb/db';
export * from './indexeddb/repositories';

export interface StorageContainer {
  routines: IRoutineRepository;
  records: IRecordRepository;
  exp: IExpRepository;
  userProfile: IUserProfileRepository;
  holidays: IHolidayRepository;
}

let activeStorageContainer: StorageContainer | null = null;

export function getStorageContainer(): StorageContainer {
  if (!activeStorageContainer) {
    activeStorageContainer = {
      routines: new IndexedDbRoutineRepository(),
      records: new IndexedDbRecordRepository(),
      exp: new IndexedDbExpRepository(),
      userProfile: new IndexedDbUserProfileRepository(),
      holidays: new IndexedDbHolidayRepository(),
    };
  }
  return activeStorageContainer;
}

export function setStorageContainer(customContainer: StorageContainer): void {
  activeStorageContainer = customContainer;
}
