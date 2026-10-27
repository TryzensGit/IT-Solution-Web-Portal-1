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
  readonly VITE_CONTACT_NAME?: string
  readonly VITE_CONTACT_EMAIL?: string
  readonly VITE_CONTACT_PHONE?: string
  readonly VITE_CONTACT_URL?: string
  readonly VITE_CONTACT_URL_LABEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
