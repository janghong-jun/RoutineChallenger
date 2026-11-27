import {
  AppDataSnapshot,
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

const OWNER = 'janghong-jun';
const REPOSITORY = 'RoutineChallenger';
const BRANCH = 'main';
const DATA_PATH = 'data/routine-challenger.json';
const TOKEN_STORAGE_KEY = 'rc_github_token';
const API_URL = `https://api.github.com/repos/${OWNER}/${REPOSITORY}/contents/${DATA_PATH}`;
const RAW_URL = `https://raw.githubusercontent.com/${OWNER}/${REPOSITORY}/${BRANCH}/${DATA_PATH}`;

export function hasSavedGitHubToken(): boolean {
  return typeof window !== 'undefined' && Boolean(localStorage.getItem(TOKEN_STORAGE_KEY));
}

export function saveGitHubToken(token: string): void {
  if (typeof window === 'undefined') {
    throw new Error('브라우저에서만 GitHub 토큰을 저장할 수 있습니다.');
  }
  const trimmedToken = token.trim();
  if (!trimmedToken) {
    throw new Error('GitHub 토큰을 입력하세요.');
  }
  localStorage.setItem(TOKEN_STORAGE_KEY, trimmedToken);
}

export function removeSavedGitHubToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  }
}

const emptySnapshot = (): AppDataSnapshot => ({
  schemaVersion: 1,
  routines: [],
  records: [],
  expHistory: [],
  userProfile: null,
  customHolidays: [],
});

const encodeBase64 = (value: string): string => {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach(byte => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
};

export const isAppDataSnapshot = (value: unknown): value is AppDataSnapshot => {
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
};

const decodeBase64Json = (content: string): unknown => {
  const binary = atob(content.replace(/\s/g, ''));
  const bytes = Uint8Array.from(binary, character => character.charCodeAt(0));
  return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
};

export class GitHubJsonRepository {
  private async readRemote(): Promise<AppDataSnapshot> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token) {
      const apiResponse = await fetch(`${API_URL}?ref=${BRANCH}&t=${Date.now()}`, {
        headers: {
          Accept: 'application/vnd.github+json',
          Authorization: `Bearer ${token}`,
          'X-GitHub-Api-Version': '2022-11-28',
        },
        cache: 'no-store',
      });

      if (apiResponse.ok) {
        const file = (await apiResponse.json()) as { content?: string; encoding?: string };
        if (file.encoding !== 'base64' || !file.content) {
          throw new Error('GitHub 데이터 파일의 인코딩 형식이 올바르지 않습니다.');
        }
        const value = decodeBase64Json(file.content);
        if (!isAppDataSnapshot(value)) {
          throw new Error('GitHub 데이터 JSON의 형식이 올바르지 않습니다.');
        }
        return value;
      }

      if (apiResponse.status !== 404) {
        const detail = await apiResponse.text();
        throw new Error(
          `GitHub 데이터 파일을 읽지 못했습니다. (${apiResponse.status}) ${detail}`,
        );
      }
    }

    const response = await fetch(`${RAW_URL}?t=${Date.now()}`, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    });

    if (response.status === 404) {
      if (typeof window !== 'undefined') {
        const isLocalDevelopment =
          window.location.hostname === 'localhost' ||
          window.location.hostname === '127.0.0.1';

        if (isLocalDevelopment) {
          const localResponse = await fetch('/data/routine-challenger.json', {
            headers: { Accept: 'application/json' },
            cache: 'no-store',
          });
          if (localResponse.ok) {
            const localValue: unknown = await localResponse.json();
            if (isAppDataSnapshot(localValue)) return localValue;
            throw new Error('로컬 초기 JSON 데이터의 형식이 올바르지 않습니다.');
          }
        }
        return emptySnapshot();
      }
      return emptySnapshot();
    }
    if (!response.ok) {
      throw new Error(`데이터 JSON을 불러오지 못했습니다. (${response.status})`);
    }

    const value: unknown = await response.json();
    if (!isAppDataSnapshot(value)) {
      throw new Error('데이터 JSON의 형식이 올바르지 않습니다.');
    }
    return value;
  }

  private getToken(): string {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      throw new Error('JSON 관리 화면에서 GitHub 토큰을 먼저 저장하세요.');
    }
    return token;
  }

  private async writeRemote(mutator: (snapshot: AppDataSnapshot) => void): Promise<void> {
    const token = this.getToken();
    const snapshot = await this.readRemote();
    mutator(snapshot);

    const getResponse = await fetch(`${API_URL}?ref=${BRANCH}`, {
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
      },
      cache: 'no-store',
    });

    let sha: string | undefined;
    if (getResponse.ok) {
      const file = await getResponse.json() as { sha?: string };
      sha = file.sha;
    } else if (getResponse.status !== 404) {
      throw new Error(`GitHub 파일 정보를 불러오지 못했습니다. (${getResponse.status})`);
    }

    const content = JSON.stringify(snapshot, null, 2);
    const response = await fetch(API_URL, {
      method: 'PUT',
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'X-GitHub-Api-Version': '2022-11-28',
      },
      body: JSON.stringify({
        message: 'Update routine challenger data',
        content: encodeBase64(content),
        branch: BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new Error(`GitHub에 데이터를 저장하지 못했습니다. (${response.status}) ${detail}`);
    }
  }

  async getRoutines(): Promise<Routine[]> {
    return (await this.readRemote()).routines;
  }

  async getById(id: string): Promise<Routine | undefined> {
    return (await this.readRemote()).routines.find(routine => routine.id === id);
  }

  async create(routine: Routine): Promise<void> {
    await this.writeRemote(snapshot => {
      snapshot.routines.push(routine);
    });
  }

  async update(routine: Routine): Promise<void> {
    await this.writeRemote(snapshot => {
      const index = snapshot.routines.findIndex(item => item.id === routine.id);
      if (index >= 0) snapshot.routines[index] = routine;
    });
  }

  async delete(id: string): Promise<void> {
    await this.writeRemote(snapshot => {
      const routine = snapshot.routines.find(item => item.id === id);
      if (routine) {
        routine.status = 'DELETED';
        routine.updatedAt = new Date().toISOString();
      }
    });
  }

  async getByDate(date: string): Promise<RoutineRecord[]> {
    return (await this.readRemote()).records.filter(record => record.date === date);
  }

  async getRecords(): Promise<RoutineRecord[]> {
    return (await this.readRemote()).records;
  }

  async getRecord(routineId: string, date: string): Promise<RoutineRecord | undefined> {
    return (await this.readRemote()).records.find(
      record => record.routineId === routineId && record.date === date,
    );
  }

  async save(record: RoutineRecord): Promise<void> {
    await this.writeRemote(snapshot => {
      const index = snapshot.records.findIndex(item => item.id === record.id);
      if (index >= 0) snapshot.records[index] = record;
      else snapshot.records.push(record);
    });
  }

  async deleteRecord(routineId: string, date: string): Promise<void> {
    await this.writeRemote(snapshot => {
      snapshot.records = snapshot.records.filter(
        record => !(record.routineId === routineId && record.date === date),
      );
    });
  }

  async getExpHistory(): Promise<ExpHistory[]> {
    return (await this.readRemote()).expHistory;
  }

  async getExpByDate(date: string): Promise<ExpHistory[]> {
    return (await this.readRemote()).expHistory.filter(history => history.date === date);
  }

  async getExpByRoutineAndDate(routineId: string, date: string): Promise<ExpHistory[]> {
    return (await this.readRemote()).expHistory.filter(
      history => history.routineId === routineId && history.date === date,
    );
  }

  async add(history: ExpHistory): Promise<void> {
    await this.writeRemote(snapshot => {
      const index = snapshot.expHistory.findIndex(item => item.id === history.id);
      if (index >= 0) snapshot.expHistory[index] = history;
      else snapshot.expHistory.push(history);
    });
  }

  async getProfile(): Promise<UserProfile | undefined> {
    return (await this.readRemote()).userProfile ?? undefined;
  }

  async saveProfile(profile: UserProfile): Promise<void> {
    await this.writeRemote(snapshot => {
      snapshot.userProfile = {
        ...profile,
        updatedAt: new Date().toISOString(),
      };
    });
  }

  async getHolidays(): Promise<Holiday[]> {
    const snapshot = await this.readRemote();
    const base = [2025, 2026, 2027].flatMap(year =>
      getHolidaysForYear(year, snapshot.customHolidays),
    );
    return Array.from(
      new Map([...base, ...snapshot.customHolidays].map(holiday => [holiday.date, holiday])).values(),
    ).sort((a, b) => a.date.localeCompare(b.date));
  }

  async getHolidaysByYear(year: number): Promise<Holiday[]> {
    const snapshot = await this.readRemote();
    return getHolidaysForYear(year, snapshot.customHolidays);
  }

  async addCustomHoliday(holiday: Holiday): Promise<void> {
    await this.writeRemote(snapshot => {
      const index = snapshot.customHolidays.findIndex(item => item.date === holiday.date);
      const customHoliday = { ...holiday, isCustom: true };
      if (index >= 0) snapshot.customHolidays[index] = customHoliday;
      else snapshot.customHolidays.push(customHoliday);
    });
  }

  async exportSnapshot(): Promise<AppDataSnapshot> {
    return this.readRemote();
  }

  async importSnapshot(snapshot: AppDataSnapshot): Promise<void> {
    if (!isAppDataSnapshot(snapshot)) {
      throw new Error('데이터 JSON의 형식이 올바르지 않습니다.');
    }
    await this.writeRemote(current => {
      current.routines = snapshot.routines;
      current.records = snapshot.records;
      current.expHistory = snapshot.expHistory;
      current.userProfile = snapshot.userProfile;
      current.customHolidays = snapshot.customHolidays;
    });
  }
}

export class GitHubRoutineRepository implements IRoutineRepository {
  constructor(private readonly repository: GitHubJsonRepository) {}

  getAll = () => this.repository.getRoutines();
  getById = (id: string) => this.repository.getById(id);
  create = (routine: Routine) => this.repository.create(routine);
  update = (routine: Routine) => this.repository.update(routine);
  delete = (id: string) => this.repository.delete(id);
}

export class GitHubRecordRepository implements IRecordRepository {
  constructor(private readonly repository: GitHubJsonRepository) {}

  getByDate = (date: string) => this.repository.getByDate(date);
  getAll = () => this.repository.getRecords();
  getRecord = (routineId: string, date: string) =>
    this.repository.getRecord(routineId, date);
  save = (record: RoutineRecord) => this.repository.save(record);
  delete = (routineId: string, date: string) =>
    this.repository.deleteRecord(routineId, date);
}

export class GitHubExpRepository implements IExpRepository {
  constructor(private readonly repository: GitHubJsonRepository) {}

  getAll = () => this.repository.getExpHistory();
  getByDate = (date: string) => this.repository.getExpByDate(date);
  getByRoutineAndDate = (routineId: string, date: string) =>
    this.repository.getExpByRoutineAndDate(routineId, date);
  add = (history: ExpHistory) => this.repository.add(history);
}

export class GitHubUserProfileRepository implements IUserProfileRepository {
  constructor(private readonly repository: GitHubJsonRepository) {}

  get = () => this.repository.getProfile();
  save = (profile: UserProfile) => this.repository.saveProfile(profile);
}

export class GitHubHolidayRepository implements IHolidayRepository {
  constructor(private readonly repository: GitHubJsonRepository) {}

  getAll = () => this.repository.getHolidays();
  getByYear = (year: number) => this.repository.getHolidaysByYear(year);
  addCustomHoliday = (holiday: Holiday) =>
    this.repository.addCustomHoliday(holiday);
}
