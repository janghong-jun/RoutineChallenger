# Routine Challenger 초기 설정 파일

이 패키지는 Windows PowerShell용 초기 설정 스크립트입니다.

## 실행 전 준비

- Node.js LTS
- Git
- pnpm
- GitHub에서 clone한 `routine-challenger` 저장소

Android Studio와 Android SDK는 이번 단계에서 설치하지 않습니다.

## 실행 방법

1. ZIP 파일을 압축 해제합니다.
2. `setup.ps1`을 GitHub에서 clone한 `routine-challenger` 저장소 최상위 폴더에 복사합니다.
3. VS Code에서 해당 저장소 폴더를 엽니다.
4. VS Code 터미널에서 PowerShell을 선택합니다.
5. 아래 명령어를 실행합니다.

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
.\setup.ps1
```

스크립트는 루트 설정 파일과 기본 모노레포 디렉터리를 만들고, `apps/web`에 Next.js를 생성한 뒤 필요한 웹 라이브러리를 설치합니다.

## 완료 후 실행

```powershell
pnpm --filter ./apps/web dev
```

브라우저에서 http://localhost:3000 을 엽니다.

## 주의

- 저장소 최상위 폴더에서 실행해야 합니다. `.git` 폴더가 있는지 확인합니다.
- 루트 `package.json`, `pnpm-workspace.yaml`, `turbo.json`, `.gitignore`는 스크립트가 프로젝트 기준 설정으로 생성/교체합니다.
- GitHub에서 README를 생성했다면 README는 수정하지 않습니다.
- `apps/web`이 이미 존재하면 Next.js 생성은 건너뛰고 라이브러리 설치를 진행합니다.
- 기존 작업물이 있는 프로젝트에서 실행하기 전에는 반드시 Git commit 또는 별도 백업을 만드세요.
