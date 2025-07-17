# Vite Client 타입 정의 문제 해결

## 🔧 문제 상황
TypeScript에서 `'vite/client'에 대한 형식 정의 파일을 찾을 수 없습니다` 오류 발생

## 📝 변경 사항 요약

### ✅ 새로 추가된 파일들

#### 1. `client/src/vite-env.d.ts` (NEW FILE)
```typescript
// Vite 환경 변수 타입 정의
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_URL: string
  readonly DEV: boolean
  readonly PROD: boolean
  readonly MODE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
  readonly url: string
}
```

#### 2. `client/tsconfig.node.json` (NEW FILE)
```json
{
  "compilerOptions": {
    "composite": true,
    "skipLibCheck": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "types": ["node", "vite/client"]
  },
  "include": ["vite.config.ts"]
}
```

### 🔄 수정된 파일들

#### 3. `client/tsconfig.json` (MODIFIED)
```json
{
  // ... 기존 설정 ...
  "compilerOptions": {
    // [CHANGED] "vite/client" 제거
    "types": ["node"],
    // ... 기타 설정 ...
  },
  // [ADDED] Vite 설정 파일 참조 추가
  "references": [
    { "path": "./tsconfig.node.json" }
  ]
}
```

## 🎯 해결 방법 설명

### 문제 원인
- `tsconfig.json`에서 `"types": ["node", "vite/client"]`로 설정했지만
- 실제로는 `vite/client` 타입 정의가 필요하지 않았음
- `import.meta.env`와 `import.meta.url` 사용으로 인한 타입 오류

### 해결 방법
1. **`vite-env.d.ts`** 파일 생성으로 Vite 환경 변수 타입 정의
2. **`tsconfig.node.json`** 파일 생성으로 Vite 설정 파일 전용 타입 설정
3. **`tsconfig.json`**에서 `vite/client` 제거하고 references 추가

## 📍 실제 사용되는 곳

### 1. `client/src/lib/apiClient.ts` (6번째 줄)
```typescript
if (import.meta.env.DEV) {  // ← 여기서 사용!
  return '';
}
```

### 2. `client/vite.config.ts` (5번째 줄)
```typescript
const __dirname = path.dirname(fileURLToPath(import.meta.url));  // ← 여기서도 사용!
```

## ✅ 결과
- TypeScript 오류 해결
- `import.meta.env.DEV` 정상 작동
- `import.meta.url` 정상 작동
- Vite 개발 환경과 프로덕션 환경 구분 가능

## 🚀 권장사항
이 방법은 Vite 공식 문서에서 권장하는 방식으로, 타입 안전성을 보장하면서도 성능에 영향을 주지 않습니다. 