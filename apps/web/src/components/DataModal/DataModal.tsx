'use client';

import React, { useState } from 'react';
import {
  getStorageContainer,
  hasSavedGitHubToken,
  isAppDataSnapshot,
  removeSavedGitHubToken,
  saveGitHubToken,
} from '@routine-challenger/storage';
import styles from './DataModal.module.scss';

interface DataModalProps {
  onClose: () => void;
}

export const DataModal: React.FC<DataModalProps> = ({ onClose }) => {
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const [token, setToken] = useState('');
  const [hasToken, setHasToken] = useState(hasSavedGitHubToken);

  const handleSaveToken = () => {
    try {
      saveGitHubToken(token);
      setToken('');
      setHasToken(true);
      setStatus('이 브라우저에 GitHub 토큰을 저장했습니다.');
    } catch (error) {
      setStatus(error instanceof Error ? error.message : '토큰 저장에 실패했습니다.');
    }
  };

  const handleRemoveToken = () => {
    removeSavedGitHubToken();
    setHasToken(false);
    setStatus('저장된 GitHub 토큰을 삭제했습니다.');
  };

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
        ? '가져온 JSON에는 저장된 데이터가 없습니다. 기존 GitHub 데이터를 모두 빈 데이터로 바꿀까요?'
        : `루틴 ${parsed.routines.length}개, 실천 기록 ${parsed.records.length}개, 경험치 내역 ${parsed.expHistory.length}개를 가져올까요? 현재 GitHub 데이터는 이 파일 내용으로 교체됩니다.`;

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
            루틴, 실천 기록, 경험치, 타이틀, 휴일 데이터를 GitHub JSON으로 관리합니다.
            GitHub 토큰은 이 브라우저의 localStorage에 저장됩니다. 스크립트 주입 공격에 노출될
            수 있으므로 본인 기기에서만 저장하세요.
          </p>

          <label className={styles.tokenLabel} htmlFor="github-token">
            GitHub 개인 액세스 토큰
          </label>
          <input
            id="github-token"
            className={styles.tokenInput}
            type="password"
            autoComplete="new-password"
            value={token}
            onChange={event => setToken(event.target.value)}
            placeholder={hasToken ? '저장된 토큰을 변경하려면 새 토큰 입력' : '토큰 입력'}
          />
          <div className={styles.tokenActions}>
            <button
              className={styles.actionButton}
              onClick={handleSaveToken}
              disabled={!token.trim()}
            >
              토큰 저장
            </button>
            {hasToken && (
              <button className={styles.removeButton} onClick={handleRemoveToken}>
                저장된 토큰 삭제
              </button>
            )}
          </div>
          <p className={styles.status}>
            {hasToken ? 'GitHub 토큰이 저장되어 있습니다.' : 'GitHub 토큰이 저장되어 있지 않습니다.'}
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
