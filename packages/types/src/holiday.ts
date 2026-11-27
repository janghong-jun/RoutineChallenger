export interface Holiday {
  date: string; // YYYY-MM-DD
  name: string;
  isSubstituted?: boolean;
  isCustom?: boolean; // user-added temporary holiday
}
