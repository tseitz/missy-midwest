# missy-midwest

SvelteKit + Svelte 5 (runes mode) project. Styling via Tailwind CSS v4.

## Package manager: pnpm (canonical)

**Always use `pnpm`** — never `npm` or `yarn`. Mixing managers reshuffles
`node_modules` and corrupts tooling (prettier/eslint version skew). Pinned via
the `packageManager` field in `package.json`; lockfile is `pnpm-lock.yaml`
(there is no `package-lock.json`).

- Install / add: `pnpm install`, `pnpm add <pkg>` (`-D` for dev).
- Scripts / binaries: `pnpm <script>`, `pnpm exec <bin>`.
- Build-script allowlist lives in `pnpm-workspace.yaml` (`onlyBuiltDependencies`);
  add a package there if its postinstall must run, then `pnpm rebuild`.
- Non-interactive runs (agents/CI): prefix with `CI=true` so pnpm never blocks
  on a TTY prompt (`.npmrc` also sets `confirm-modules-purge=false`).

## Design system

Styling is **Tailwind CSS v4 + a thin shared-component layer**. Reuse the
existing primitives instead of hand-rolling markup — that's what keeps the site
consistent.

**Shared components** (`src/lib/components/`):

- `Section.svelte` — the standard section shell. Encodes
  `w-full max-w-screen-2xl px-8 py-16 md:px-14` + optional scroll-reveal +
  optional `SectionHeading` + optional right-side `action` snippet. **Use this
  for every page/home section** rather than re-typing the shell string.
  Props: `label?`, `title?`, `reveal?=true`, `id?`, `class?`, `action?` snippet.
- `SectionHeading.svelte` — eyebrow label + `<h2>`. Props: `label`, `title`.
  (Used internally by `Section`; use directly only outside a `Section`.)
- `Button.svelte` — props `label`, `href?`, `variant?: 'fill' | 'outline'`.
  `fill` = gradient primary CTA; `outline` = secondary. Always use for buttons/CTAs.
- `Lightbox.svelte`, `SocialLinks.svelte`, `Footer.svelte` — as named.

**Brand tokens** (defined in `src/app.css` `@theme`):

- Fonts: `--font-cochin` (headings, serif), `--font-obviously` (body, sans),
  `--font-algiers`, `--font-mono`. Headings (`h1–h6`) auto-use Cochin in lavender.
- Colors (use the Tailwind class form, e.g. `text-missy-magenta`):
  `missy-blush`, `missy-neon-lavender`, `missy-deep-purple` (page bg),
  `missy-magenta`, `missy-plum`, `missy-classic-lavender` (default link/heading),
  plus `lake-*` accents (`lake-sunrise` orange, `lake-sunset`, etc.).
- Brand utilities: `.label-eyebrow` (orange uppercase eyebrow — `SectionHeading`
  uses it), `.text-gradient-sun`, `.text-glow`, `.bg-glow-warm` (hero gradient),
  `.missy-header`.

**Spacing rhythm** — stick to this scale; don't pick arbitrary values:

- Section outer padding: handled by `Section` (`px-8 py-16 md:px-14`). Don't override unless there's a reason.
- After a `SectionHeading`, body starts at `mt-2`.
- Vertical gaps between stacked elements: `mt-4` (tight) / `mt-6` (default) / `mt-8` (loose, e.g. before a CTA).
- Grid gaps: `gap-5` (cards) / `gap-8` (two-column splits).
- Prefer standard utilities over arbitrary `[…]` values — Tailwind v4 can choke
  on some bracket values (e.g. `min-h-[32rem]` crashed the compiler; use
  `min-h-128`).

**Responsive principle:** design the mobile stack first (single column,
deliberate vertical order), then promote to columns at `md`/`lg`
(`grid-cols-1 lg:grid-cols-2`). One stack that unfolds sideways — not two layouts.

## Images & static assets

Static images live in **`static/<feature>/`** (e.g. `static/bio/`, `static/landing/`,
`static/archive/gig-photos/`) and are served at the site root. SvelteKit does **not**
use `public/` — there is no `public/` or `src/assets/` directory.

- **Reference them via `asset()` from `$app/paths`**, never bare strings:
  `<img src={asset('/bio/jordan.webp')} />`. For CSS backgrounds use an inline
  `style="background-image: url({asset('/landing/x.webp')})"` rather than a
  `bg-[url(...)]` arbitrary class (which can crash the Tailwind v4 compiler).
- **Exception — `og:image`/JSON-LD:** these need an absolute URL, so `Seo.svelte`
  and `jsonld.ts` build `origin + path` themselves. Leave those as path strings.
- Data-driven filenames (e.g. gig photos keyed by event slug, the event-poster
  default) stay in `static/` and are referenced by path — they can't be imported.
- Build-time-known _design_ images that need responsive `srcset`/AVIF would move
  to `src/lib/assets/` and be imported — only once `@sveltejs/enhanced-img` is added
  (not in use today).

## Svelte MCP server

You are able to use the Svelte MCP server, where you have access to comprehensive Svelte 5 and SvelteKit documentation. Here's how to use the available tools effectively:

### Available Svelte MCP Tools:

#### 1. list-sections

Use this FIRST to discover all available documentation sections. Returns a structured list with titles, use_cases, and paths.
When asked about Svelte or SvelteKit topics, ALWAYS use this tool at the start of the chat to find relevant sections.

#### 2. get-documentation

Retrieves full documentation content for specific sections. Accepts single or multiple sections.
After calling the list-sections tool, you MUST analyze the returned documentation sections (especially the use_cases field) and then use the get-documentation tool to fetch ALL documentation sections that are relevant for the user's task.

#### 3. svelte-autofixer

Analyzes Svelte code and returns issues and suggestions.
You MUST use this tool whenever writing Svelte code before sending it to the user. Keep calling it until no issues or suggestions are returned.

#### 4. playground-link

Generates a Svelte Playground link with the provided code.
After completing the code, ask the user if they want a playground link. Only call this tool after user confirmation and NEVER if code was written to files in their project.

## Svelte subagent

When creating, editing, or reviewing `.svelte` files or `.svelte.ts`/`.svelte.js` modules, delegate to the `svelte-file-editor` subagent (provided by the `svelte` plugin). It runs in a separate context window, fetches the relevant docs, and validates with `svelte-autofixer` before returning — saving context in the main agent.
