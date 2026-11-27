import {
  ExpHistory,
  Holiday,
  IExpRepository,
  IHolidayRepository,
  IRecordRepository,
  IRoutineRepository,
  IUserProfileRepository,
  Routine,
  RoutineRecord,
  UserProfile,
} from '@routine-challenger/types';
import { getHolidaysForYear } from '@routine-challenger/data';
import { getDatabase } from './db';

export class IndexedDbRoutineRepository implements IRoutineRepository {
  async getAll(): Promise<Routine[]> {
    return (await getDatabase()).getAll('routines');
  }

  async getById(id: string): Promise<Routine | undefined> {
    return (await getDatabase()).get('routines', id);
  }

  async create(routine: Routine): Promise<void> {
    await (await getDatabase()).put('routines', routine);
  }

  async update(routine: Routine): Promise<void> {
    await (await getDatabase()).put('routines', routine);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    const routine = await db.get('routines', id);
    if (routine) {
      routine.status = 'DELETED';
      routine.updatedAt = new Date().toISOString();
      await db.put('routines', routine);
    }
  }
}

export class IndexedDbRecordRepository implements IRecordRepository {
  async getByDate(date: string): Promise<RoutineRecord[]> {
    return (await getDatabase()).getAllFromIndex('records', 'by-date', date);
  }

  async getAll(): Promise<RoutineRecord[]> {
    return (await getDatabase()).getAll('records');
  }

  async getRecord(routineId: string, date: string): Promise<RoutineRecord | undefined> {
    return (await getDatabase()).get('records', `${routineId}_${date}`);
  }

  async save(record: RoutineRecord): Promise<void> {
    await (await getDatabase()).put('records', record);
  }

  async delete(routineId: string, date: string): Promise<void> {
    await (await getDatabase()).delete('records', `${routineId}_${date}`);
  }
}

export class IndexedDbExpRepository implements IExpRepository {
  async getAll(): Promise<ExpHistory[]> {
    return (await getDatabase()).getAll('exp_history');
  }

  async getByDate(date: string): Promise<ExpHistory[]> {
    return (await getDatabase()).getAllFromIndex('exp_history', 'by-date', date);
  }

  async getByRoutineAndDate(routineId: string, date: string): Promise<ExpHistory[]> {
    const items = await (await getDatabase()).getAllFromIndex('exp_history', 'by-routine', routineId);
    return items.filter(item => item.date === date);
  }

  async add(history: ExpHistory): Promise<void> {
    await (await getDatabase()).put('exp_history', history);
  }
}

export class IndexedDbUserProfileRepository implements IUserProfileRepository {
  async get(): Promise<UserProfile | undefined> {
    return (await getDatabase()).get('user_profile', 'current_user_profile');
  }

  async save(profile: UserProfile): Promise<void> {
    await (await getDatabase()).put('user_profile', {
      ...profile,
      id: 'current_user_profile',
      updatedAt: new Date().toISOString(),
    });
  }
}

export class IndexedDbHolidayRepository implements IHolidayRepository {
  async getAll(): Promise<Holiday[]> {
    const custom = await (await getDatabase()).getAll('custom_holidays');
    const base = [2025, 2026, 2027].flatMap(year => getHolidaysForYear(year, custom));
    return Array.from(
      new Map([...base, ...custom].map(holiday => [holiday.date, holiday])).values(),
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getByYear(year: number): Promise<Holiday[]> {
    const custom = await (await getDatabase()).getAll('custom_holidays');
    return getHolidaysForYear(year, custom);
  }

  async addCustomHoliday(holiday: Holiday): Promise<void> {
    await (await getDatabase()).put('custom_holidays', { ...holiday, isCustom: true });
  }
}

export async function replaceDatabaseData(snapshot: {
  routines: Routine[];
  records: RoutineRecord[];
  expHistory: ExpHistory[];
  userProfile: UserProfile | null;
  customHolidays: Holiday[];
}): Promise<void> {
  const db = await getDatabase();
  const tx = db.transaction(
    ['routines', 'records', 'exp_history', 'user_profile', 'custom_holidays'],
    'readwrite',
  );
  const routines = tx.objectStore('routines');
  const records = tx.objectStore('records');
  const expHistory = tx.objectStore('exp_history');
  const profiles = tx.objectStore('user_profile');
  const holidays = tx.objectStore('custom_holidays');

  await Promise.all([
    routines.clear(),
    ...snapshot.routines.map(routine => routines.put(routine)),
    records.clear(),
    ...snapshot.records.map(record => records.put(record)),
    expHistory.clear(),
    ...snapshot.expHistory.map(item => expHistory.put(item)),
    profiles.clear(),
    ...(snapshot.userProfile ? [profiles.put(snapshot.userProfile)] : []),
    holidays.clear(),
    ...snapshot.customHolidays.map(holiday => holidays.put(holiday)),
  ]);
  await tx.done;
}
