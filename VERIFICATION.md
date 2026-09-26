# Verification — revised interactive presentation, 26 September 2026

## Vamos Alicante theme — latest revision

Both decks now use Vamos Alicante, a fictional beach-essentials shop for React Alicante attendees after the talks. Catalog IDs, names, icons, structured-output mascots, model prompts, fixture output, skills, WebMCP tool names, highlighted code, memes and generated speaker guides were updated together. The old DuckOps references remain only in historical verification sections below. No real local inventory, weather, bookings or purchases are claimed.

The catalog contains a €12 towel, €6 water bottle, €3 sticker, €8 fan and out-of-stock €29 parasol. The trusted €25 cap remains unchanged. Tool names are search_beach_catalog, quote_beach_kit, alicante_filter_catalog and alicante_set_theme. Structured mascots are sun, umbrella and coffee. The project slide is #alicante; opening image, 23-slide short sequence, six highlighted code slides, 41-slide full deck and workshop QR are retained.

Verification after the change: production build passed; five unit/integration tests passed; all 20 single-worker fixture/browser scenarios passed, including responsive layouts, native WebMCP, both deck sequences, approvals and budget validation. The production server was restarted. All eight live provider/browser scenarios passed: streaming, structured product page, quoted kit, approval/denial, Jev cleanup, native Chrome WebMCP discovery/execution, portable skill loading and Code Mode. The live product output and local introduction were visually reviewed. Tests verify the default prompts and application behavior; they do not establish every edited prompt or audience reaction.


## Humor pass — latest revision

The short deck now has 23 slides: three original text-and-emoji meme beats were inserted after the streaming, agent and approval code slides. Their planned four-second beats are offset by shortening the final capability overview; the script still totals 640 seconds plus a 20-second buffer. These are rehearsal allocations, not a guarantee of delivery time or audience reaction.

The demo prompts now use specific fictional startup absurdities. Three roast presets edit input without submitting. Product, quote, approval and page-change punchlines are tied to their actual UI states; no jokes impersonate a tool result. Speaker notes and the generated guide include exact delivery cues, optional audience voting and a weak-roast fallback. No new dependency or continuous animation was added.

Verification: production build passed; 12 single-worker fixture/browser checks passed, including all 23 slides, six code slides, native WebMCP execution, original 41-slide navigation, six demo flows, preset non-submission and layouts at 320/768/1440px. Three live provider browser checks passed for the changed default roast, structured-product and launch-kit prompts. Live product screenshot visually reviewed. The two alternative roast presets were checked for editing without submission, but were not separately live-inferred. Native WebMCP and Jev humor-state checks used fixtures this pass. Audience laughter and real stage pacing cannot be verified by automated tests.


## Per-demo code slides — latest revision

The short deck now has 20 slides, including six dedicated code slides placed directly after their demos. Each displays two syntax-highlighted excerpts, block explanations, a takeaway and a source link. The existing introduction, six demos and capability summary remain. Presenter scripts retain a 640-second content budget with 20 seconds of buffer; this requires a brisk rehearsed delivery.

TypeScript/Vite build passed. Six browser checks passed: all 20 slides and speaker notes, two highlighted blocks per code slide, original 41-slide navigation, native WebMCP fixture execution and code navigation, plus layouts at 320, 768 and 1440px. The structured-output code slide was visually inspected in the in-app browser. Provider integrations were unchanged; no new live inference claims are made.

## Intro sequence revision — 26 September 2026

The short deck now has separate title, TanStack introduction, request architecture, DuckOps premise and six-demo roadmap slides before the demos. Presenter notes allocate 2:15 to that opening and retain the 10:40 total content budget. The six demo screens and Jev → WebMCP order remain intact. One summary slide holds the other capabilities.

Production build passed. Six single-worker browser checks passed: complete original 41-slide navigation, new 14-slide sequence/notes, native WebMCP fixture execution and layouts at 320, 768 and 1440px. The new roadmap was visually reviewed in the in-app browser and the updated page opened there. No new paid model tests were needed for these content changes. The generic vanilla explainer validator cannot validate this existing React app because its expected starter files are absent; the app-specific build and browser suite were used instead.

## Separate lightning edition — earlier checks, 26 September 2026

`/lightning.html#welcome` now contains 14 slides. The original 41-slide route remains at `/#welcome`. Both use the existing server and demo components. WebMCP follows Jev immediately; the other capabilities occupy one summary slide. The short script is generated from `src/lightning.ts` into `LIGHTNING-RUN-OF-SHOW.md` and appears in the Notes panel.

- Production TypeScript/Vite build passed, generating both HTML entries.
- Nine single-worker browser scenarios passed with `TEST_SHORT=1 TEST_NATIVE=1`: streaming/cancellation, structured React output, tool quotes, approval/denial, reversible Jev cleanup, all 11 slides and notes, native WebMCP execution/unregistration, and layouts at 390px and 1440px.
- A separate navigation regression passed across all 41 original slides, notes and code steps, with zero model requests caused by navigation.
- Native Chrome visual review checked the new code summary and capability overview. The short page was opened in a separate tab.

These new demo checks use fixture model responses through the real TanStack pipeline; the native WebMCP test exercises browser tool discovery and execution. No new paid inference verification or spoken rehearsal was performed for this presentation-only change. The 640-second content budget plus 20-second buffer is a pacing plan; live model latency and presenter delivery still require rehearsal. Only the existing production server remains running.

## Current scope

The local React presentation at http://localhost:3100/#welcome has 31 slides and eight embedded demos. It opens with the supplied React Alicante JPEG, unchanged. Each capability follows feature → demo → three explained, syntax-highlighted code blocks. Full running source is expandable. Ship Happens branding, talk-duration labels and the presentation timer are removed.

The Google Slides artifact from the earlier version is separate; these changes apply to this local interactive presentation.

## Passed on this revision

- TypeScript checking and Vite production build.
- Five contract tests: trusted catalog price/stock/budget, structured UI choices, protected/uncertain Jev decisions, malformed/cross-origin requests, and actual QuickJS Code Mode execution without host process/require/fetch globals.
- All 14 browser scenarios passed in rehearsal across the full suite and focused reruns. The initial navigation test was corrected to open notes via N on the image-only title and wait for the new slide to render before sending the shortcut.
- Six presentation checks cover all 31 slides, all 24 code explanation blocks, nonempty speaker notes, zero model calls on navigation, state preserved between demo and code, theme/motion persistence, and layouts at 320, 768 and 1440 pixels.
- The original five live browser workflows passed against the final production build: streamed text/Stop, validated React product output, multi-step catalog and quote tools, deny/approve client execution, and real Jev reversible cleanup through Vercel AI Gateway. Latest workflow times were approximately 2.8, 4.3, 4.1, 6.2 and 2.6 seconds, respectively; these are samples, not guarantees.
- The three new demos passed with real Nebius inference: portable skills selected and loaded incident-comms instructions; Code Mode generated and executed a program producing €11,870/week and leadership as the highest cost; native Chrome WebMCP discovered and invoked both page tools, displayed three in-stock products under €10, changed the theme to lavender, and unregistered tools on navigation.
- Native Chrome visual review of the exact title artwork, introduction and syntax-highlighted code walkthrough.

## WebMCP detail

This tests an in-page model using Chrome's native document.modelContext registry. It does not prove autonomous discovery by a separate external browser assistant.

Chrome's current native descriptor exposes inputSchema as a JSON string and executeTool takes that descriptor plus JSON arguments. A narrow compatibility adapter normalizes this to TanStack's tool shape; it does not replace or emulate the native registry. Earlier testing caught empty arguments before this adapter was added. Passing assertions inspect actual page state and execution records, not merely the model's claims.

Unsupported browsers show an explicit native-support message. The native test uses installed Chrome with WebMCP enabled and one worker.

## Isolation and test boundaries

Code Mode uses real QuickJS, a 32 MB memory limit, a 3-second execution deadline and bounded read-only tool calls over fictional team data. Skills guide output but do not grant permissions or guarantee factual accuracy. Provider results remain nondeterministic; the default demo tasks are verified, not every possible edited prompt.

Rehearsal responses are explicitly scripted. They test the real application pipeline and isolate, but do not prove live model reasoning. No public deployment or GitHub push is part of this revision.

## Evidence and reproduction

Screenshots from the eight live demos are in verification/expanded/live/. Tests are under tests/. The speaker guide is generated from the same lesson content as the presentation in RUN-OF-SHOW.md.

```sh
npm run build
npm test
TEST_NATIVE=1 npm run test:e2e
# With the live production server running on port 3100:
TEST_LIVE=1 TEST_JEV=1 npm run test:e2e -- tests/browser/demos.spec.ts
TEST_LIVE=1 TEST_NATIVE=1 npm run test:e2e -- tests/browser/advanced.spec.ts
```

Tests run one browser worker. Only the live presentation server is left running after verification.


## RC announcement additions — 26 September 2026

Ten capability slides expand the local deck from 31 to 41. Existing demos and backend behavior are unchanged. Current official docs were checked for API names, configuration and limitations; the provider count is tied to the RC announcement. New examples are not advertised as live-tested integrations. No additional provider credentials, MCP services, media routes, persistence backend or sandbox were provisioned.

TypeScript/application build passed. The six presentation scenarios cover all 41 slides at desktop and mobile widths, notes, code steps, navigation without model requests and existing demo-state preservation. The slide-index assertion was made exact to avoid mistaking the total count for the current index at the final slide. Native Chrome visual review covers the RC map and expanded code slides. Previous live-demo results above refer to the prior demo verification; no paid live runs were needed for this content-only revision.

## 2026-09-26 — real Skillbox integration

- Installed native PostgreSQL 16 and started an isolated loopback database on 5471; upstream Skillbox pinned to cda64ad3310abe690c6d497352791da4cfeb9a0a runs under Bun --smol on 4791. No Docker or login service. Setup is repeatable and does not overwrite skills.
- Imported two Markdown playbooks. Created a client with read access only to alicante-brand and incident-comms. Real service checks: exact two-item catalog, owner-only write returns 403, invalid key returns 401.
- Real Nebius browser test loaded alicante-brand and its pinned revision, generated the signature line, then loaded incident-comms and generated the factual headings. Actual Skillbox HTTP requests are used through a custom SkillSource; this is not a mock Skillbox, MCP integration or Skillbox Jev recommender test.
- Six unit/integration tests passed, including pinned revision and fail-closed service behavior. Nine browser regression checks passed with one Chrome worker, including short-deck pacing/order, syntax highlighting, mobile widths, fixture skills, Code Mode and native WebMCP. Native WebMCP in that regression used the provider fixture.
- Stopping Skillbox returned HTTP 503 from the presentation status endpoint. Restart restored the same saved library and client. No inline fallback in live mode.
- Final production build passed. Both guides regenerated. Short deck remains 23 slides / six demos / 640 planned seconds plus 20 seconds buffer. Full deck retains 41 slides including the original roast.
- Screenshots inspected; latest-task-only rendering keeps the incident response visible instead of pushing it below the previous launch response. Browser test files: tests/browser/skillbox.spec.ts and tests/browser/lightning.spec.ts.

## 2026-09-26 — coherent storefront journey

Both decks now follow one shopper with a €25 budget: Skillbox product/return advice, structured comparisons grounded in catalog IDs, tool-based quotes, an approved shared React cart, Jev decluttering and WebMCP filtering. The short edition remains 23 slides with six demos; the full edition retains 41 slides. Speaker notes and syntax-highlighted code steps were rewritten to match. Cart state survives slide navigation, resets on refresh and never performs checkout or payment.

- Six unit/integration tests passed, including comparison schema rejection and Skillbox revision pinning.
- Fixture browser suite: 19 passed, one live-only test skipped and one stale chat-label selector failed. The corrected selector passed its targeted rerun: all 20 applicable checks verified across those runs.
- Live browser suite: eight of nine passed initially, including real Nebius streaming, comparisons, catalog/quote tools, cart denial/approval, real Skillbox product and return playbooks, QuickJS Code Mode and native Chrome WebMCP.
- The remaining Jev test incorrectly demanded that a specific cookie banner disappear. Actual results hid five interruptions while retaining a lower-confidence banner. Updated the test to verify every DOM decision against the protection/threshold policy and restoration, while still requiring real clutter removal. Its live Gateway/Jev rerun passed. Nine live checks verified across the initial run and targeted rerun.
- Native WebMCP used an in-page model with Chrome's real document.modelContext tools and inspected resulting filter state. Separate external-agent discovery remains outside this evidence.
- The real Skillbox client profile now grants read access only to beach-shopper and returns-guide; old owner-library skills remain outside the demo profile. Live advice and return answers loaded their respective pinned revisions.
- Cart screenshots show one €12 towel and one €6 bottle, total €18, only after explicit approval. Comparison cards use catalog prices and stock. Screenshots reviewed at presentation size; responsive/navigation checks were included in the fixture suite.

Verification used one browser worker and a 768 MB Node heap cap. Existing native Skillbox/Postgres and one presentation server remain available locally. No GitHub push or public deployment was performed.
