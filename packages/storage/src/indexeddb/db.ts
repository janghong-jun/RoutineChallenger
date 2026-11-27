import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { Routine, RoutineRecord, ExpHistory, UserProfile, Holiday } from '@routine-challenger/types';

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
    key: string; // `${routineId}_${date}`
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
    return Promise.reject(new Error('IndexedDB is not available in non-browser environments.'));
  }

  if (!dbPromise) {
    dbPromise = openDB<RoutineChallengerDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // routines store
        if (!db.objectStoreNames.contains('routines')) {
          const routineStore = db.createObjectStore('routines', { keyPath: 'id' });
          routineStore.createIndex('by-category', 'category');
          routineStore.createIndex('by-status', 'status');
        }

        // records store
        if (!db.objectStoreNames.contains('records')) {
          const recordStore = db.createObjectStore('records', { keyPath: 'id' });
          recordStore.createIndex('by-routine', 'routineId');
          recordStore.createIndex('by-date', 'date');
        }

        // exp_history store
        if (!db.objectStoreNames.contains('exp_history')) {
          const expStore = db.createObjectStore('exp_history', { keyPath: 'id' });
          expStore.createIndex('by-routine', 'routineId');
          expStore.createIndex('by-date', 'date');
        }

        // user_profile store
        if (!db.objectStoreNames.contains('user_profile')) {
          db.createObjectStore('user_profile', { keyPath: 'id' });
        }

        // custom_holidays store
        if (!db.objectStoreNames.contains('custom_holidays')) {
          db.createObjectStore('custom_holidays', { keyPath: 'date' });
        }
      },
    });
  }

  return dbPromise;
}
