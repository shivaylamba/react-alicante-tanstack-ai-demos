> **Hosted edition:** six demos, 23 lightning slides, and matching speaker notes. Skillbox is excluded from both presentation routes and disabled on Vercel. The local Skillbox instructions below are an optional source-code appendix.

# Building AI-Powered React Apps with TanStack AI

A React presentation with two editions sharing the same demo implementations and server.

- **Lightning talk:** http://localhost:3100/lightning.html#welcome — 23 slides with a 9:45 content budget plus 75 seconds of buffer. Introduction → request path → Vamos Alicante → demo roadmap → streaming → product comparisons → tools and approval → Jev → WebMCP → compact code → other capabilities → workshop QR. The original streaming demo opens the demo sequence; WebMCP is the final live demo. Code Mode and the broader RC topics share one summary slide. Press N for the timed script, also in `LIGHTNING-RUN-OF-SHOW.md`.
- **Full deck:** http://localhost:3100/#welcome — 38 slides, seven demos and detailed code walkthroughs are preserved. See `RUN-OF-SHOW.md`.

Both pages keep timestamps out of the projected slides. The short edition links to full code in another tab for optional questions. Regenerate its rehearsal script with `npx tsx scripts/build-lightning-guide.ts`.

## Demo project: Vamos Alicante

A fictional beach-essentials shop for React Alicante attendees after the talks. Browse a towel (€12), water bottle (€6), conference sticker (€3), pocket fan (€8) and an unavailable parasol (€29). Prices and stock are demo fixtures, not real local offers. No bookings or purchases occur. Six short-deck demos connect the same shop to streaming, structured output, a budget-checked tool loop, approval, Jev cleanup and WebMCP page actions.

## Run

```sh
npm install
npm run build
npm start
```

Open **http://localhost:3100/#welcome**. The opening is the supplied React Alicante title image. There is no timer or talk-duration branding on the slides.

The server reads `.env.local` (ignored by Git). Configure `NEBIUS_API_KEY` and `AI_GATEWAY_API_KEY` server-side. The text provider is Nebius; typed decisions use `typesafe-ai/jev` through Vercel AI Gateway. Keys never belong in browser code. Optional `NEBIUS_MODEL` overrides the default `zai-org/GLM-5.3-Flash`.

## Presentation sequence

The slide picker contains 41 slides. Start with the title, TanStack AI introduction, request architecture and Vamos Alicante introduction. Each capability then follows **feature → demo → explained code**:

| Demo | Link | What changes |
| --- | --- | --- |
| Shopping chat | `#shopchat` | Product advice streams; Stop cancels |
| Structured output | `#product` | Catalog-backed product comparison cards |
| Tools and agents | `#agent` | Catalog lookup and code-calculated quote within €25 |
| Human approval | `#approval` | Towel + bottle enter the shared demo cart only after approval |
| Typed decisions | `#jev` | Jev classifies known elements; reversible clutter removal |
| WebMCP | `#webmcp` | Native page tools filter the shop and change its theme |
| Code Mode | `#codemode` | Model-written TypeScript calculates fictional meeting costs |

Recap slides connect the features. The final `#workshop` QR points to the four-hour attendee workshop with Shivay and Vikas.

## RC capability tour

The RC announcement is covered by ten added slides: a capability map, provider typing, transport choices, media, RAG, memory, remote MCP/type generation, persistence/durability, telemetry, and coding-agent harnesses. The first three extend the introduction; the rest follow the demo recap. Each topic links to current official docs and includes highlighted code, setup requirements and recitable notes. These are integration examples, not extra live services.

Use `#rc-overview` to start the tour. For a short talk, the overview links directly to Vamos Alicante; the later capability slides can jump to the workshop QR and remain available for questions. The count of 24 providers is attributed to the RC announcement, not presented as a current fixed limit.

## Controls

- Arrow keys / footer arrows: next or previous slide. Demo code slides advance through three explained blocks first; RC examples have one to three blocks.
- Slide counter: jump directly to any feature, demo or code slide.
- Home / End: opening image / workshop QR.
- N / Notes: a recitable explanation for the current slide. Escape closes panels.
- Explain the code: opens the corresponding walkthrough; the return link preserves completed demo state.
- Full running source is expandable below each focused code excerpt.
- Reset demo clears only the current demo. Leaving an active demo cancels it.
- Navigation itself never makes model requests. Theme and motion preferences persist locally.

## The three additional demos

**WebMCP:** Requires Chrome with native `document.modelContext` support. The page registers two TanStack client tools via `useRegisterWebMCPTools`. `usePageWebMCPTools` discovers them and the in-page agent executes them through WebMCP. The tools only change this preview. No polyfill silently impersonates native support; unsupported browsers show an explicit message. Browser-support verification is separate from ordinary client-tool tests. This demonstrates an in-page model using the native registry, not an independent external browser agent.

**Skills:** Portable `@tanstack/ai-skills` middleware supplies a catalog and `load_skill`. Ask for product advice, inspect the loaded beach-shopper instructions, then ask about returning an unused towel and inspect returns-guide. Instructions guide the model; they do not grant execution privileges or guarantee truthful output. This is not a hosted provider skill or a coding-agent harness.

**Code Mode:** The model writes a program using one read-only `external_team_costs` function. It runs in QuickJS with a 32 MB limit, a 3-second execution deadline and a per-run tool-read budget. The data is fictional. Generated code has no host process, filesystem or network globals. Code Mode orchestration is distinct from provisioning a full coding-agent workspace.

## Explicit rehearsal

```sh
DEMO_MODE=rehearsal PORT=3101 npm run dev
```

Open http://localhost:3101. Rehearsal uses fixed provider responses through the real TanStack pipeline. Skills still load real instructions and Code Mode still executes in the isolate, but the model selection/program is scripted. Native WebMCP still requires a supported browser. Editing a prompt in rehearsal does not create new model reasoning.

## Verification

```sh
npm run build
npm test
npm run test:e2e
# Existing five live demos:
TEST_LIVE=1 TEST_JEV=1 npm run test:e2e -- tests/browser/demos.spec.ts
# New live demos in installed Chrome with WebMCP enabled:
TEST_LIVE=1 TEST_NATIVE=1 npm run test:e2e -- tests/browser/advanced.spec.ts
```

Keep the live server running on 3100 for live checks. Tests run one browser worker. See `VERIFICATION.md` for the actual results and limitations. Screenshots live in `verification/`.

## Implementation

- `src/main.tsx`: presentation navigation, notes and slide layout.
- `src/lessons.ts`: feature explanations, teaching excerpts and step-by-step code narration.
- `src/source-files.ts`: full running implementation shown alongside excerpts.
- `src/demos.tsx`: original five demos.
- `src/advanced-demos.tsx`: WebMCP, skills and Code Mode interfaces.
- `server/app.ts`: chat/decision routes and provider orchestration.
- `server/advanced.ts`: portable skills and isolated Code Mode tools.
- `src/contracts.ts`: shared schemas and trusted demo rules.

## References

- [TanStack AI](https://tanstack.com/ai/latest/docs/getting-started/overview)
- [WebMCP tools](https://tanstack.com/ai/latest/docs/tools/webmcp)
- [Page WebMCP tools](https://tanstack.com/ai/latest/docs/tools/webmcp-page-tools)
- [Portable agent skills](https://tanstack.com/ai/latest/docs/skills/agent-skills)
- [Code Mode](https://tanstack.com/ai/latest/docs/code-mode/code-mode)
- [Kitze’s Unclutter](https://github.com/kitze/unclutter), inspiration for the Jev cleanup demo.
- [Rudraksh Karpe’s OpenVoice presentation](https://rudrakshkarpe.com/presentations/openvoice), interaction reference.

Each of the six demos is followed by a focused syntax-highlighted code slide with two explained blocks. The demo’s Explain the code button opens that local slide. Full source walkthroughs remain linked in the companion deck.

Three original visual meme slides punctuate the short deck. Each has a four-second speaker beat, and the capability summary is shorter to retain the planned 10:40 content budget. The shopping assistant offers product and budget presets; switching one edits the prompt without making a model request. UI punchlines appear after validated product data, a real quote, pending approval, or visible page changes. Laughs and live model jokes are not guaranteed; the speaker notes include delivery cues and a fallback line.

## Skillbox by Kitze — local integration

[Skillbox](https://github.com/kitze/skillbox) is a separate MIT-licensed project. It stores versioned agent skills and supports scoped clients, MCP and optional Jev recommendations. Our integration uses its **HTTP API through a custom TanStack `SkillSource`**. It does not use Skillbox’s MCP endpoint or Jev recommender, and never executes uploaded scripts.

Prerequisites: Bun, Git, and native PostgreSQL 16+. On this Mac PostgreSQL is installed at `/opt/homebrew/opt/postgresql@16/bin`; set `PG_BIN` elsewhere. No Docker or login service is required.

```sh
npm run skillbox:start
# Restart the talk server if it was already running:
npm start
# After the talk, stop the extra services:
npm run skillbox:stop
```

The setup pins upstream commit `cda64ad3310abe690c6d497352791da4cfeb9a0a`, clones it under ignored `.skillbox/upstream`, builds its UI once, and starts Bun with `--smol`. A separate authenticated PostgreSQL cluster listens on loopback port 5471 with 16 MB shared buffers and 16 connections. Skillbox listens on 127.0.0.1:4791. Services persist until stopped; they do not start at login.

Setup imports `skills/beach-shopper/SKILL.md` and `skills/returns-guide/SKILL.md` once, then creates a read-only client limited to those skills. It preserves later edits. Server-only `SKILLBOX_URL` and `SKILLBOX_CLIENT_KEY` are written to protected `.env.local`. Owner credentials live in ignored `.skillbox/credentials.json`; open it privately if you want to sign into the Skillbox editor. Do not project it. Never put either key in a slide or browser configuration.

Optional integration source: `src/advanced-demos.tsx` and `server/skillbox.ts`. The Skillbox slide is excluded from this edition. In a custom deck that enables it, open `#skills`, click **Ask the shop assistant**. Inspect `beach-shopper`, its revision receipt and the €18 towel-and-bottle recommendation. Then select **Can I return it?** and submit again: inspect `returns-guide` and the fictional store policy. The same model loads different guidance. **Explain the code** shows highlighted integration excerpts. Press **N** for the Kitze shoutout and recitable script.

Live mode fails visibly if Skillbox is unavailable. Rehearsal explicitly uses inline fixtures; that does not verify Skillbox. The client has no skill-write, archive or proposal permissions. A run pins its catalog revisions before loading a body, so an owner edit cannot silently change the version midway through that run. A later run sees the new revision.

The short edition still budgets 9:45 content plus 75 seconds buffer. Run both shopper questions only if the first finishes promptly. Provider latency makes a timed rehearsal essential.

## The shopper story

“The React Alicante talks are over. I have €25. Help me choose what to bring to the beach.” Every core demo now takes the customer’s perspective:

1. **Ask** — TanStack streams product advice from the catalog context.
2. **Compare** — structured IDs and reasons become product cards; displayed prices and stock come from the catalog.
3. **Check** — tools read inventory and calculate the default towel + bottle quote: €18, €7 remaining.
4. **Approve** — the `add_to_cart` proposal lists exact items. Denial leaves the cart unchanged. Approval updates shared React state.
5. **Focus** — Jev hides distracting promotions while protecting useful product content.
6. **Filter** — native WebMCP changes the visible catalog. It does not add items or bypass approval.
Skillbox is excluded from the presentation and hosted deployment. The optional local integration source remains available for exploration.

The catalog is fictional. The demo cart supports one of each product with a €25 total limit. It survives slide navigation, offers explicit remove/empty controls, and resets on refresh. It never places an order, charges money or reserves stock. A production backend would revalidate stock/prices and authorize mutations. Reset demo clears that conversation; use **Empty demo cart** to clear the shared cart.

The earlier roast, landing-page generator, launch-copy skill and confetti approval have been replaced with this shopper journey in both editions. Code Mode remains an optional full-deck operational appendix.

## GitHub and Vercel

- [Lightning talk and live demos](https://react-alicante-tanstack-ai-demos.vercel.app/lightning.html#welcome)
- [Full companion deck](https://react-alicante-tanstack-ai-demos.vercel.app/#welcome)
- [Phone-friendly speaker notes](https://react-alicante-tanstack-ai-demos.vercel.app/speaker-notes/)


This repository contains both slide editions, the live demo server, skills, tests and the speaker guide. The hosted reading guide is also available at `/speaker-notes/`.

Vercel builds the React app with Vite and routes `/api/*` to the Hono Node function in `api/index.ts`. Configure `NEBIUS_API_KEY`, `AI_GATEWAY_API_KEY`, `NEBIUS_MODEL`, `DEMO_MODE=live` as server environment variables. Never use a `VITE_` prefix for secrets. Skillbox is excluded; no additional database is required. Native WebMCP still requires a supporting browser with the feature enabled.

Local use remains `npm ci`, configure `.env.local`, then `npm run dev`. Run `npm run skillbox:start` for the separate local Skillbox service. The Vercel deployment does not start Bun or PostgreSQL on your computer.
