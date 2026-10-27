/**
 * Customer logos for the "trusted by" strip on the home page.
 *
 * PLACEHOLDERS. These are fictional small businesses and startups used to
 * shape the design. Replace them with real customers only once each one has
 * agreed to be named, and remove any you cannot vouch for. The portal must
 * not claim customers it does not have.
 *
 * Each entry renders as a wordmark (name set in a distinctive style) with a
 * small icon mark, so no image files are needed. Swap `icon`/`wordmark` for a
 * real logo later by extending `TrustedBy.tsx`.
 */
export type TrustedIcon =
  | 'truck'
  | 'stethoscope'
  | 'coffee'
  | 'sparkles'
  | 'calculator'
  | 'feather'
  | 'compass'
  | 'cpu'
  | 'paw'
  | 'scale'
  | 'palette'
  | 'hexagon'

/** Typographic treatment for the wordmark, so the strip does not look like one font repeated. */
export type Wordmark = 'caps' | 'tight' | 'light' | 'italic'

export interface TrustedCompany {
  name: string
  /** Short description read by screen readers and shown on hover. */
  sector: string
  icon: TrustedIcon
  wordmark: Wordmark
}

export const trustedCompanies: TrustedCompany[] = [
  { name: 'Kettlebrook Logistics', sector: 'Regional courier, 40 staff', icon: 'truck', wordmark: 'tight' },
  { name: 'Ashgrove Dental', sector: 'Two-site dental practice', icon: 'stethoscope', wordmark: 'light' },
  { name: 'Saltmarsh Coffee Co.', sector: 'Roastery and three cafés', icon: 'coffee', wordmark: 'italic' },
  { name: 'Brightfold', sector: 'HR software startup', icon: 'sparkles', wordmark: 'tight' },
  { name: 'Oakmere Accountants', sector: 'Accountancy firm, 25 staff', icon: 'calculator', wordmark: 'caps' },
  { name: 'Larkspur Recruitment', sector: 'Recruitment agency', icon: 'feather', wordmark: 'light' },
  { name: 'Wrenfield Architects', sector: 'Architecture studio', icon: 'compass', wordmark: 'caps' },
  { name: 'Hollowbeam Robotics', sector: 'Hardware startup', icon: 'cpu', wordmark: 'tight' },
  { name: 'Pinecrest Vets', sector: 'Veterinary practice', icon: 'paw', wordmark: 'italic' },
  { name: 'Tidewell Legal', sector: 'Law firm, 18 staff', icon: 'scale', wordmark: 'caps' },
  { name: 'Fernhollow Studio', sector: 'Design agency', icon: 'palette', wordmark: 'light' },
  { name: 'Quartzline Analytics', sector: 'Data startup', icon: 'hexagon', wordmark: 'tight' },
]

export const trustedHeading = 'Trusted by growing businesses and startups'
export const trustedLead = 'From single-site practices to teams scaling past their first fifty people.'
