import { Title, RoutineCategory } from '@routine-challenger/types';
import { INITIAL_TITLES_DATA } from '@routine-challenger/data';

export interface UserStatsForTitles {
  totalExp: number;
  totalCompletedDays: number;
  currentStreak: number;
  bestStreak: number;
  completedCategories: RoutineCategory[];
}

export class TitleEvaluator {
  private titles: Title[];

  constructor(customTitles: Title[] = INITIAL_TITLES_DATA) {
    this.titles = [...customTitles];
  }

  public getTitles(): Title[] {
    return [...this.titles];
  }

  /**
   * 유저의 달성 기록을 바탕으로 신규 해금 가능한 타이틀 목록 판정
   * 이미 획득한 타이틀은 경험치 차감이나 스트릭 리셋이 발생해도 절대 회수되지 않음 (영구 보존 원칙)
   */
  public evaluateNewUnlocks(
    alreadyUnlockedIds: string[],
    stats: UserStatsForTitles
  ): Title[] {
    const newlyUnlocked: Title[] = [];
    const unlockedSet = new Set(alreadyUnlockedIds);

    for (const title of this.titles) {
      // 이미 해금된 타이틀은 다시 판정하지 않고 보존
      if (unlockedSet.has(title.id)) {
        continue;
      }

      const req = title.requirement;
      let qualifies = false;

      switch (req.type) {
        case 'DEFAULT':
          qualifies = true;
          break;
        case 'TOTAL_EXP':
          qualifies = stats.totalExp >= req.value;
          break;
        case 'TOTAL_COMPLETED_DAYS':
          qualifies = stats.totalCompletedDays >= req.value;
          break;
        case 'STREAK':
          // 현재 스트릭 또는 최고 스트릭 중 하나라도 충족하면 해금
          qualifies = stats.currentStreak >= req.value || stats.bestStreak >= req.value;
          break;
        case 'CATEGORY_PRACTICE':
          if (req.category) {
            qualifies = stats.completedCategories.includes(req.category);
          } else {
            // 모든 카테고리 실천 여부
            qualifies = stats.completedCategories.length >= req.value;
          }
          break;
        default:
          qualifies = false;
      }

      if (qualifies) {
        newlyUnlocked.push({
          ...title,
          isUnlocked: true,
          unlockedAt: new Date().toISOString(),
        });
      }
    }

    return newlyUnlocked;
  }
}

export const defaultTitleEvaluator = new TitleEvaluator();
