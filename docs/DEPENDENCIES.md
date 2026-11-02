# Dependency review — November 2, 2026

## Evidence

The installed tree and lockfile were re-inspected on November 2: Astro 6.4.8, Sharp 0.34.5 and esbuild 0.27.7 are unchanged. The historical npm summary counted three vulnerable package entries and ten advisory IDs in recovered records (`review/dependency-advisories-cache.json`). These are historical counts, not a fresh comprehensive audit. Unaffected cached entries and inherited duplicates are marked separately.

Fresh `npm audit --json --fetch-retries=0 --fetch-timeout=12000` and `npm outdated --json --fetch-retries=0 --fetch-timeout=12000` requests failed; outdated reported EACCES fetching the registry. A range-preserving `npm update astro --package-lock-only --ignore-scripts --audit=false --fetch-retries=0 --fetch-timeout=12000 --cache .cache/npm` also failed with EACCES fetching registry.npmjs.org/astro. The workspace cache avoided machine-cache write errors but did not change the network restriction. No package upgrade was installed, no registry setting or enforcement was bypassed, and no clean/current comprehensive audit is claimed.

## Three affected package entries

| Package | Installed | Highest severity | Relationship | Public site / handler / tools |
|---|---:|---|---|---|
| astro | **6.4.8** | **Critical** | Direct, root range ^6.0.0 | Static build/compiler and image service. No Astro request-time runtime in public pages or the separate inquiry handler. |
| sharp | **0.34.5** | **High** | Transitive optional: astro → sharp, ^0.34.0 | Native build-time image processing. Only WebP assets deploy; no image endpoint/uploads. Not imported by the handler. |
| esbuild | **0.27.7** | **Low** | Transitive: astro → esbuild (^0.27.3), and astro → vite@7.3.7 → esbuild (^0.27.0 or ^0.28.0) | Compilation and local Function-bundle check. No esbuild server/compiler in public output or handler runtime. |

Exposure judgments below are implementation-specific inferences from source/imports/static output, not changes to upstream severity or claims that vulnerable versions are fixed.

## Individual advisories

| Package / advisory | Severity | First patched version | Relevance and mitigation in this application |
|---|---|---:|---|
| Astro — [GHSA-26w7-cxv4-gfx2](https://github.com/advisories/GHSA-26w7-cxv4-gfx2): AVIF optimization RCE | Critical | 7.2.8 | Build image path. Only reviewed local PNG input; new native decoder allowlist blocks HEIF/AVIF. No deployed optimizer. |
| Astro — [GHSA-4g3v-8h47-v7g6](https://github.com/advisories/GHSA-4g3v-8h47-v7g6): View Transition animation injection | Moderate | 7.1.0 | No View Transitions or request-controlled animation values. |
| Astro — [GHSA-376h-93r7-7g6f](https://github.com/advisories/GHSA-376h-93r7-7g6f): configured-base authorization bypass | Moderate | 7.2.4 | No non-root base, Astro authorization middleware, or deployed Astro server. |
| Astro — [GHSA-7pw4-f3q4-r2p2](https://github.com/advisories/GHSA-7pw4-f3q4-r2p2): hydrated-island transition injection | Low | 7.0.4 | No hydrated framework islands or transition directives. |
| Astro — [GHSA-98hj-9722-w3j8](https://github.com/advisories/GHSA-98hj-9722-w3j8): JSX/MDX script/style injection | Moderate | 7.3.2 | No JSX/MDX renderer or untrusted content pipeline. Structured data escapes less-than characters. |
| Astro — [GHSA-f48w-9m4c-m7f5](https://github.com/advisories/GHSA-f48w-9m4c-m7f5): HTMLElement spread attribute injection | Moderate | 7.0.6 | No native-HTMLElement subclass components or untrusted spread-property keys. |
| Sharp — [GHSA-rgj7-g3m4-5g8c](https://github.com/advisories/GHSA-rgj7-g3m4-5g8c): inherited libheif vulnerabilities | High | 0.35.4 | Build tooling; relevant especially to a future Linux build host. HEIF/AVIF decoding is blocked using the upstream-supported operation restriction. |
| Sharp — [GHSA-f88m-g3jw-g9cj](https://github.com/advisories/GHSA-f88m-g3jw-g9cj): inherited libvips vulnerabilities | High | 0.35.0 | GIF, TIFF, and VIPS decoders are blocked. |
| Sharp — [GHSA-wq5f-xc86-pv6w](https://github.com/advisories/GHSA-wq5f-xc86-pv6w): inherited librsvg vulnerability | High | 0.35.5 | SVG decoding is blocked. Native logo SVGs are served directly and never processed by the website image pipeline. |
| esbuild — [GHSA-g7r4-m6w7-qqqr](https://github.com/advisories/GHSA-g7r4-m6w7-qqqr): Windows development-server traversal | Low | 0.28.1 | Affected path is esbuild's Windows file server. Repository uses build/transform APIs and Vite's separate HTTP server; no esbuild serve() API. Local preview binds to loopback. |

Astro also inherits Sharp/esbuild findings; those are not additional unique advisories. Already-patched cached records for esbuild <=0.24.2, argparse 1.x, and a nonaffected Vite metavulnerability are not reported as current findings.

## Compatible mitigation applied and tested

`src/lib/image-policy.ts` blocks the native VipsForeignLoad family and enables only PNG buffer/file loading, using Sharp's supported block/unblock API. `src/lib/safe-image-service.ts` applies the policy inside each Astro image worker and checks the PNG signature before transformation, including renamed files. All 13 responsive images were regenerated with this service. Focused tests verify PNG→WebP output, pre-decoder input rejection, and native SVG rejection.

This extends the existing static-output/PNG-only source guard. It is a **mitigation, not an installed upstream fix**. Rendering advisories are avoided by the actual feature/input choices above. The esbuild serve path is not used. Installed versions remain unchanged.

## Current primary-source recheck

The maintainer advisory listings for [Astro](https://github.com/withastro/astro/security/advisories), [Sharp](https://github.com/lovell/sharp/security/advisories), and [esbuild](https://github.com/evanw/esbuild/security/advisories) were consulted again on November 2. The historical table above remains useful evidence, not a claim that it exhausts current npm audit findings. Additional current entries were assessed against this installed application:

| Advisory | Primary-source scope | Application assessment |
|---|---|---|
| [GHSA-mpr7-6m5w-76rw](https://github.com/withastro/astro/security/advisories/GHSA-mpr7-6m5w-76rw), View Transition CSS injection | Astro >=7.1.0 through 7.3.2; patched 7.3.3 | Installed 6.4.8 is outside this range. The earlier transition advisory in the historical table still applies by version; the site has no View Transitions. |
| [GHSA-m8p5-r7qv-cx4c](https://github.com/withastro/astro/security/advisories/GHSA-m8p5-r7qv-cx4c), Host/image SSRF | @astrojs/node <=11.1.6; patched 11.1.7 | Node adapter is not installed; static pages and the separate Web API Function do not use it. |
| [GHSA-gv7w-rqvm-qjhr](https://github.com/evanw/esbuild/security/advisories/GHSA-gv7w-rqvm-qjhr), binary integrity | esbuild Deno module; patched >=0.28.1 | This project uses npm/Node, not Deno. It does not remove the unresolved Windows serve advisory listed above. |

The October 28 Astro listing also contains Svelte, Solid and Prism integration advisories; those packages are not installed here. These implementation assessments are inferences from the current manifest, lockfile and source, not upstream fixes. A working registry audit is still required.

## Remaining remediation

No fix for all identified records exists in the installed Astro ^6, Sharp ^0.34, or Astro-owned esbuild ^0.27 ranges. No blind major upgrade, forced pre-1.0 minor override, or audit fix --force was performed.

1. Review the [Astro 6→7 migration guide](https://docs.astro.build/en/guides/upgrade-to/v7/) against this static project: Vite 8, compiler/whitespace changes around inline text and headings, and the custom image-service API. No database, adapter, Markdown, or experimental features are used.
2. The previous review identified **Astro 7.4.4** as a candidate; it is not installed/tested here and is not asserted to be the current latest release. Its [official manifest](https://raw.githubusercontent.com/withastro/astro/astro@7.4.4/packages/astro/package.json) requires Node **>=22.23.4**, Vite **^8.3.5**, and optional Sharp **^0.35.4**. Require the resolved Sharp to be **>=0.35.5**; 0.35.4 does not cover the librsvg record.
3. With registry access, use a review branch and a specific candidate (`npm install --save-exact astro@7.4.4`), inspect the package/lockfile diff, and ensure every remaining esbuild instance is **>=0.28.1**. The Function-bundle script currently uses hoisted esbuild; if the new tree removes it, declare a reviewed patched version as an explicit dev tool. Do not keep an old vulnerable nested copy.
4. Run a fresh audit, type checks, all tests, Function bundle check, production/QA builds, and desktop/mobile browser review before accepting the migration. Commit verified manifest/lockfile changes together.

**Unresolved packages: astro@6.4.8, sharp@0.34.5, esbuild@0.27.7.** Package remediation and a fresh audit remain launch blockers.
