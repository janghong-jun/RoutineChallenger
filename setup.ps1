# Routine Challenger 초기 환경 자동 설정 스크립트
# 실행 위치: GitHub에서 clone한 routine-challenger 저장소의 최상위 폴더
# 대상: Windows PowerShell 5.1 이상 또는 PowerShell 7+

$ErrorActionPreference = 'Stop'

function Write-Step($Message) {
    Write-Host "`n=== $Message ===" -ForegroundColor Cyan
}

function Assert-Command($Name, $InstallHint) {
    if (-not (Get-Command $Name -ErrorAction SilentlyContinue)) {
        throw "$Name 명령어를 찾을 수 없습니다. 먼저 설치해 주세요. $InstallHint"
    }
}

Write-Step '필수 프로그램 확인'
Assert-Command 'node' 'https://nodejs.org/'
Assert-Command 'npm' 'Node.js를 설치하면 함께 설치됩니다.'
Assert-Command 'git' 'https://git-scm.com/'
Assert-Command 'pnpm' 'npm install -g pnpm 명령어로 설치할 수 있습니다.'

$nodeVersion = node -v
$pnpmVersion = pnpm -v
$gitVersion = git --version
Write-Host "Node.js: $nodeVersion"
Write-Host "pnpm:    $pnpmVersion"
Write-Host "Git:     $gitVersion"

Write-Step '프로젝트 위치 확인'
if (-not (Test-Path '.git')) {
    throw '현재 폴더에서 .git 폴더를 찾을 수 없습니다. routine-challenger 저장소 최상위 폴더에서 실행해 주세요.'
}

if (-not (Test-Path 'package.json')) {
    Write-Host '루트 package.json을 생성합니다.' -ForegroundColor Yellow
} else {
    Write-Host '기존 루트 package.json이 발견되었습니다. 이 스크립트가 프로젝트 루트 설정으로 교체합니다.' -ForegroundColor Yellow
}

Write-Step '모노레포 디렉터리 생성'
$directories = @(
    'apps',
    'packages/core/src',
    'packages/types/src',
    'packages/store/src',
    'packages/storage/src',
    'packages/storage/indexeddb/src',
    'packages/storage/sqlite/src',
    'packages/ui/src',
    'data/holidays',
    'data/routine-templates',
    'data/titles',
    'docs',
    '.github/workflows'
)
foreach ($directory in $directories) {
    New-Item -ItemType Directory -Force -Path $directory | Out-Null
}

Write-Step 'pnpm workspace 및 루트 설정 파일 생성'
@'
packages:
  - "apps/*"
  - "packages/*"
'@ | Set-Content -Encoding utf8 'pnpm-workspace.yaml'

@"
{
  "name": "routine-challenger",
  "version": "1.0.0",
  "private": true,
  "packageManager": "pnpm@$pnpmVersion",
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "test": "turbo test"
  },
  "devDependencies": {
    "turbo": "^2.5.0",
    "typescript": "^5.0.0"
  }
}
"@ | Set-Content -Encoding utf8 'package.json'

@'
{
  "$schema": "https://turborepo.dev/schema.json",
  "tasks": {
    "dev": {
      "persistent": true,
      "cache": false
    },
    "build": {
      "dependsOn": ["^build"],
      "outputs": [".next/**", "!.next/cache/**", "out/**", "dist/**"]
    },
    "lint": {
      "dependsOn": ["^lint"]
    },
    "test": {
      "dependsOn": ["^test"],
      "outputs": []
    }
  }
}
'@ | Set-Content -Encoding utf8 'turbo.json'

@'
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
'@ | Set-Content -Encoding utf8 '.editorconfig'

@'
node_modules/
.next/
out/
dist/
.turbo/
coverage/
.env*
!.env.example
.DS_Store
Thumbs.db
*.log
'@ | Set-Content -Encoding utf8 '.gitignore'

Write-Step 'Next.js 웹 앱 생성'
if (-not (Test-Path 'apps/web/package.json')) {
    pnpm create next-app@latest apps/web --typescript --eslint --app --src-dir --import-alias '@/*' --use-pnpm --no-tailwind --yes
} else {
    Write-Host 'apps/web이 이미 존재하므로 Next.js 생성은 건너뜁니다.' -ForegroundColor Yellow
}

Write-Step '웹 앱 라이브러리 설치'
pnpm --filter ./apps/web add @reduxjs/toolkit react-redux echarts echarts-for-react idb sass

Write-Step '공통 패키지 기본 파일 생성'
$packageFiles = @{
    'packages/core/package.json' = @'
{
  "name": "@routine-challenger/core",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
'@
    'packages/types/package.json' = @'
{
  "name": "@routine-challenger/types",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
'@
    'packages/store/package.json' = @'
{
  "name": "@routine-challenger/store",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
'@
    'packages/storage/package.json' = @'
{
  "name": "@routine-challenger/storage",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
'@
    'packages/ui/package.json' = @'
{
  "name": "@routine-challenger/ui",
  "version": "1.0.0",
  "private": true,
  "main": "src/index.ts",
  "types": "src/index.ts"
}
'@
}
foreach ($path in $packageFiles.Keys) {
    if (-not (Test-Path $path)) {
        $packageFiles[$path] | Set-Content -Encoding utf8 $path
    }
}

$indexFiles = @(
    'packages/core/src/index.ts',
    'packages/types/src/index.ts',
    'packages/store/src/index.ts',
    'packages/storage/src/index.ts',
    'packages/ui/src/index.ts'
)
foreach ($path in $indexFiles) {
    if (-not (Test-Path $path)) {
        "// $path - 추후 기능 구현" | Set-Content -Encoding utf8 $path
    }
}

Write-Step '의존성 설치 및 lockfile 생성'
pnpm install

Write-Step '초기 설정 완료'
Write-Host '다음 명령어로 웹 개발 서버를 실행하세요:' -ForegroundColor Green
Write-Host 'pnpm --filter ./apps/web dev' -ForegroundColor Green
Write-Host '브라우저 주소: http://localhost:3000'
