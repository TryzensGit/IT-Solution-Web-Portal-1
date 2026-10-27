/**
 * Brand configuration. Change the name, tagline and copy here; nothing
 * else in the UI hardcodes them. VITE_BRAND_NAME / VITE_BRAND_TAGLINE
 * can override the defaults per environment.
 */
const name = import.meta.env.VITE_BRAND_NAME?.trim() || 'TISA'

export const brand = {
  name,
  fullName: `${name} Intelligent IT Solutions`,
  tagline:
    import.meta.env.VITE_BRAND_TAGLINE?.trim() ||
    'Smarter IT. Intelligent Automation. Better Experiences.',
  description:
    'Transform IT operations with intelligent automation, AI-powered assistance, and streamlined management tools.',
  assistantName: `${name} AI Assistant`,
} as const
