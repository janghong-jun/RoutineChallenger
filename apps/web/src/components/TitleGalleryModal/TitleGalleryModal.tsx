'use client';

import React, { useRef } from 'react';
import { useAppDispatch, useAppSelector, setSelectedTitle } from '@routine-challenger/store';
import { getStorageContainer } from '@routine-challenger/storage';
import { Icon, getTitleIconName } from '@routine-challenger/ui';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import styles from './TitleGalleryModal.module.scss';

interface TitleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitleGalleryModal: React.FC<TitleGalleryModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { titles, selectedTitleId, unlockedTitleIds, totalExp } = useAppSelector(state => state.user);

  const dialogRef = useRef<HTMLDivElement>(null);
  useModalAccessibility(isOpen, dialogRef, onClose);

  if (!isOpen) return null;

  const handleEquip = async (titleId: string) => {
    const storage = getStorageContainer();
    dispatch(setSelectedTitle(titleId));

    await storage.userProfile.save({
      id: 'current_user_profile',
      totalExp,
      selectedTitleId: titleId,
      unlockedTitleIds,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  };

  return (
    <div className={styles.overlay} role="presentation" onClick={onClose}>
      <div
        ref={dialogRef}
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="title-gallery-heading"
        aria-describedby="title-gallery-notice"
        tabIndex={-1}
        onClick={e => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h2 id="title-gallery-heading" className={styles.title}>
            타이틀 갤러리
          </h2>
          <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
            <Icon name="x" size={18} />
          </button>
        </div>

        <div className={styles.notice} id="title-gallery-notice">
          <Icon name="info" size={16} />
          <span>
            한 번 획득한 타이틀은 경험치가 차감되더라도 절대 회수되지 않으며 영구 보존됩니다.
          </span>
        </div>

        <ul className={styles.grid}>
          {titles.map(title => {
            const isUnlocked = unlockedTitleIds.includes(title.id);
            const isEquipped = selectedTitleId === title.id;

            return (
              <li
                key={title.id}
                className={`${styles.titleCard} ${isEquipped ? styles.isEquipped : ''} ${
                  !isUnlocked ? styles.isLocked : ''
                }`}
              >
                <div className={styles.left}>
                  <div className={styles.icon}>
                    <Icon name={isUnlocked ? getTitleIconName(title.id) : 'lock'} size={20} />
                  </div>
                  <div className={styles.info}>
                    <div className={styles.nameRow}>
                      <span className={styles.name}>{title.name}</span>
                      {isEquipped && <span className={styles.equippedBadge}>대표 타이틀</span>}
                    </div>
                    <span className={styles.desc}>{title.description}</span>
                  </div>
                </div>

                {isUnlocked ? (
                  !isEquipped && (
                    <button
                      type="button"
                      className={styles.equipBtn}
                      onClick={() => handleEquip(title.id)}
                      aria-label={`${title.name} 대표 타이틀로 설정`}
                    >
                      대표 설정
                    </button>
                  )
                ) : (
                  <span className={styles.lockedBadge}>미해금</span>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};
