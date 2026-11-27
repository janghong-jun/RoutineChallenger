import { DBSchema, IDBPDatabase, openDB } from 'idb';
import { ExpHistory, Holiday, Routine, RoutineRecord, UserProfile } from '@routine-challenger/types';

export interface RoutineChallengerDB extends DBSchema {
  routines: {
    key: string;
    value: Routine;
    indexes: {
      'by-category': string;
      'by-status': string;
    };
  };
  records: {
    key: string;
    value: RoutineRecord;
    indexes: {
      'by-routine': string;
      'by-date': string;
    };
  };
  exp_history: {
    key: string;
    value: ExpHistory;
    indexes: {
      'by-routine': string;
      'by-date': string;
    };
  };
  user_profile: {
    key: string;
    value: UserProfile;
  };
  custom_holidays: {
    key: string;
    value: Holiday;
  };
}

const DB_NAME = 'routine_challenger_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<RoutineChallengerDB>> | null = null;

export function getDatabase(): Promise<IDBPDatabase<RoutineChallengerDB>> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('IndexedDB is unavailable outside a browser.'));
  }

  if (!dbPromise) {
    dbPromise = openDB<RoutineChallengerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('routines')) {
          const store = db.createObjectStore('routines', { keyPath: 'id' });
          store.createIndex('by-category', 'category');
          store.createIndex('by-status', 'status');
        }
        if (!db.objectStoreNames.contains('records')) {
          const store = db.createObjectStore('records', { keyPath: 'id' });
          store.createIndex('by-routine', 'routineId');
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('exp_history')) {
          const store = db.createObjectStore('exp_history', { keyPath: 'id' });
          store.createIndex('by-routine', 'routineId');
          store.createIndex('by-date', 'date');
        }
        if (!db.objectStoreNames.contains('user_profile')) {
          db.createObjectStore('user_profile', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('custom_holidays')) {
          db.createObjectStore('custom_holidays', { keyPath: 'date' });
        }
      },
    });
  }
  return dbPromise;
}
