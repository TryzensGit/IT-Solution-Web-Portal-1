# TISA Intelligent IT Solutions Portal

A central web portal for AI-powered IT services. It presents the platform's solutions and gives one front door to three existing applications: User Management, IT Asset Management and the TISA AI Assistant for Microsoft Teams. The portal links to those applications through configurable URLs; it does not recreate them.

## Stack

- React 19 + TypeScript, built with Vite 7
- Tailwind CSS 4 (CSS-first tokens in `src/index.css`)
- React Router 7 for internal routes
- Framer Motion for page transitions and the hero entrance
- Lucide React icons, Inter (self-hosted via `@fontsource-variable/inter`)
- Vitest + Testing Library

## Getting started

```bash
npm install
cp .env.example .env     # then fill in the application URLs
npm run dev              # http://localhost:5173
```

Other commands:

```bash
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
npm test           # run the test suite once
npm run typecheck  # tsc only
```

## Configuring the application links

All destinations come from environment variables read in `src/config/applications.ts`. Nothing else in the UI hardcodes a URL.

| Variable | Purpose |
| --- | --- |
| `VITE_USER_MANAGEMENT_URL` | Destination for the User Management application |
| `VITE_ASSET_MANAGEMENT_URL` | Destination for the Asset Management application |
| `VITE_TISA_TEAMS_URL` | Destination for the assistant, normally a Microsoft Teams deep link |
| `VITE_*_STATUS` (optional) | `available`, `maintenance` or `coming-soon`. Leave empty to hide the indicator |
| `VITE_BRAND_NAME`, `VITE_BRAND_TAGLINE` (optional) | Override the brand name and tagline |
| `VITE_CONTACT_NAME` (optional) | Team name on the contact card, default "IT solutions team" |
| `VITE_CONTACT_EMAIL` (optional) | Email for setup enquiries; rendered as a mailto link with a prefilled subject |
| `VITE_CONTACT_PHONE` (optional) | Phone number for setup enquiries; rendered as a tel link |
| `VITE_CONTACT_URL` (optional) | HTTPS link: a LinkedIn profile, a Teams chat link or a booking page. The button icon is chosen from the host |
| `VITE_CONTACT_URL_LABEL` (optional) | Label for that link. Defaults to "Connect on LinkedIn", "Chat in Microsoft Teams" or "Book a conversation" depending on the link |

The contact card (home page and `/solutions`, anchor `#contact`) shows whichever channels are set. With none set it shows a "not configured" message rather than invented details. Values are validated in `src/config/contact.ts`.

Rules enforced by `src/lib/url.ts`:

- External destinations must be absolute `https://` URLs. Plain `http://` is accepted only for `localhost`.
- Internal destinations must be root-relative paths (`/something`).
- Anything else (`javascript:`, `data:`, protocol-relative, malformed) is rejected and the card shows a "not configured" message instead of a link.

Vite reads `.env` at build time, so rebuild after changing values. A missing URL does not break the build; the portal shows a helpful message in place of the launch button.

Status labels are static configuration. The portal does not perform live health checks.

## Adding an application

1. Add an entry to the `applications` array in `src/config/applications.ts` (id, name, summary, description, icon, category, destination, capabilities, launch label).
2. If it needs a new icon, add it to the map in `src/components/ui/AppIcon.tsx`.
3. Add the matching `VITE_..._URL` variable to `.env.example` and your `.env`.

The launcher grid, the `/applications` index, the footer, the `/applications/<id>` launch page and the hero visual are all generated from the catalog. No new route or page component is needed. Categories appear on the index only once more than one category has applications.

## Adding services to the hero visual

The hero shows two kinds of node around the AI core:

- **Applications** (prominent chips with flowing lines) come from the catalog above. The first six are drawn; all of them still appear in the launcher.
- **Services** (small muted chips with dashed lines) come from the `heroServices` list in `src/config/content.ts`. These are illustrative labels for capabilities such as Security, Storage or Automation, not launchable destinations.

To add a service, append `{ label: 'Backup', icon: 'database' }` to `heroServices`. If the icon is new, add it to the map in `src/components/ui/AppIcon.tsx`. Positions are computed, and applications and services are interleaved around one ring so nothing needs to be placed by hand. Six to eight services fit comfortably; beyond that the labels start to crowd on smaller screens, where service labels are hidden below the `md` breakpoint anyway.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: hero, application launcher, solutions, principles, how it works, call to action |
| `/solutions` | Full solutions overview |
| `/applications` | Application index, with recently opened applications |
| `/applications/user-management` | User Management overview and launch |
| `/applications/asset-management` | Asset Management overview and launch |
| `/applications/tisa-assistant` | TISA AI Assistant overview and launch |

`/#solutions` and `/#applications` scroll to the matching sections on the home page.

For deployment behind a static host, configure the server to serve `index.html` for unknown paths so client-side routes work on direct load.

## Design system

Tokens live in `src/index.css`. Raw colours are set on `:root` (dark) and `[data-theme="light"]`, and `@theme inline` maps them to Tailwind utilities such as `bg-surface`, `text-muted`, `border-line` and `text-accent`. Components use those utilities, so both themes come from one set of classes.

Theme behaviour:

- The stored preference is `tisa-theme` in `localStorage` (`light` or `dark`).
- With no stored preference the portal follows the operating system and updates live if it changes.
- An inline script in `index.html` applies the theme before first paint to avoid a flash.

Motion is defined in `src/lib/motion.ts`. All non-essential movement is removed when `prefers-reduced-motion` is set, through CSS, Framer Motion's `MotionConfig reducedMotion="user"` and `useReducedMotion` checks.

## Project layout

```
src/
  config/        brand.ts, applications.ts (catalog), content.ts (copy)
  lib/           url.ts (validation), launch.ts, recent.ts, motion.ts
  theme/         ThemeProvider.tsx
  components/
    layout/      Navbar, Footer, Layout, PageTransition, ScrollManager
    ui/          Button, StatusBadge, ThemeToggle, AppIcon, Reveal, SectionHeading, BrandMark
    home/        Hero, HeroVisual, ApplicationCard, ApplicationGrid, LauncherSection,
                 SolutionsSection, CapabilitiesSection, HowItWorks, FinalCta
    apps/        AppLaunchPage, AppVisual
  pages/         Home, Solutions, Applications, AppDetail, NotFound
  test/          Vitest setup and tests
```

## Security notes

This version is a frontend portal only. It has no authentication and must not be treated as a security boundary. Hiding or showing a card does not protect the application behind it; each destination application must enforce its own sign-in and authorisation.

No credentials, API keys or tokens belong in the `VITE_` environment variables, because Vite inlines them into the public bundle.

When Microsoft Entra ID or another SSO provider is added, keep tokens out of URLs and out of long-lived browser storage, and have the portal and each application validate sessions independently.

## Known limitations

- Application status is a configured label, not a live check.
- "Recently opened" is stored per browser in `localStorage` (application ids only) and is not synced.
- There is no application search. With three applications it would add noise; the catalog structure supports adding one later.
- The assistant page describes the chatbot and shows an illustrative conversation. The real assistant runs in Microsoft Teams at the configured URL.

## Recommended next steps

1. Set the three application URLs and, if wanted, their status labels.
2. Confirm the capability bullets for each application match what the applications really do.
3. Decide on authentication (for example Microsoft Entra ID) and whether launch links should be protected.
4. Add a health-check integration only if a reliable status endpoint exists.
5. Add a search or command palette once the catalog grows beyond a handful of applications.
