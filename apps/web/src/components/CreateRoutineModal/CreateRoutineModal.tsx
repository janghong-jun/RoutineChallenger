'use client';

import React, { useState } from 'react';
import {
  DayOfWeek,
  Routine,
  RoutineCategory,
  TargetType,
  RoutineFrequency,
} from '@routine-challenger/types';
import { ROUTINE_TEMPLATES_DATA, RoutineTemplate } from '@routine-challenger/data';
import { useAppDispatch, addRoutine } from '@routine-challenger/store';
import { getStorageContainer } from '@routine-challenger/storage';
import { CategoryBadge } from '@routine-challenger/ui';
import styles from './CreateRoutineModal.module.scss';

interface CreateRoutineModalProps {
  onClose: () => void;
  selectedDate: string;
}

const createRoutineId = () => `routine_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const initialSelectedDays: DayOfWeek[] = [1, 2, 3, 4, 5];

export const CreateRoutineModal: React.FC<CreateRoutineModalProps> = ({
  onClose,
  selectedDate,
}) => {
  const dispatch = useAppDispatch();
  const [activeTab, setActiveTab] = useState<'templates' | 'custom'>('templates');

  // Custom Routine Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<RoutineCategory>('EXERCISE');
  const [targetType, setTargetType] = useState<TargetType>('TIME');
  const [targetValue, setTargetValue] = useState(15);
  const [targetUnit, setTargetUnit] = useState('분');
  const [frequencyType, setFrequencyType] = useState<RoutineFrequency>('DAILY');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>(initialSelectedDays);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setCategory('EXERCISE');
    setTargetType('TIME');
    setTargetValue(15);
    setTargetUnit('분');
    setFrequencyType('DAILY');
    setSelectedDays(initialSelectedDays);
  };

  const handleTabChange = (tab: 'templates' | 'custom') => {
    resetForm();
    setActiveTab(tab);
  };

  const handleDayToggle = (day: DayOfWeek) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day].sort());
    }
  };

  const handleAddFromTemplate = async (tpl: RoutineTemplate) => {
    const storage = getStorageContainer();
    const now = new Date().toISOString();

    const newRoutine: Routine = {
      id: createRoutineId(),
      title: tpl.title,
      description: tpl.description,
      category: tpl.category,
      difficultyLevel: 1,
      targetType: tpl.targetType,
      targetValue: tpl.targetValue,
      targetUnit: tpl.targetUnit || (tpl.targetType === 'TIME' ? '분' : '회'),
      frequencyType: tpl.frequencyType,
      targetDaysOfWeek: tpl.targetDaysOfWeek || [0, 1, 2, 3, 4, 5, 6],
      startDate: selectedDate,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await storage.routines.create(newRoutine);
    dispatch(addRoutine(newRoutine));
    onClose();
  };

  const handleCreateCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const storage = getStorageContainer();
    const now = new Date().toISOString();

    const newRoutine: Routine = {
      id: createRoutineId(),
      title: title.trim(),
      description: description.trim() || undefined,
      category,
      difficultyLevel: 1,
      targetType,
      targetValue: Number(targetValue) || 1,
      targetUnit: targetUnit.trim() || (targetType === 'TIME' ? '분' : '회'),
      frequencyType,
      targetDaysOfWeek: frequencyType === 'DAILY' ? [0, 1, 2, 3, 4, 5, 6] : selectedDays,
      startDate: selectedDate,
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };

    await storage.routines.create(newRoutine);
    dispatch(addRoutine(newRoutine));
    onClose();
  };

  const dayLabels: { label: string; value: DayOfWeek }[] = [
    { label: '월', value: 1 },
    { label: '화', value: 2 },
    { label: '수', value: 3 },
    { label: '목', value: 4 },
    { label: '금', value: 5 },
    { label: '토', value: 6 },
    { label: '일', value: 0 },
  ];

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>새 루틴 추가</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.tabNav}>
          <button
            className={`${styles.tabItem} ${activeTab === 'templates' ? styles.active : ''}`}
            onClick={() => handleTabChange('templates')}
          >
            추천 템플릿 선택
          </button>
          <button
            className={`${styles.tabItem} ${activeTab === 'custom' ? styles.active : ''}`}
            onClick={() => handleTabChange('custom')}
          >
            직접 만들기
          </button>
        </div>

        <div className={styles.body}>
          {activeTab === 'templates' ? (
            <div className={styles.templateList}>
              {ROUTINE_TEMPLATES_DATA.length > 0 ? (
                ROUTINE_TEMPLATES_DATA.map(tpl => (
                  <div key={tpl.templateId} className={styles.templateCard}>
                    <div className={styles.tplInfo}>
                      <div className={styles.tplHeader}>
                        <span className={styles.tplCategory}>
                          <CategoryBadge category={tpl.category} />
                        </span>
                        <span className={styles.tplIcon}>{tpl.icon}</span>
                        <span className={styles.tplTitle}>{tpl.title}</span>
                      </div>
                      {tpl.description && <span className={styles.tplDesc}>{tpl.description}</span>}
                    </div>
                    <button className={styles.tplAddBtn} onClick={() => handleAddFromTemplate(tpl)}>
                      추가하기
                    </button>
                  </div>
                ))
              ) : (
                <div className={styles.templateEmptyState}>
                  <p>등록된 추천 템플릿이 없습니다.</p>
                  <button
                    className={styles.templateEmptyAction}
                    onClick={() => handleTabChange('custom')}
                  >
                    직접 루틴 만들기
                  </button>
                </div>
              )}
            </div>
          ) : (
            <form id="custom-routine-form" className={styles.form} onSubmit={handleCreateCustom}>
              <div className={styles.formGroup}>
                <label>루틴 이름</label>
                <input
                  type="text"
                  placeholder="예: 하루 30분 기술 독서"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>설명 (선택)</label>
                <input
                  type="text"
                  placeholder="예: 꾸준한 개발 역량 강화를 위한 독서"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                />
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>카테고리</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as RoutineCategory)}
                  >
                    <option value="EXERCISE">🏃 운동</option>
                    <option value="LEARNING">📚 학습</option>
                    <option value="SELF_CARE">🌿 자기관리</option>
                    <option value="HABIT">⏰ 생활습관</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>목표 형태</label>
                  <select
                    value={targetType}
                    onChange={e => {
                      const type = e.target.value as TargetType;
                      setTargetType(type);
                      setTargetUnit(type === 'TIME' ? '분' : '회');
                    }}
                  >
                    <option value="TIME">시간 (분)</option>
                    <option value="COUNT">횟수 / 권 / 횟수</option>
                  </select>
                </div>
              </div>

              <div className={styles.row}>
                <div className={styles.formGroup}>
                  <label>목표 수치</label>
                  <input
                    type="number"
                    min="1"
                    value={targetValue}
                    onChange={e => setTargetValue(Number(e.target.value))}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>단위</label>
                  <input
                    type="text"
                    value={targetUnit}
                    onChange={e => setTargetUnit(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>반복 일정</label>
                <select
                  value={frequencyType}
                  onChange={e => setFrequencyType(e.target.value as RoutineFrequency)}
                >
                  <option value="DAILY">매일 반복</option>
                  <option value="WEEKLY_DAYS">특정 요일 반복</option>
                </select>
              </div>

              {frequencyType === 'WEEKLY_DAYS' && (
                <div className={styles.formGroup}>
                  <label>실천 요일 선택</label>
                  <div className={styles.daysSelector}>
                    {dayLabels.map(d => (
                      <button
                        type="button"
                        key={d.value}
                        className={`${styles.dayBtn} ${
                          selectedDays.includes(d.value) ? styles.selected : ''
                        }`}
                        onClick={() => handleDayToggle(d.value)}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </form>
          )}
        </div>

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>
            닫기
          </button>
          {activeTab === 'custom' && (
            <button type="submit" form="custom-routine-form" className={styles.submitBtn}>
              루틴 생성하기
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
