// ========================================
// [NEW FILE] Vite 환경 변수 타입 정의
// ========================================
// 이 파일은 새로 추가된 파일입니다.
// Vite에서 제공하는 import.meta.env와 import.meta.url의 타입 정의를 담당합니다.

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