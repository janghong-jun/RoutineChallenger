<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## 스타일 속성 순서

SCSS와 CSS의 style 속성은 다음 순서로 작성한다.

1. position, inset, top/right/bottom/left, z-index
2. display, flex/grid 관련 속성, align/justify 관련 속성
3. gap, width/height, min/max width/height
4. margin, padding
5. overflow
6. font, line-height, letter-spacing, text 관련 속성
7. color
8. background 및 background-* 속성
9. border 및 border-* 속성
10. border-radius
11. box-shadow, text-shadow
12. opacity, cursor
13. vendor/compatibility 속성
14. transform, transition, animation

## 데이터 저장

- 테마 설정만 브라우저 localStorage에 저장한다.
- 루틴, 실천 기록, 경험치, 타이틀, 휴일 등 나머지 웹 앱 데이터는 IndexedDB에 저장한다.
- GitHub API나 Git에 앱 사용자 데이터를 저장하지 않는다.
- JSON 내보내기와 가져오기 기능을 유지한다.
- 가져오기 전 스키마를 검증하고 사용자 확인을 받는다.

## 접근성

- 모든 모달은 이름이 지정된 `role="dialog"`와 `aria-modal="true"`를 사용한다.
- 모달 포커스는 열릴 때 모달 안으로 이동하고, `Tab`과 `Shift+Tab` 양쪽 경계에서 순환하며, 닫힐 때 열기 버튼으로 복원한다.
- 모달이 열린 동안 페이지 스크롤을 잠그고 닫힐 때 기존 스크롤 상태를 복원한다.
- 입력에는 연결된 레이블을, 아이콘 버튼에는 명확한 접근성 이름을 제공한다.
- 키보드 포커스 표시를 유지하고 `prefers-reduced-motion` 설정을 존중한다.
