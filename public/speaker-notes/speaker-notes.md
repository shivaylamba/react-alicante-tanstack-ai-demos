# Lightning talk — presenter script

Open http://localhost:3100/lightning.html#welcome. The full deck remains at http://localhost:3100/#welcome. Press N for the same script on each slide; Escape closes it. Timings are presenter-only.

The plan allocates 10:40 to content and 0:20 to buffer. This is a rehearsal budget, not a guarantee of live provider latency. Run each demo once. If a request takes more than ten seconds, explain its contract while waiting. At the segment deadline, stop and advance; never claim an unfinished action succeeded. Keep the deeper code walkthroughs and extra demos for questions.

| Window | Slide |
| --- | --- |
| 0:00–0:15 | Building AI-Powered React Apps |
| 0:15–0:45 | What is TanStack AI? |
| 0:45–1:10 | How React connects to AI |
| 1:10–1:35 | Today we are building Vamos Alicante |
| 1:35–1:51 | Seven demos. One beach shop. |
| 1:51–2:26 | Streaming shopping assistant |
| 2:26–2:46 | Streaming · code |
| 2:46–2:50 | The conference-to-beach transition |
| 2:50–3:35 | Structured output |
| 3:35–3:55 | Product · code |
| 3:55–4:40 | Tools & agents |
| 4:40–5:00 | Agent · code |
| 5:00–5:08 | A developer goes shopping |
| 5:08–5:43 | Human approval |
| 5:43–6:03 | Approval · code |
| 6:03–6:07 | Let me read the website |
| 6:07–7:02 | Jev cleanup |
| 7:02–7:22 | Jev · code |
| 7:22–8:22 | WebMCP page actions |
| 8:22–8:42 | Webmcp · code |
| 8:42–9:17 | Agent skills + Skillbox |
| 9:17–9:37 | Skillbox · code |
| 9:37–9:52 | The pattern behind the storefront |
| 9:52–10:15 | And there is more |
| 10:15–10:40 | Build it with Shivay & Vikas |

## 1. Building AI-Powered React Apps

0:00–0:15 · 15 seconds

http://localhost:3100/lightning.html#welcome

> Hello React Alicante! I’m Shivay. Let’s see how TanStack AI turns a React application into something that can generate, decide and act.

**Stage action:** Advance immediately. This is the title, not a separate introduction.

## 2. What is TanStack AI?

0:15–0:45 · 30 seconds

http://localhost:3100/lightning.html#toolkit

> TanStack AI is an open-source TypeScript toolkit for adding AI features to applications. It is not the model itself. It coordinates model requests, streamed responses and tool calls, then gives React useful state to render. We choose the model provider, define the tools and keep our own components. Today we use Nebius for text and Jev through Vercel AI Gateway for typed decisions. Let’s see where those pieces live.

**Stage action:** Point to model connection, capabilities and interface. Advance to the request path; do not introduce Vamos Alicante yet.

## 3. How React connects to AI

0:45–1:10 · 25 seconds

http://localhost:3100/lightning.html#how-it-works

> The React app sends a request to our server. The server validates it and talks to a model through an adapter. Our credentials stay there. As a chat response arrives, useChat updates the interface. AG-UI describes the chat events, and SSE transports them. The decision endpoint returns JSON. So the model supplies output, while our application controls data, actions and rendering. Let’s make that concrete with something we can actually see.

**Stage action:** Trace React → server → provider, then the returning result. Move on without a code detour.

## 4. Today we are building Vamos Alicante

1:10–1:35 · 25 seconds

http://localhost:3100/lightning.html#alicante

> Imagine you are leaving React Alicante for the beach. You open Vamos Alicante with twenty-five euros and need a towel and something to carry water. That is our entire story. You are the shopper. We will ask questions, compare actual products, check stock and price, and add the chosen items only after approval. This is a fictional catalog and local demo cart; no money changes hands.

**Stage action:** Point at the catalog: towel €12, bottle €6, and the out-of-stock parasol. Establish the shopper’s €25 goal.

## 5. Seven demos. One beach shop.

1:35–1:51 · 16 seconds

http://localhost:3100/lightning.html#demo-roadmap

> We will stream an answer, compare products, check a bundle with tools, approve the cart addition, remove distractions with Jev, and filter the page with WebMCP. Then we finish with Skillbox: reusable instructions for this same shop assistant. The catalog and cart stay consistent throughout.

**Stage action:** Follow the roadmap in order. Start with the plain streaming assistant; save Skillbox for the final demo.

## 6. Streaming shopping assistant

1:51–2:26 · 35 seconds

http://localhost:3100/lightning.html#shopchat

> I’m the shopper, and I need a towel and something to carry water. Watch the answer appear as it is generated. React receives streamed events through useChat, so I can read before the answer is complete or press Stop. This first demo has catalog context but no tools and no Skillbox. It answers a question; it cannot change my cart. Next let’s turn advice into comparison cards.

**Stage action:** Click Ask the assistant with the beach-essentials preset. Point to the streamed text and Stop control, then open the streaming code slide.

## 7. Streaming · code

2:26–2:46 · 20 seconds

http://localhost:3100/lightning.html#shopchat-code

> On the left, chat starts generation and the route returns streamed events. On the right, useChat connects React to that route. The submit handler sends a message; the separate Stop handler cancels it. That is the streaming interface we just saw.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Start a generation

Source: server/app.ts

```tsx
const stream = chat({
  adapter: model,
  messages: params.messages,
  systemPrompts: [prompts.shopchat],
  abortController: controller,
});

return toServerSentEventsResponse(guarded(), {
  abortController: controller,
});
```

chat starts generation; the SSE response carries events back.

### Connect React

Source: src/demos.tsx

```tsx
const { messages, sendMessage, isLoading, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat/shopchat'),
});

// Event handlers in our interface:
await sendMessage(input);
stop();
```

useChat exposes React state. Send and Stop are separate UI handlers.

## 8. The conference-to-beach transition

2:46–2:50 · 4 seconds

http://localhost:3100/lightning.html#meme-founder

> One more hook. Then the beach. Let’s choose our products.

**Stage action:** Let the room read the visual. Deliver just the punchline, pause briefly, then advance. If the previous joke already got a laugh, skip this beat. Do not explain the joke.

**Why this is funny (preparation only, do not read aloud):** React developers use hooks such as useState. The invented name useBeach sounds like another hook, but means your tired brain wants to leave the conference and relax at the beach. You are joking about yourself and the audience wanting a break.

**Joke delivery:** Say “One more hook. Then the beach.” with a straight face. Let the useBeach text on the slide supply the React reference. Pause briefly and advance; do not explain hooks on stage.

## 9. Structured output

2:50–3:35 · 45 seconds

http://localhost:3100/lightning.html#product

> I need to choose, so let’s compare products. Instead of a paragraph, we request IDs and reasons in a schema. React joins those IDs to our catalog and renders cards. The towel’s twelve euros and the bottle’s six euros come from application data, not generated text. This is structured output: a shape our components can render. It is still a shortlist, not a cart action.

**Stage action:** Click Compare products. Point to the reasons, catalog prices and stock. Show its code slide next. When the cards appear, point out that prices come from the catalog.

**Why this is funny (preparation only, do not read aloud):** “No imaginary discount” gently jokes about models inventing convincing facts. The useful point is that displayed prices come from your catalog, so the model cannot make up a sale. This is a light aside, not a big punchline.

**Joke delivery:** Only say the line once the comparison cards appear. Point at a price, then continue explaining structured output. Skip it if you are behind schedule.

## 10. Product · code

3:35–3:55 · 20 seconds

http://localhost:3100/lightning.html#product-code

> The schema defines product IDs and reasons. outputSchema asks for that shape. React validates it, then looks up the matching catalog records to display prices and stock. Recommendations do not mutate the cart.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Constrain the recommendation

Source: src/contracts.ts

```tsx
const comparisonSchema = z.object({
  heading: z.string().min(1).max(80),
  picks: z.array(z.object({
    productId: z.enum(['towel', 'water', 'sticker', 'fan']),
    reason: z.string().min(1).max(140),
  }).strict()).min(2).max(3),
}).strict(); // Full schema also rejects duplicate IDs.
```

Product IDs and short reasons define the recommendation contract.

### Request, validate, render

Source: server/app.ts → src/demos.tsx

```tsx
chat({ ...options, outputSchema: comparisonSchema, stream: true });

// React
const parsed = comparisonSchema.safeParse(structured.data);
// ProductPreview receives only validated data:
const product = inventory.find(p => p.id === pick.productId)!;
// React renders product.name, product.price, product.stock and pick.reason.
```

outputSchema requests data; safeParse gates the catalog-backed cards.

## 11. Tools & agents

3:55–4:40 · 45 seconds

http://localhost:3100/lightning.html#agent

> Now I want a checked bundle. The assistant requests the catalog tool, then calls the quote tool for a towel and bottle. Code checks availability and calculates eighteen euros, leaving seven. The repeated model, tool request, result, next decision cycle is the agent loop. A quote still does not change the cart.

**Stage action:** Click Build my beach kit. Inspect search_beach_catalog and quote_beach_kit. Expected default: towel + bottle, €18. Point at the real total: ‘The beach kit has a budget. My conference merch habit doesn’t.’

**Why this is funny (preparation only, do not read aloud):** The assistant sticks to the €25 limit, while you joke that you struggle to resist conference merchandise. “The beach kit has a budget. My conference merch habit doesn’t” is self-deprecating: the joke is your shopping habit, not the AI’s intelligence.

**Joke delivery:** Wait for the real quote. Point at €18 and say the merch line. Use this OR “Seven euros left. The model is better at sticking to my budget than I am”—not both.

## 12. Agent · code

4:40–5:00 · 20 seconds

http://localhost:3100/lightning.html#agent-code

> The server implementations read our catalog and calculate a quote. The model chooses which tools to request, but these functions enforce the rules. Registering tools gives the model those capabilities. maxIterations bounds the repeated model-and-tool cycle.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Implement trusted work

Source: server/app.ts / src/contracts.ts

```tsx
catalogDef.server(async () => ({ items: inventory }));
quoteDef.server(async (input) => quoteKit(input));

// Inside quoteKit:
const budget = Math.min(input.budget, 25);
const total = items.reduce((sum, item) => sum + item.price, 0);
if (total > budget) throw new Error('Kit exceeds the requested budget');
```

Server handlers read stock and calculate a budget-checked quote.

### Bound the loop

Source: server/app.ts

```tsx
chat({
  ...options,
  tools,
  agentLoopStrategy: maxIterations(4),
});
```

Register the tools and bound the model–tool–result loop.

## 13. A developer goes shopping

5:00–5:08 · 8 seconds

http://localhost:3100/lightning.html#meme-budget

> I needed a towel and a bottle. Naturally, I built an AI agent. The shopping took ten seconds. This took three days.

**Stage action:** Let the room read the visual. Deliver just the punchline, pause briefly, then advance. If the previous joke already got a laugh, skip this beat. Do not explain the joke.

**Why this is funny (preparation only, do not read aloud):** Buying a towel and bottle is a tiny task. Building an entire AI agent to do it takes far more effort than simply shopping. “Naturally” makes the unnecessary engineering sound like the obvious choice. The audience recognises the developer habit of automating a ten-second task for days. The three days is a comic exaggeration, not a project-timing claim.

**Joke delivery:** Say “I needed a towel and a bottle” normally. Pause before “Naturally, I built an AI agent,” as if that decision was perfectly sensible. Finish “The shopping took ten seconds. This took three days.” Pause for a laugh, then advance. Do not explain the joke aloud.

## 14. Human approval

5:08–5:43 · 35 seconds

http://localhost:3100/lightning.html#approval

> Now add those products. The assistant proposes add_to_cart. Look: the cart is still empty. The approval card names the towel and bottle with their catalog prices. I approve, the client tool executes, and the shared cart shows two items, eighteen euros. It follows us to the next demo. This is a real React state change in a demo cart, not an order or payment.

**Stage action:** Click Propose cart addition. Pause on the empty cart and named proposal, then Approve cart addition. Show two items and €18. Denial and budget checks are covered in rehearsal tests. On the pending card: ‘It can recommend the towel. It cannot spend my beach budget.’ Click Approve after the pause.

**Why this is funny (preparation only, do not read aloud):** “It can recommend the towel. It cannot spend my beach budget” treats a small shopping decision like a serious spending approval. The mild joke also demonstrates the feature: making a recommendation does not grant permission to change the cart.

**Joke delivery:** Point at the unchanged cart while the approval card is pending. Deliver the line, pause, then click Approve. Only describe the cart as changed after the result appears.

## 15. Approval · code

5:43–6:03 · 20 seconds

http://localhost:3100/lightning.html#approval-code

> needsApproval makes this tool pause before execution. useChat exposes the pending interrupt. These are separate Approve and Deny handlers, resolving that exact request. After approval, our client implementation validates the items and updates the shared cart.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Pause at the cart boundary

Source: src/contracts.ts

```tsx
const cartDef = toolDefinition({
  name: 'add_to_cart',
  inputSchema: z.object({
    ids: z.array(z.enum(['towel', 'water', 'sticker', 'fan'])).min(1).max(4),
  }),
  outputSchema, // added, items, total, message
  needsApproval: true,
});
```

needsApproval marks the tool as requiring a human decision.

### Resolve the proposal

Source: src/demos.tsx

```tsx
const { interrupts, resuming } = useChat({ connection, tools });
// Separate buttons on the pending card:
interrupt.resolveInterrupt(true);  // Approve cart addition
interrupt.resolveInterrupt(false); // Deny
```

The buttons resolve that specific interrupt, not a chat message.

## 16. Let me read the website

6:03–6:07 · 4 seconds

http://localhost:3100/lightning.html#meme-internet

> The content is the Easter egg. Jev, help us out.

**Stage action:** Let the room read the visual. Deliver just the punchline, pause briefly, then advance. If the previous joke already got a laugh, skip this beat. Do not explain the joke.

**Why this is funny (preparation only, do not read aloud):** An Easter egg is a hidden surprise in software. Here, the actual content has become the hidden surprise because cookies, newsletter popups and promotional messages cover it. The audience recognises the frustration of trying to read a modern website.

**Joke delivery:** Let the audience read the two panels. Say “The content is the Easter egg. Jev, help us out.” Move directly to the cluttered page so the next demo makes the joke visible.

## 17. Jev cleanup

6:07–7:02 · 55 seconds

http://localhost:3100/lightning.html#jev

> Sometimes the output should be a choice rather than a paragraph. This disaster of a homepage was inspired by Kitze’s Unclutter—catch his talk later. We ask Jev, through Vercel AI Gateway, to classify known page elements for a reading goal.

> Our application protects the useful product content and only hides eligible distractions that meet its decision policy. Watch the interruptions disappear. This is a typed decision, not model-generated JavaScript taking over the page. Restore makes it reversible.

> Now let’s move from deciding what should be visible to giving an agent explicit actions it can use on the page.

**Stage action:** Click Unclutter this disaster, show the before/after change, then Restore everything once. Give Kitze the shoutout here. Show the Jev code, then move directly to WebMCP. Let the clutter disappear before saying: ‘We found the product.’ Briefly hover Restore: ‘This button is sponsored by the growth team.’ No need to rerun.

**Why this is funny (preparation only, do not read aloud):** “We found the product” implies the page was so buried in interruptions that the shop was hard to find. “This button is sponsored by the growth team” jokes that a team focused on signups and conversions would want those promotional popups restored. There is no actual sponsor; it is a playful jab at overdoing marketing.

**Joke delivery:** Show the clutter first. Click cleanup and wait for the visible change before saying “We found the product.” Then point to Restore and deliver the growth-team line. If people laugh, wait; do not speak over them. Never claim cleanup succeeded if it has not.

## 18. Jev · code

7:02–7:22 · 20 seconds

http://localhost:3100/lightning.html#jev-code

> choice defines the allowed answers: keep, clutter or uncertain. decide sends the questions and page descriptions to Jev through Gateway. Application policy then protects essential content and only hides eligible clutter. Restore reverses it. Next, let’s give the page explicit tools.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Ask a typed question

Source: server/app.ts

```tsx
choice({
  instructions: 'Classify this element for the stated reading goal.',
  options: {
    keep: 'Useful for the reader goal',
    clutter: 'Interrupts or distracts from the goal',
    uncertain: 'Not enough evidence',
  },
});
```

Each known page element gets a question with allowed answers.

### Use the decision adapter

Source: server/app.ts

```tsx
const answers = await decide({
  adapter: vercelGatewayDecider('typesafe-ai/jev'),
  state: { goal, elements },
  questions,
  abortSignal,
});
```

The server sends descriptions and the reading goal through Gateway.

## 19. WebMCP page actions

7:22–8:22 · 60 seconds

http://localhost:3100/lightning.html#webmcp

> An agent could try to click coordinates. Instead, the page publishes named capabilities with schemas: filter this catalog and change this theme. That is WebMCP. Our TanStack client registers and discovers those tools through Chrome’s native browser registry.

> I ask for affordable, in-stock items and a lavender shop. The model chooses the tools, the browser executes their handlers, and React updates the visible page. Here are the two actual executions.

> This is our in-page agent using native WebMCP, not a separate browser assistant. It only controls this preview. Our final demo adds reusable instructions to the shop assistant with Skillbox.

**Stage action:** Confirm native status shows two discovered tools. Click Ask the page agent. Point at three items, lavender and the execution log. If support is unavailable, say so and explain the named tools; do not claim they executed. After the actual tools succeed: ‘The budget is strict. The brand guidelines are lavender.’ Do not deliver the success joke before the page changes.

**Why this is funny (preparation only, do not read aloud):** “The budget is strict. The brand guidelines are lavender” pairs a practical shopping requirement with an unnecessarily serious colour preference. The small joke is treating a playful theme choice like an important business rule. It also points to the two different tools that just ran.

**Joke delivery:** Wait until the filtered products and lavender theme are visible. Say the line while pointing at each change. Keep it casual; no long pause or explanation is needed.

## 20. Webmcp · code

8:22–8:42 · 20 seconds

http://localhost:3100/lightning.html#webmcp-code

> The client tool has a schema and a React implementation. Registration publishes it to the native browser registry. Discovery reads those tools back, and useChat exposes them to our in-page agent. The compatibility helper handles Chrome’s serialization format. Execution still crosses the native registry.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Write a page action

Source: src/advanced-demos.tsx

```tsx
toolDefinition({
  name: 'alicante_set_theme',
  description: 'Change the Vamos Alicante catalog color theme on this page.',
  inputSchema: z.object({ theme: z.enum(['tomato', 'lime', 'lavender']) }),
  outputSchema: z.object({ theme: z.string() }),
}).client(async ({ theme }) => {
  setTheme(theme);
  return { theme };
});
```

A typed client handler changes the visible theme through React state.

### Register and discover

Source: src/advanced-demos.tsx / src/webmcp-compat.ts

```tsx
useRegisterWebMCPTools(registered, registrationOptions);
const discovered = usePageWebMCPTools(browserToolFilter);
const pageTools = normalizeNativeTools(discovered);
const chat = useChat({
  connection: fetchServerSentEvents('/api/chat/webmcp'),
  tools: pageTools,
});
```

Register → discover through native WebMCP → provide tools to useChat.

## 21. Agent skills + Skillbox

8:42–9:17 · 35 seconds

http://localhost:3100/lightning.html#skills

> One final upgrade: reusable shop instructions. Can I return a towel after using it? The assistant loads returns-guide from Skillbox, Kitze’s versioned skill library, and explains our fictional policy: unused, original packaging, thirty days. The receipt shows the loaded revision. Skillbox stores the playbook; TanStack AI loads it through load_skill. Instructions guide an answer; they do not authorize refunds or cart changes. Another shoutout to Kitze for Skillbox.

**Stage action:** Click Can I return it?, then Ask the shop assistant. Show returns-guide and its revision receipt. Keep the product-advice preset for questions. Advance to the Skillbox code slide, then the recap.

## 22. Skillbox · code

9:17–9:37 · 20 seconds

http://localhost:3100/lightning.html#skills-code

> On the left, our custom SkillSource connects the Skillbox HTTP library to TanStack. list returns short descriptions; load returns the chosen version. On the right, withSkills gives the model the catalog and load_skill. The browser never receives the client key. This is a separate open-source project by Kitze, integrated with a small adapter.

**Stage action:** Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.

### Adapt the library to TanStack

Source: server/skillbox.ts

```tsx
// Focused excerpt: a custom SkillSource, not a built-in Skillbox adapter.
return {
  list: async () => (await list()).map(item => ({
    name: item.id, description: item.description,
    metadata: { source: 'Skillbox', revision: item.revision },
  })),
  load: async (name) => {
    const selected = (await list()).find(item => item.id === name);
    if (!selected) throw new Error('Skill not in the authorized catalog');
    const path = '/api/skills/' + encodeURIComponent(name)
      + '?revision=' + encodeURIComponent(selected.revision);
    const loaded = loadedSchema.parse(await read(path));
    if (loaded.revision !== selected.revision) throw new Error('Revision mismatch');
    return loaded.instructions;
  },
};
```

Our SkillSource reads authorized descriptions, then the selected pinned revision.

### Let the model select, then inspect the receipt

Source: server/app.ts

```tsx
const source = createSkillboxSource(controller.signal);
const stream = chat({
  ...options,
  middleware: [withSkills([source])],
  tools,
  agentLoopStrategy: maxIterations(4),
});
// React renders load_skill input/output and the Skillbox revision.
```

withSkills supplies load_skill; React shows the result and streams the answer.

## 23. The pattern behind the storefront

9:37–9:52 · 15 seconds

http://localhost:3100/lightning.html#one-pattern

> Across these demos, schemas control data shape, tool implementations control work, and interrupts capture a human decision. Models contribute output; our application owns the boundaries. Those are the pieces to remember.

**Stage action:** Read the two short blocks from server to React. Recap the three boundaries in the footer; the individual code slides have already explained the APIs.

## 24. And there is more

9:52–10:15 · 23 seconds

http://localhost:3100/lightning.html#more

> What we saw is only part of the toolkit. We just saw Skillbox supply reusable instructions. Code Mode lets an agent compose permitted tools into a small program. There are also media APIs, embeddings and reranking, memory, remote MCP, persistence, resumable streams, telemetry and coding-agent harnesses.

> The remaining capabilities are for exploration after this talk. The full companion deck has examples and setup notes. You can explore those after the talk.

**Stage action:** Mention the capability groups once. Keep all of them on this one slide. Do not follow the full-deck link during the talk.

## 25. Build it with Shivay & Vikas

10:15–10:40 · 25 seconds

http://localhost:3100/lightning.html#workshop

> If you want to build this instead of just watch it, Vikas and I ran a four-hour hands-on workshop. Scan this code for the attendee repository: starters, solutions and experiments. Thank you, React Alicante!

**Stage action:** Leave the QR visible. Keep the remaining twenty seconds as buffer. Stop by 11:00.

## Comedy delivery cues

Keep the feature explanation straight. Let the absurd business idea carry the joke. Do not promise the audience that the next line will be funny, and do not explain a punchline after delivering it.

- **Skills + streaming:** product advice loads beach-shopper; a return question loads returns-guide. Only say a playbook loaded after its receipt appears. Keep the shopper’s €25 need central.
- **Structured output:** show comparison cards. “No imaginary discount. Those prices came from the catalog.”
- **Agent:** show the €18 quote. “Seven euros left. The model is better at sticking to my budget than I am.”
- **Approval:** pause on the unchanged bag. “It can recommend the towel. It cannot spend my beach budget.” Approve, then show the actual cart.
- **Jev:** let the before/after transformation land. “We found the product.” Gesture at Restore: “This button is sponsored by the growth team.” Keep the Kitze credit.
- **WebMCP:** only after the tools change the grid and theme: “The budget is strict. The brand guidelines are lavender.” Then explain the registered capabilities.

The three original meme slides are quick optional beats. If the room laughs, give it space and use the buffer. If a live request overruns, skip a meme and shorten the closing capability list. These cues are included within demo time; they are not six additional segments. Model output is variable, so the visible interface supplies the dependable setup and punchline. Fixture results must remain labelled as rehearsal.


## Before the talk

Keep one server running and confirm the live provider configuration. Rehearse with the exact presentation browser, especially native WebMCP support. Fixture mode tests protocol plumbing but is not live model reasoning. Keep the full deck available for questions; do not navigate its longer code walkthroughs during this route. The closing QR links to the four-hour attendee workshop.
