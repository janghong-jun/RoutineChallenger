'use client';

import React, { useRef } from 'react';
import { useAppDispatch, useAppSelector, setSelectedTitle } from '@routine-challenger/store';
import { getStorageContainer } from '@routine-challenger/storage';
import { useModalAccessibility } from '@/hooks/useModalAccessibility';
import styles from './TitleGalleryModal.module.scss';

interface TitleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitleGalleryModal: React.FC<TitleGalleryModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const dialogRef = useRef<HTMLDivElement>(null);
  const { titles, selectedTitleId, unlockedTitleIds, totalExp } = useAppSelector(
    state => state.user
  );

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
          <h2 className={styles.title} id="title-gallery-heading">
            🏆 타이틀 갤러리
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="타이틀 갤러리 닫기"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className={styles.notice} id="title-gallery-notice">
          <span aria-hidden="true">💡</span>
          <span>
            한 번 획득한 타이틀은 경험치가 차감되더라도 절대 회수되지 않으며 영구 보존됩니다.
          </span>
        </div>

        <div className={styles.grid} role="list">
          {titles.map(title => {
            const isUnlocked = unlockedTitleIds.includes(title.id);
            const isEquipped = selectedTitleId === title.id;

            return (
              <div
                key={title.id}
                className={`${styles.titleCard} ${isEquipped ? styles.isEquipped : ''} ${
                  !isUnlocked ? styles.isLocked : ''
                }`}
                role="listitem"
              >
                <div className={styles.left}>
                  <div className={styles.icon} aria-hidden="true">
                    {title.icon}
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
                      aria-label={`대표 타이틀을 ${title.name}(으)로 설정`}
                      onClick={() => handleEquip(title.id)}
                    >
                      대표 설정
                    </button>
                  )
                ) : (
                  <span className={styles.lockedBadge}>
                    <span aria-hidden="true">🔒</span> 미획득
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
