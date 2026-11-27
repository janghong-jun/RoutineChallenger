'use client';

import React from 'react';
import { useAppDispatch, useAppSelector, setSelectedTitle } from '@routine-challenger/store';
import { getStorageContainer } from '@routine-challenger/storage';
import styles from './TitleGalleryModal.module.scss';

interface TitleGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TitleGalleryModal: React.FC<TitleGalleryModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useAppDispatch();
  const { titles, selectedTitleId, unlockedTitleIds, totalExp } = useAppSelector(
    state => state.user
  );

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
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>🏆 타이틀 갤러리</h2>
          <button className={styles.closeButton} onClick={onClose}>
            ✕
          </button>
        </div>

        <div className={styles.notice}>
          <span>💡</span>
          <span>
            한 번 획득한 타이틀은 경험치가 차감되더라도 절대 회수되지 않으며 영구 보존됩니다.
          </span>
        </div>

        <div className={styles.grid}>
          {titles.map(title => {
            const isUnlocked = unlockedTitleIds.includes(title.id);
            const isEquipped = selectedTitleId === title.id;

            return (
              <div
                key={title.id}
                className={`${styles.titleCard} ${isEquipped ? styles.isEquipped : ''} ${
                  !isUnlocked ? styles.isLocked : ''
                }`}
              >
                <div className={styles.left}>
                  <div className={styles.icon}>{title.icon}</div>
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
                    <button className={styles.equipBtn} onClick={() => handleEquip(title.id)}>
                      대표 설정
                    </button>
                  )
                ) : (
                  <span className={styles.lockedBadge}>🔒 미획득</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
