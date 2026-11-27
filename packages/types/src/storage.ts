import { Routine } from './routine';
import { RoutineRecord } from './record';
import { ExpHistory } from './exp';
import { UserProfile } from './title';
import { Holiday } from './holiday';

export interface IRoutineRepository {
  getAll(): Promise<Routine[]>;
  getById(id: string): Promise<Routine | undefined>;
  create(routine: Routine): Promise<void>;
  update(routine: Routine): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface IRecordRepository {
  getByDate(date: string): Promise<RoutineRecord[]>;
  getAll(): Promise<RoutineRecord[]>;
  getRecord(routineId: string, date: string): Promise<RoutineRecord | undefined>;
  save(record: RoutineRecord): Promise<void>;
  delete(routineId: string, date: string): Promise<void>;
}

export interface IExpRepository {
  getAll(): Promise<ExpHistory[]>;
  getByDate(date: string): Promise<ExpHistory[]>;
  getByRoutineAndDate(routineId: string, date: string): Promise<ExpHistory[]>;
  add(history: ExpHistory): Promise<void>;
}

export interface IUserProfileRepository {
  get(): Promise<UserProfile | undefined>;
  save(profile: UserProfile): Promise<void>;
}

export interface IHolidayRepository {
  getAll(): Promise<Holiday[]>;
  getByYear(year: number): Promise<Holiday[]>;
  addCustomHoliday(holiday: Holiday): Promise<void>;
}
