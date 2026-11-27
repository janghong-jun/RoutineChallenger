import {
  IRoutineRepository,
  IRecordRepository,
  IExpRepository,
  IUserProfileRepository,
  IHolidayRepository,
  AppDataSnapshot,
} from '@routine-challenger/types';
import {
  GitHubExpRepository,
  GitHubHolidayRepository,
  GitHubJsonRepository,
  GitHubRecordRepository,
  GitHubRoutineRepository,
  GitHubUserProfileRepository,
} from './github/repository';

export * from './github/repository';

export interface StorageContainer {
  routines: IRoutineRepository;
  records: IRecordRepository;
  exp: IExpRepository;
  userProfile: IUserProfileRepository;
  holidays: IHolidayRepository;
  exportSnapshot(): Promise<AppDataSnapshot>;
  importSnapshot(snapshot: AppDataSnapshot): Promise<void>;
}

let activeStorageContainer: StorageContainer | null = null;

export function getStorageContainer(): StorageContainer {
  if (!activeStorageContainer) {
    const repository = new GitHubJsonRepository();
    activeStorageContainer = {
      routines: new GitHubRoutineRepository(repository),
      records: new GitHubRecordRepository(repository),
      exp: new GitHubExpRepository(repository),
      userProfile: new GitHubUserProfileRepository(repository),
      holidays: new GitHubHolidayRepository(repository),
      exportSnapshot: () => repository.exportSnapshot(),
      importSnapshot: snapshot => repository.importSnapshot(snapshot),
    };
  }
  return activeStorageContainer;
}

export function setStorageContainer(customContainer: StorageContainer): void {
  activeStorageContainer = customContainer;
}
