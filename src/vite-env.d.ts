/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USER_MANAGEMENT_URL?: string
  readonly VITE_ASSET_MANAGEMENT_URL?: string
  readonly VITE_TISA_TEAMS_URL?: string
  readonly VITE_USER_MANAGEMENT_STATUS?: string
  readonly VITE_ASSET_MANAGEMENT_STATUS?: string
  readonly VITE_TISA_TEAMS_STATUS?: string
  readonly VITE_BRAND_NAME?: string
  readonly VITE_BRAND_TAGLINE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
