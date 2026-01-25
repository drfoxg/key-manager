// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  // добавляй другие переменные сюда
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
