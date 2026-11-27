'use client';

import React, { useState } from 'react';
import {
  getStorageContainer,
  isAppDataSnapshot,
} from '@routine-challenger/storage';
import styles from './DataModal.module.scss';

interface DataModalProps {
  onClose: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);

  const handleExport = async () => {
    setBusy(true);
    setStatus('');

    try {
      const snapshot = await getStorageContainer().exportSnapshot();
      const blob = new Blob([JSON.stringify(snapshot, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `routine-challenger-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus('JSON 파일을 내보냈습니다.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '내보내기에 실패했습니다.');
    } finally {
      setBusy(false);
    }
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setBusy(true);
    setStatus('');

    try {
      const parsed: unknown = JSON.parse(await file.text());
      if (!isAppDataSnapshot(parsed)) {
        throw new Error('가져올 JSON 데이터의 형식이 올바르지 않습니다.');
      }

      const isEmpty =
        parsed.routines.length === 0 &&
        parsed.records.length === 0 &&
        parsed.expHistory.length === 0 &&
        parsed.customHolidays.length === 0 &&
        parsed.userProfile === null;
      const confirmationMessage = isEmpty
        ? '가져온 JSON에는 저장된 데이터가 없습니다. IndexedDB의 기존 데이터를 모두 비울까요?'
        : `루틴 ${parsed.routines.length}개, 실천 기록 ${parsed.records.length}개, 경험치 내역 ${parsed.expHistory.length}개를 가져올까요? 현재 브라우저의 IndexedDB 데이터는 이 파일 내용으로 교체됩니다.`;

      if (!window.confirm(confirmationMessage)) {
        return;
      }

      await getStorageContainer().importSnapshot(parsed);
      setStatus('JSON 데이터를 가져왔습니다. 화면을 새로고침합니다.');
      window.location.reload();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '가져오기에 실패했습니다.');
    } finally {
      setBusy(false);
      event.target.value = '';
    }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={event => event.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>JSON 데이터 관리</h2>
          <button className={styles.closeButton} onClick={onClose}>✕</button>
        </div>

        <div className={styles.body}>
          <p className={styles.description}>
            루틴, 실천 기록, 경험치, 타이틀, 휴일 데이터는 이 브라우저의 IndexedDB에 저장됩니다.
            JSON 파일은 백업 및 복원에 사용합니다.
          </p>

          <button className={styles.actionButton} onClick={handleExport} disabled={busy}>
            JSON 내보내기
          </button>

          <label className={styles.importButton}>
            JSON 가져오기
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              disabled={busy}
            />
          </label>

          {status && <p className={styles.status}>{status}</p>}
        </div>
      </div>
    </div>
  );
};
