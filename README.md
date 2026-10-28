# TISA Intelligent IT Solutions Portal

A central web portal for AI-powered IT services. It presents the platform's solutions and gives one front door to three existing applications: User Management, IT Asset Management and the TISA Support Assistant (Technical Information Support Assistant), a Microsoft Teams bot that gives employees first-line IT support: it answers from the internal knowledge base, reads screenshots, raises Jira tickets when it cannot resolve an issue, and reports ticket updates on request. Every launch action in the portal currently opens an in-portal demo with sample data: working copies of User Management and Asset Management, and a simulated support assistant chat. Pointing an entry at a live application again is a one-line change described under Configuration.

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
cp .env.example .env     # optional: status labels, branding, contact card
npm run dev              # http://localhost:5173
```

Other commands:

```bash
npm run build      # type-check and build to dist/
npm run preview    # serve the production build
npm test           # run the test suite once
npm run typecheck  # tsc only
```

## Configuration

Every application launches its in-portal demo, so no application URLs are needed. The optional environment variables below tune labels, branding and the contact card. Copy `.env.example` to `.env` and fill in what you want.

| Variable | Purpose |
| --- | --- |
| `VITE_USER_MANAGEMENT_STATUS`, `VITE_ASSET_MANAGEMENT_STATUS`, `VITE_TISA_TEAMS_STATUS` (optional) | `available`, `maintenance` or `coming-soon`. Leave empty to hide the indicator. These are configured labels, not live health checks |
| `VITE_BRAND_NAME`, `VITE_BRAND_TAGLINE` (optional) | Override the brand name and tagline |
| `VITE_CONTACT_NAME` (optional) | Team name on the contact card, default "IT solutions team" |
| `VITE_CONTACT_EMAIL` (optional) | Email for setup enquiries; rendered as a mailto link with a prefilled subject |
| `VITE_CONTACT_PHONE` (optional) | Phone number for setup enquiries; rendered as a tel link |
| `VITE_CONTACT_URL` (optional) | HTTPS link: a LinkedIn profile, a Teams chat link or a booking page. The button icon is chosen from the host |
| `VITE_CONTACT_URL_LABEL` (optional) | Label for that link. Defaults to "Connect on LinkedIn", "Chat in Microsoft Teams" or "Book a conversation" depending on the link |

The contact card (home page and `/solutions`, anchor `#contact`) shows whichever channels are set. With none set it shows a "not configured" message rather than invented details. Values are validated in `src/config/contact.ts`.

Vite reads `.env` at build time, so rebuild after changing values. Hosting platforms such as Cloudflare Pages need the same variables set in their build settings.

### Pointing an application at a live system

Each catalog entry in `src/config/applications.ts` has a `destination`. It is currently the demo route (`{ type: 'internal', url: '/demo/...' }`). To launch a real application instead, set it to `{ type: 'external', url: 'https://...' }`; the launcher then opens it in a new tab with `rel="noopener noreferrer"`. Rules enforced by `src/lib/url.ts`:

- External destinations must be absolute `https://` URLs. Plain `http://` is accepted only for `localhost`.
- Internal destinations must be root-relative paths (`/something`).
- Anything else (`javascript:`, `data:`, protocol-relative, malformed) is rejected and the card shows a "not configured" message instead of a link.
## Adding an application

1. Add an entry to the `applications` array in `src/config/applications.ts` (id, name, summary, description, icon, category, destination, capabilities, launch label).
2. If it needs a new icon, add it to the map in `src/components/ui/AppIcon.tsx`.
3. Give it a `destination`: an in-portal demo route, or an `https://` URL for a live application.

The launcher grid, the `/applications` index, the footer, the `/applications/<id>` launch page and the hero visual are all generated from the catalog. No new route or page component is needed. Categories appear on the index only once more than one category has applications.

## Adding services to the hero visual

The hero shows two kinds of node around the AI core:

- **Applications** (prominent chips with flowing lines) come from the catalog above. The first six are drawn; all of them still appear in the launcher.
- **Services** (small muted chips with dashed lines) come from the `heroServices` list in `src/config/content.ts`. These are illustrative labels for capabilities such as Security, Storage or Automation, not launchable destinations.

To add a service, append `{ label: 'Backup', icon: 'database' }` to `heroServices`. If the icon is new, add it to the map in `src/components/ui/AppIcon.tsx`. Positions are computed, and applications and services are interleaved around one ring so nothing needs to be placed by hand. Six to eight services fit comfortably; beyond that the labels start to crowd on smaller screens, where service labels are hidden below the `md` breakpoint anyway.

## Demo applications

Two of the catalog applications have working demo copies inside the portal, so visitors can try them without access to the real systems:

| Demo | Route | Modelled on |
| --- | --- | --- |
| User Management | `/demo/user-management` | The Flask User Management app: active and offboarded users, AD users, cloud-only Entra ID users, AD and M365 groups, license pool and assignments, scheduled tasks, audit log, organisation settings |
| TISA Support Assistant | `/demo/tisa-assistant` | A simulated Teams chat that follows the real bot's flow: acknowledge first, search a fictional knowledge base, triage (category, priority, summary), reply with a card offering Resolved, Create ticket or Escalate, create fictional Jira tickets (`TBTH-`) and report their updates on request. Sample screenshots are drawn SVGs. No sign-in, nothing real is touched. The engine is in `src/demo/chatbot/engine.ts` |
| IT Asset Inventory | `/demo/asset-management` | The Flask Asset Management portal: dashboard with KPI tiles and breakdowns, searchable and filterable asset table with colour flags and column manager, add/edit/details, audit log, settings (colour index, import/export, reference lists, integrations, danger zone) |

How they work:

- Each demo has its own sign-in page with no company logo, like the real applications before branding is uploaded. Microsoft sign-in is shown but disabled.
- The demo accounts are public by design and listed on each application's page (`/applications/<id>`). They live in `src/config/demo.ts`. `admin` gets settings, audit log, deletes and scheduling; `user` gets day-to-day work only.
- All data is fictional and held in memory. Changes last for the browser tab (sign-in state is kept in `sessionStorage`) and are discarded afterwards. Nothing contacts the real applications or any backend.
- The demos reuse the portal's design tokens, so they match the portal in both themes. Shared pieces are in `src/demo/shared` (login page, shell, table, modal, form fields, toasts); each demo has its own `data.ts` with the sample records.
- They are code-split and only load when opened.

To add a demo to another application, build it under `src/demo/<id>`, add a route in `src/App.tsx` and set `demo: { path, summary }` on the catalog entry. The launch page and launcher card pick it up automatically.
## Trusted-by logo strip

The home page shows a horizontally scrolling strip of customer wordmarks under the hero. The list lives in `src/config/trusted.ts` and renders from `src/components/home/TrustedBy.tsx`.

**The shipped names are placeholders.** They are fictional small businesses and startups used to shape the design. Replace them with real customers only once each has agreed to be named, and delete any you cannot vouch for. Each entry has a `name`, a short `sector` line (read by screen readers and shown on hover), an `icon` from the small map in the component, and a `wordmark` style (`caps`, `tight`, `light` or `italic`) so the strip does not look like one font repeated. Set the list to empty to hide the section.

Behaviour: the strip pauses on hover, on keyboard focus and with the pause button; speed scales with the number of entries; with `prefers-reduced-motion` it becomes a static wrapping row; the duplicate copy used for looping is hidden from assistive technology.

## Routes

| Route | Page |
| --- | --- |
| `/` | Home: hero, application launcher, support assistant promotion, solutions, principles, how it works, trusted-by strip, contact card, call to action |
| `/solutions` | Full solutions overview |
| `/applications` | Application index, with recently opened applications |
| `/applications/user-management` | User Management overview and launch |
| `/applications/asset-management` | Asset Management overview and launch |
| `/applications/tisa-assistant` | TISA Support Assistant overview and launch |
| `/demo/user-management` | User Management demo (sign-in, then the application) |
| `/demo/asset-management` | Asset Management demo (sign-in, then the application) |
| `/demo/tisa-assistant` | Simulated support assistant chat (no sign-in) |

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
- The support assistant demo is scripted: keyword matching against nine fictional articles stands in for the real bot's knowledge base search and local LLM triage, and ticket progress is simulated. It is a product illustration, not the bot itself.

## Recommended next steps

1. Decide when to point each catalog entry at its live application instead of the demo, and set status labels if wanted.
2. Confirm the capability bullets for each application match what the applications really do.
3. Decide on authentication (for example Microsoft Entra ID) and whether launch links should be protected.
4. Add a health-check integration only if a reliable status endpoint exists.
5. Add a search or command palette once the catalog grows beyond a handful of applications.
