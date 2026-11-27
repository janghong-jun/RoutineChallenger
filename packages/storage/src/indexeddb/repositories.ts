import {
  IRoutineRepository,
  IRecordRepository,
  IExpRepository,
  IUserProfileRepository,
  IHolidayRepository,
  Routine,
  RoutineRecord,
  ExpHistory,
  UserProfile,
  Holiday,
} from '@routine-challenger/types';
import { getHolidaysForYear } from '@routine-challenger/data';
import { getDatabase } from './db';

export class IndexedDbRoutineRepository implements IRoutineRepository {
  async getAll(): Promise<Routine[]> {
    const db = await getDatabase();
    return db.getAll('routines');
  }

  async getById(id: string): Promise<Routine | undefined> {
    const db = await getDatabase();
    return db.get('routines', id);
  }

  async create(routine: Routine): Promise<void> {
    const db = await getDatabase();
    await db.put('routines', routine);
  }

  async update(routine: Routine): Promise<void> {
    const db = await getDatabase();
    await db.put('routines', routine);
  }

  async delete(id: string): Promise<void> {
    const db = await getDatabase();
    // 영구 삭제 대신 상태를 DELETED로 변경하여 과거 기록을 보존 (AGENTS.md 원칙)
    const existing = await db.get('routines', id);
    if (existing) {
      existing.status = 'DELETED';
      existing.updatedAt = new Date().toISOString();
      await db.put('routines', existing);
    }
  }
}

export class IndexedDbRecordRepository implements IRecordRepository {
  async getByDate(date: string): Promise<RoutineRecord[]> {
    const db = await getDatabase();
    return db.getAllFromIndex('records', 'by-date', date);
  }

  async getAll(): Promise<RoutineRecord[]> {
    const db = await getDatabase();
    return db.getAll('records');
  }

  async getRecord(routineId: string, date: string): Promise<RoutineRecord | undefined> {
    const db = await getDatabase();
    const id = `${routineId}_${date}`;
    return db.get('records', id);
  }

  async save(record: RoutineRecord): Promise<void> {
    const db = await getDatabase();
    await db.put('records', record);
  }

  async delete(routineId: string, date: string): Promise<void> {
    const db = await getDatabase();
    const id = `${routineId}_${date}`;
    await db.delete('records', id);
  }
}

export class IndexedDbExpRepository implements IExpRepository {
  async getAll(): Promise<ExpHistory[]> {
    const db = await getDatabase();
    return db.getAll('exp_history');
  }

  async getByDate(date: string): Promise<ExpHistory[]> {
    const db = await getDatabase();
    return db.getAllFromIndex('exp_history', 'by-date', date);
  }

  async getByRoutineAndDate(routineId: string, date: string): Promise<ExpHistory[]> {
    const db = await getDatabase();
    const list = await db.getAllFromIndex('exp_history', 'by-routine', routineId);
    return list.filter(item => item.date === date);
  }

  async add(history: ExpHistory): Promise<void> {
    const db = await getDatabase();
    await db.put('exp_history', history);
  }
}

export class IndexedDbUserProfileRepository implements IUserProfileRepository {
  private static readonly PROFILE_ID = 'current_user_profile';

  async get(): Promise<UserProfile | undefined> {
    const db = await getDatabase();
    return db.get('user_profile', IndexedDbUserProfileRepository.PROFILE_ID);
  }

  async save(profile: UserProfile): Promise<void> {
    const db = await getDatabase();
    const item: UserProfile = {
      ...profile,
      id: IndexedDbUserProfileRepository.PROFILE_ID,
      updatedAt: new Date().toISOString(),
    };
    await db.put('user_profile', item);
  }
}

export class IndexedDbHolidayRepository implements IHolidayRepository {
  async getAll(): Promise<Holiday[]> {
    const db = await getDatabase();
    const custom = await db.getAll('custom_holidays');
    const base = [2025, 2026, 2027].flatMap(y => getHolidaysForYear(y, custom));
    const map = new Map<string, Holiday>();
    [...base, ...custom].forEach(h => map.set(h.date, h));
    return Array.from(map.values()).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getByYear(year: number): Promise<Holiday[]> {
    const db = await getDatabase();
    const custom = await db.getAll('custom_holidays');
    return getHolidaysForYear(year, custom);
  }

  async addCustomHoliday(holiday: Holiday): Promise<void> {
    const db = await getDatabase();
    await db.put('custom_holidays', { ...holiday, isCustom: true });
  }
}
