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
