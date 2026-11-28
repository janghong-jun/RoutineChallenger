# 프로젝트 데일리 리포트

## Day 01 (2026-11-27 ~ 11-28)

### 금일 작업

**기획**

- 프로젝트 기획 초안 작성 및 주요 기능 방향성 정리 (11/27 19:00 시작)
- 경험치(EXP) 및 타이틀 기반의 성장 시스템 기획
- 휴식일 및 보상·차감 정책 초안 수립

**개발 환경**

- 개발 환경 구성 및 필수 프로그램 설치 (Node.js, Git, pnpm)
- VS Code 개발 환경 및 기본 설정 (`.editorconfig`, Prettier)
- pnpm + Turborepo 모노레포 구성 (`setup.ps1`, `scripts/dev.mjs`)
- TypeScript strict 설정 (`tsconfig.base.json`, 각 패키지 `tsconfig.json`)

**패키지 / 코어 로직**

- 공통 타입 모델 정의 (`@routine-challenger/types`: Routine, Record, EXP, Title, Holiday, Storage)
- 밸런싱 데이터 및 정책 데이터 분리 (`@routine-challenger/data`: 2025~2027 공휴일, 타이틀, 추천 템플릿, EXP 설정)
- 비즈니스 코어 로직 구현 (`@routine-challenger/core`: EXP 엔진, 공휴일 판정, 스케줄러, 스트릭, 난이도 해금, 타이틀 판정)
- Vitest 테스트 24개 항목 검증 완료
- Repository 패턴 기반의 IndexedDB 스토리지 구현 (`@routine-challenger/storage`)
- Redux Toolkit 전역 상태 관리 구현 (`@routine-challenger/store`)

**UI**

- 공통 디자인 토큰 및 뱃지 UI 구현 (`@routine-challenger/ui`)
- Next.js 기반 대시보드 UI 구현 (`apps/web`: 다크/라이트 테마, 통계 차트, 주간 스트릭 바, 루틴 체크/승급, 템플릿 추가 모달, 타이틀 갤러리)
- 컴포넌트별 SCSS Modules 적용 및 스타일 속성 순서 정리
- 웹폰트 적용

**배포**

- Next.js 정적 내보내기(`output: 'export'`) 빌드 및 전체 워크스페이스 타입 검사 완료
- GitHub Pages용 Next.js 설정
- GitHub Actions CI 및 Pages 배포 워크플로우 구성 (lint, type-check, build, deploy)

### 이슈 및 특이사항

- Windows PowerShell 인코딩으로 인한 JSON BOM 이슈 발견 및 제거 처리 완료
- pnpm v11 빌드 스크립트 정책(esbuild) 허용 구성 완료

### 다음 작업

- Day 02: 디자인 수정

---

## Day 02

### 금일 작업

**디자인 전면 개편**

- 디자인 방향 변경: 보라 그라데이션 + 이모지 중심 → 중립 회색 바탕, 잉크(검정) 버튼, 초록 포인트 1색의 모던/미니멀 스타일
- 디자인 토큰 재정의 (`variables.scss`): 라이트/다크 테마별 색상, 카테고리 아이콘 색, 반경 토큰
- 이모지를 SVG 아이콘으로 교체 (`@routine-challenger/ui`의 `Icon`, 외부 라이브러리 없이 직접 관리)
- 루틴 카드를 개별 카드에서 하나의 목록 + 구분선 구조로 변경, 체크 시 SVG 체크가 그려지는 인터랙션 추가
- 날짜 헤더 및 주간 선택을 세그먼트 컨트롤 형태로 정리
- 성장 지표를 목록형 + 도넛 차트(중앙 달성률)로 변경, ECharts 색상이 테마(다크/라이트)를 따라가도록 처리하고 트랙 hover 색상 대비 보강
- 모달 2종(루틴 추가, 타이틀 갤러리) 스타일 개편, 모바일에서는 바텀시트 형태로 표시
- 날짜 선택기 후속 개선: 모바일 바텀시트와 데스크톱 앵커 위치 분리, 연·월·일 표기 통일, 직접 입력 차단
- 날짜 선택기 키보드 접근 개선: 선택 날짜로 포커스 이동, 방향키 탐색, Tab 순환, Escape 닫기 및 포커스 복귀
- 날짜 선택기를 열 때 포커스 순환 래퍼가 날짜 제목 레이아웃을 밀지 않도록 배치 조정

**접근성(KWCAG 2.2) 보강**

- 기존 `useModalAccessibility` 훅 유지 및 적용: 정·역방향 포커스 트랩, 외부 포커스 차단, Esc 닫기, 스크롤 잠금·복원
- 다이얼로그 `role`, `aria-modal`, `aria-labelledby` 적용 및 폼 `label`-`input` 연결
- 아이콘 버튼 `aria-label`, 토글 버튼 `aria-pressed`, 진행률 `role="progressbar"`
- DatePicker를 직접 입력 없이 키보드로 조작할 수 있도록 포커스 이동과 복귀 처리
- 본문 바로가기(skip link), 전역 `:focus-visible` 스타일, `prefers-reduced-motion` 대응

### 이슈 및 특이사항

- 반응형 브레이크포인트가 `rem` 단위여서 `html { font-size: 62.5% }`와 상관없이 브라우저 기본 16px 기준(약 1587px)으로 동작하던 문제를 `px` 단위로 수정
- 비즈니스 로직(EXP 계산, 저장소, 상태 관리)은 변경하지 않고 화면 코드(JSX, SCSS)만 수정
- `DIFFICULTY_METADATA.badge`(이모지)는 막대형 난이도 표시로 대체되어 제거, 카테고리 메타의 `icon`은 이모지에서 아이콘 이름으로 변경
- `apps/web/pnpm-workspace.yaml`, `apps/web/pnpm-lock.yaml`이 남아 있어 `apps/web`에서 `pnpm dev` 실행 시 workspace 오류가 발생할 수 있음 (루트에서 실행하면 정상)
- `apps/web/src/app/page.module.css`는 사용하지 않는 파일

### 업데이트된 계획표

| 순서 | 작업 범위 | 상태 |
| --- | --- | --- |
| Day 01 | 웹 개발 환경, 모노레포, 공통 코어·스토리지·상태 관리 구성 | 완료 |
| Day 02 | UI 개편, 반응형 DatePicker, 키보드 접근성, 차트 hover 대비 보강 | 완료 |
| 다음: Phase 3 | 이미 구현한 성장 코어를 화면·상태 흐름과 검증하고 EXP 밸런싱 및 중복 정산 테스트 보완 | 진행 예정 |
| Phase 4 | 일일 마감, 누락일 결과 복구, 미달성 판정 및 리마인더 | 예정 |
| Phase 5 | 기간별 통계, JSON 내보내기·가져오기 및 유효성 검사 | 예정 |
| Phase 6 | 통합·E2E 검증, 정적 빌드, GitHub Pages 배포 확인 | 예정 |
| Phase 7 | 웹 안정화 후 Android 앱 확장 | 웹 완료 후 |
