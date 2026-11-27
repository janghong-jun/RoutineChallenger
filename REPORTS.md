# 프로젝트 데일리 리포트

## Day 01

### 금일 작업

- 프로젝트 개발 환경 구성 및 필수 프로그램 설치
- VS Code 개발 환경 및 기본 설정
- 프로젝트 기획 초안 작성 및 주요 기능 방향성 정리
- 경험치 및 타이틀 기반의 성장 시스템 기획
- 휴식일 및 보상·차감 정책 초안 수립

### 이슈 및 특이사항

- 없음

### 다음 작업

- 프로젝트 기술 스택 및 폴더 구조 확정
- 초기 프로젝트 생성 및 기본 환경 구축
- 주요 기능별 상세 요구사항 정리

---

## Day 02

### 금일 작업

- 모노레포 패키지 구성 및 TypeScript strict 설정 (`tsconfig.base.json`, 각 패키지 `tsconfig.json`)
- 공통 타입 모델 정의 (`@routine-challenger/types`: Routine, Record, EXP, Title, Holiday, Storage)
- 밸런싱 데이터 및 정책 데이터 분리 (`@routine-challenger/data`: 2025~2027 공휴일, 타이틀, 추천 템플릿, EXP 설정)
- 비즈니스 코어 로직 구현 및 Vitest 테스트 24개 항목 검증 완료 (`@routine-challenger/core`: EXP 엔진, 공휴일 판정, 스케줄러, 스트릭, 난이도 해금, 타이틀 판정)
- Repository 패턴 기반의 IndexedDB 스토리지 구현 (`@routine-challenger/storage`)
- Redux Toolkit 전역 상태 관리 구현 (`@routine-challenger/store`)
- 공통 디자인 토큰 및 뱃지 UI 구현 (`@routine-challenger/ui`)
- Next.js 기반 모던 대시보드 UI 구현 (`apps/web`: 다크/라이트 테마, 실시간 통계 차트, 주간 스트릭 바, 루틴 체크/승급, 템플릿 추가 모달, 타이틀 갤러리)
- Next.js 정적 내보내기(`output: 'export'`) 빌드 및 전체 워크스페이스 타입 검사 완료

### 이슈 및 특이사항

- Windows PowerShell 인코딩으로 인한 JSON BOM 이슈 발견 및 제거 처리 완료
- pnpm v11 빌드 스크립트 정책(esbuild) 허용 구성 완료

### 다음 작업

- Phase 3 성장 시스템 고도화 및 밸런싱 모니터링
- Phase 4 일일 마감 처리 및 누락일 복구 기능
- GitHub Pages 배포 자동화를 위한 GitHub Actions 워크플로우 구성
