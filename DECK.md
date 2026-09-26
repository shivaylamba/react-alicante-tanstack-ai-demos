# Presentation design and scope

A separate 23-slide edition now lives at `/lightning.html#welcome`. It preserves the title and core demo interfaces, places WebMCP immediately after Jev, combines the remaining capabilities on one slide, and ends with the workshop QR. The 41-slide edition below remains intact at `/#welcome`. Short speaker notes budget 640 seconds plus 20 seconds of buffer; actual live latency and delivery still require rehearsal.

The opening is the original React Alicante title JPEG supplied by Shivay. The deck then introduces TanStack AI and the request architecture before introducing Vamos Alicante. The earlier Ship Happens brand and visible timing controls have been removed.

There are 41 slides: the original 31-slide demo sequence plus ten RC capability slides. The RC map, provider typing and transports extend the introduction; media, RAG, memory, MCP, persistence/durability, telemetry and harness examples follow the demo recap. These additions are documentation-based teaching examples, with explicit setup requirements, not new live services. Each code walkthrough has three individually explained, syntax-highlighted blocks. Expanded source panels show the full implementation shipped in the same build; compact teaching excerpts omit surrounding infrastructure explicitly.

The eight demonstrations are streaming, structured output, tools/agent loops, human approval, Jev typed decisions, native WebMCP page tools, portable agent skills, and Code Mode. Live and rehearsal modes are always distinguished. Provider-specific choices are described as this application's configuration.

## Scope boundaries

- Page content, inventory and meeting data are fictional.
- WebMCP tools alter only the local shop preview. Native registry discovery/execution is required. The demo uses an in-page agent; it does not claim an independent browser assistant was verified.
- Skills are reusable instructions loaded through `withSkills`, not permission enforcement or a hosted coding environment.
- Code Mode exposes a single read-only data tool in a bounded QuickJS isolate. It does not grant host filesystem or arbitrary network access.
- Jev classifies known textual descriptions. Code protects essential elements and supports restoration. Confidence thresholds are demo policy, not accuracy guarantees.
- Opening image is displayed unchanged, with contain scaling and accessible alternative text.
- Native Google Slides from the earlier version are a separate artifact and are not synchronized by edits to this local interactive deck.

Each of the seven demos is followed by a focused syntax-highlighted code slide with two explained blocks. The demo’s Explain the code button opens that local slide. Full source walkthroughs remain linked in the companion deck.

Three original visual meme slides punctuate the short deck. Each has a four-second speaker beat, and the capability summary is shorter to retain the planned 10:40 content budget. The full-deck chat offers shopper-question presets; choosing one only edits the prompt. UI punchlines appear after validated product data, a real quote, pending cart approval, or visible page changes. Laughs and live model jokes are not guaranteed; the speaker notes include delivery cues and a fallback line.

## Skillbox integration update

The short edition preserves the original demo order and ends with Skillbox and its code slide. Seven demos, 25 slides, 640 seconds of planned content remain. Both editions now use the shopper story; both editions include the standalone shopping-chat example. See README for native service startup and access boundaries.

The core narrative is now ask → compare → quote → approve cart → focus → filter → reusable playbooks. Product cards resolve IDs against the shared catalog; a shared React cart remains visible across demo slides. Skillbox supplies beach-shopper and returns-guide. The fictional default purchase intent is a €12 towel and €6 bottle, within €25. No checkout occurs.
