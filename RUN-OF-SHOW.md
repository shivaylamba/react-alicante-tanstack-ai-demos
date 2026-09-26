# Presenter guide — Building AI-Powered React Apps with TanStack AI

Open http://localhost:3100/#welcome. Use the slide counter to jump, arrow keys to advance, and N to open the script. The supplied React Alicante image is the opening. Every feature has a demo and a three-part code walkthrough. No timings are projected. The RC capability tour adds documentation-based examples, with prerequisites and source links. Use the jump links to keep that deeper tour optional during a short talk.

Keep one server running. Check the LIVE MODE badge. Rehearsal is a scripted fallback, not evidence of live inference.

## 01 — Building AI-Powered React Apps

http://localhost:3100/#welcome

> Hello React Alicante! I’m Shivay. Today we are building AI-powered React applications with TanStack AI. We will connect each feature to something you can actually see, then look at the code that makes it work.

## 02 — What is TanStack AI?

http://localhost:3100/#toolkit

> TanStack AI is an open-source TypeScript toolkit for connecting AI models, tools and application interfaces. It is not itself a model. We choose our provider and our React components. It handles the coordination: requests, streamed events, tool execution and interaction state. Today we use Nebius for text generation and Jev through Vercel AI Gateway for typed decisions.

## 03 — The RC capability map

http://localhost:3100/#rc-overview

> The release-candidate announcement describes a toolkit that extends well beyond a chat box. These seven areas show its scope. We will demonstrate the chat and agent building blocks, then use code examples for the additional capabilities. The article reported 24 provider adapters at RC. Support varies by model and adapter. The later capability slides are an optional deeper tour; they do not launch extra live services.

## 04 — How the pieces connect

http://localhost:3100/#how-it-works

> React sends a task to our server. The server keeps the API key private and uses an adapter to call the model. The model can return text, structured data or a request to use a tool. Our code validates data and decides what can execute. For chat, named AG-UI events travel over SSE and useChat updates React. SSE is the delivery mechanism; AG-UI is the event vocabulary.

## 05 — Provider choice & type safety

http://localhost:3100/#rc-providers

> The RC announcement reported 24 provider adapters. That is the count in that announcement, not a permanent limit. An adapter connects the provider to TanStack’s API. We use Nebius today. This example uses a different adapter to show the common shape. TypeScript can reject options unsupported by a known model. That does not mean every provider supports every feature, or that a model’s answer is correct.

### Block 1: The shared entry point

```tsx
import { chat } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';

const stream = chat({
  adapter: openaiText('gpt-5'),
  messages: [{ role: 'user', content: 'Describe the Vamos Alicante beach shop in one sentence.' }],
});
```

> chat owns the application-facing call. The adapter identifies the provider and model. Keep the credential on the server; changing adapters also requires checking that model’s supported tools and output modes.

### Block 2: Catch unsupported options early

```tsx
chat({
  adapter: openaiText('gpt-4-turbo'),
  messages: [],
  modelOptions: {
    // @ts-expect-error: this model does not expose this option
    text: {},
  },
});
```

> This is deliberately invalid: the adapter’s model metadata excludes text for this model. Type safety checks API contracts. Runtime validation and evaluations are still needed for external data and model behavior.

To build this: Server examples. The OpenAI adapter shown needs its own server-side credential. Our live text demos use Nebius.

These are documentation examples, not additional live demos.

[Per-model type safety](https://tanstack.com/ai/latest/docs/advanced/per-model-type-safety)

## 06 — AG-UI & transport choices

http://localhost:3100/#rc-transports

> AG-UI is the vocabulary: a run started, text arrived, a tool was called, the run finished. It is not another name for SSE. In our demos SSE carries those events. TanStack also has HTTP streaming, WebSocket and custom connection adapters. We change the connection implementation and pair it with the right server response; we do not rewrite our entire message interface.

### Block 1: Use SSE for the demo

```tsx
import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

const { messages, sendMessage, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});
// Server pairs this with toServerSentEventsResponse(stream).
```

> useChat consumes named events and updates messages. Stop requests cancellation. Our current demos use this path.

### Block 2: Choose another connection

```tsx
import { fetchHttpStream, webSocket } from '@tanstack/ai-react';

const http = fetchHttpStream('/api/chat-http');
// Server: toHttpResponse(stream)

const socket = webSocket('/api/chat-ws');
// Server: toWebSocketStream or toWebSocketResponse
// Pass ONE of these as useChat({ connection }).
```

> HTTP streaming uses NDJSON; WebSockets keep a bidirectional connection. Custom adapters can implement other transports. Adding a WebSocket URL alone does not create its server route or durability store.

To build this: Alternative React connections, not three simultaneous connections. Each needs a matching server implementation.

These are documentation examples, not additional live demos.

[Connection adapters](https://tanstack.com/ai/latest/docs/chat/connection-adapters)

## 07 — What can it do? Meet Vamos Alicante.

http://localhost:3100/#alicante

> Now let’s give these capabilities something to do. Vamos Alicante is a fictional beach-essentials shop for React Alicante attendees after the talks. You are the shopper: ask about products, compare options, get a checked quote, then approve an addition to your cart. Later we will remove distractions and let WebMCP filter the same catalog. Skills supply product and return-policy playbooks; Code Mode remains an optional operations example. The shop and its inventory are fictional. The API calls are real when the badge says live.

## 08 — Streaming

http://localhost:3100/#shopchat-feature

> A normal JSON endpoint waits for a complete result. Here the HTTP response stays open while events arrive. TanStack AI gives those events a consistent format, and useChat turns them into React state. Watch the response arrive, then try Stop. Our provider choice today is Nebius; the application pattern is the important part.

Advance to the demo.

## 09 — Streaming · demo

http://localhost:3100/#shopchat

Run the default task. Watch for: **SSE carries the events. AG-UI describes the events. React renders the state.**

Ask a product question. Show incremental text and the Stop button.

Then use Explain the code.

## 10 — Streaming · code

http://localhost:3100/#shopchat-code

### Block 1: Start a generation

Source: server/app.ts

```tsx
const stream = chat({
  adapter: model,
  messages: params.messages,
  systemPrompts: [prompts.shopchat],
  abortController: controller,
});
```

> The adapter connects to our chosen provider on the server. Messages supply the conversation. The AbortController lets a disconnected or cancelled request stop work. This is the text-only path, with no tools registered.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Transport the events

Source: server/app.ts

```tsx
return toServerSentEventsResponse(guarded(), {
  abortController: controller,
});
```

> The route returns an HTTP event stream. The supplied guarded generator forwards chunks and cleans up the timeout and disconnect listener. AG-UI is the event vocabulary; SSE is the transport.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Connect React

Source: src/demos.tsx

```tsx
const { messages, sendMessage, isLoading, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat/shopchat'),
});

// Event handlers in our interface:
await sendMessage(input);
stop();
```

> The hook holds conversation state and connects it to our route. The submit handler sends the prompt; a separate Stop button cancels the active run. These are separate UI actions, not consecutive statements in one handler.

Use the next-block control. The full running source can be expanded below the excerpt.

## 11 — Structured output

http://localhost:3100/#product-feature

> The shopper is choosing products, not building a website. We ask for product IDs and short reasons in a known shape. React validates that shape, looks up each ID in our own catalog, and renders comparison cards. The model cannot invent the displayed price. This is a shortlist; it has not changed the cart. Next we will ask code to calculate a precise bundle quote.

Advance to the demo.

## 12 — Structured output · demo

http://localhost:3100/#product

Run the default task. Watch for: **The model supplies a shortlist. The catalog supplies the facts.**

Compare products and inspect catalog-backed names, prices and stock. AI supplies IDs and reasons, never prices.

Then use Explain the code.

## 13 — Structured output · code

http://localhost:3100/#product-code

### Block 1: Constrain the recommendation

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

> The model returns IDs and reasons, never prices or HTML. This demo allowlists available products; a production catalog would need a dynamic lookup and current stock validation.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Request data, not markup

Source: server/app.ts

```tsx
chat({ ...options, outputSchema: comparisonSchema, stream: true });
```

> The prompt supplies the fictional catalog. We wait for complete validated structured output before rendering cards.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Join with trusted catalog facts

Source: src/demos.tsx

```tsx
const parsed = comparisonSchema.safeParse(structured.data);
// ProductPreview receives only validated data:
const product = inventory.find(p => p.id === pick.productId)!;
// React renders product.name, product.price, product.stock and pick.reason.
```

> Names, prices and availability come from the same catalog as the tools. Model-written reasons remain suggestions; schema validation alone does not prove the quality of advice.

Use the next-block control. The full running source can be expanded below the excerpt.

## 14 — Tools & agents

http://localhost:3100/#agent-feature

> The model cannot inspect our stock by guessing. We give it two capabilities: read the catalog and calculate a quote. It chooses the calls and arguments. Our code checks stock, adds prices and enforces the spending cap. This repeated model-tool-result cycle is what we mean by an agent here.

Advance to the demo.

## 15 — Tools & agents · demo

http://localhost:3100/#agent

Run the default task. Watch for: **Model → tool request → application result → model. Repeat within a budget.**

Inspect search_beach_catalog and quote_beach_kit. The application must keep the quote at or below €25.

Then use Explain the code.

## 16 — Tools & agents · code

http://localhost:3100/#agent-code

### Block 1: Define the contract

Source: src/contracts.ts

```tsx
const quoteInput = z.object({
  ids: z.array(z.string()).min(1).max(5),
  budget: z.number().min(1).max(200),
});
// quoteDef uses this inputSchema and a typed outputSchema.
```

> The model requests a named tool with JSON arguments. It supplies IDs and a budget, not arbitrary executable code. Input validation happens before those values are used.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Implement trusted work

Source: server/app.ts / src/contracts.ts

```tsx
catalogDef.server(async () => ({ items: inventory }));
quoteDef.server(async (input) => quoteKit(input));

// Inside quoteKit:
const budget = Math.min(input.budget, 25);
const total = items.reduce((sum, item) => sum + item.price, 0);
if (total > budget) throw new Error('Kit exceeds the requested budget');
```

> server means these handlers execute on our backend. quoteKit also checks IDs, stock and duplicate items. The model cannot raise the trusted €25 ceiling by changing its argument.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Bound the loop

Source: server/app.ts

```tsx
chat({
  ...options,
  tools,
  agentLoopStrategy: maxIterations(4),
});
```

> The loop allows the model to react to tool results. Four iterations limit repeated generation; the route additionally caps tool calls and wall-clock duration. Inspect the actual calls in the demo.

Use the next-block control. The full running source can be expanded below the excerpt.

## 17 — Human approval

http://localhost:3100/#approval-feature

> We have compared the products and checked the total. Now I ask to add the towel and bottle. The assistant calls add_to_cart, but needsApproval pauses it. Notice the cart is still empty. The card lists exact products and catalog prices. Deny leaves the bag unchanged. Approve runs our client implementation, validates the IDs, stock and combined €25 cap, then changes React state. The cart remains visible across slides. It is a local demo cart, not a real order or payment; a production cart would need backend validation and authorization.

Advance to the demo.

## 18 — Human approval · demo

http://localhost:3100/#approval

Run the default task. Watch for: **The model proposes. The button approves. Code updates the cart.**

Deny the first proposal and confirm the cart stays empty. Reset the demo, propose again and approve. Confirm towel + bottle, €18, and cart persistence across slides.

Then use Explain the code.

## 19 — Human approval · code

http://localhost:3100/#approval-code

### Block 1: Pause at the cart boundary

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

> The tool requests catalog IDs, not model-generated prices. needsApproval creates a specific interrupt before execution.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Update the shared cart

Source: src/demos.tsx / src/storefront.tsx

```tsx
cartDef.client(async ({ ids }) => {
  const result = cart.add(ids);
  return { added: true, items: result.items, total: result.total,
    message: 'Demo cart updated. No order placed.' };
});
// cart.add combines IDs, deduplicates them, and calls quoteKit
// before changing shared React state. Invalid stock/budget rejects.
```

> One of each product is supported. Repeated IDs cannot duplicate a cart line. The cart uses the same catalog and €25 spending rule as the quote.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Resolve the proposal

Source: src/demos.tsx

```tsx
const { interrupts, resuming } = useChat({ connection, tools });
// Separate buttons on the pending card:
interrupt.resolveInterrupt(true);  // Approve cart addition
interrupt.resolveInterrupt(false); // Deny
```

> The cart stays unchanged before approval and after denial. Shared React state survives slide navigation, while a refresh resets this demo cart.

Use the next-block control. The full running source can be expanded below the excerpt.

## 20 — Typed decisions

http://localhost:3100/#jev-feature

> Kitze inspired this one with Unclutter. Instead of generating a chat reply, Jev answers named questions about the page elements. Our code protects essential content regardless of the answer. Only eligible clutter above our confidence policy is hidden. Restore makes the change reversible.

Advance to the demo.

## 21 — Typed decisions · demo

http://localhost:3100/#jev

Run the default task. Watch for: **Typed choices constrain the answer shape. They do not guarantee correct judgment.**

Run cleanup, inspect kept and hidden elements, then restore everything.

Then use Explain the code.

## 22 — Typed decisions · code

http://localhost:3100/#jev-code

### Block 1: Ask a typed question

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

> The full route creates one question per known element. The model selects from these options; it never invents a DOM selector or supplies code for us to run.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Use the decision adapter

Source: server/app.ts

```tsx
const answers = await decide({
  adapter: vercelGatewayDecider('typesafe-ai/jev'),
  state: { goal, elements },
  questions,
  abortSignal,
});
```

> This request uses Jev through Gateway. State contains descriptions of this demo page, not screenshots or browsing history. This endpoint returns JSON rather than the chat event stream.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Apply a reversible policy

Source: src/contracts.ts / src/demos.tsx

```tsx
return !!block && block.kind !== 'essential'
  && decision.category === 'clutter'
  && decision.probability >= 0.85
  && (decision.confidence === undefined
      || decision.confidence >= 0.85);

// Restore discards the hidden-element set.
```

> Even a confident model decision cannot hide protected content. The threshold is our chosen demo rule, not a measured accuracy guarantee. Unknown and uncertain content stays visible.

Use the next-block control. The full running source can be expanded below the excerpt.

## 23 — What have we covered?

http://localhost:3100/#recap

> So far we have streamed a response, rendered typed data, looked up facts using tools, paused for human approval and applied typed decisions. Notice that these are different contracts. A structured output is data to render. A tool call is a request to execute. An approval is a decision about execution. Now we will add browser capabilities, reusable skills and generated programs.

## 24 — WebMCP

http://localhost:3100/#webmcp-feature

> Clicking coordinates is a fragile way for an agent to use a site. WebMCP lets the page publish explicit capabilities instead. We register two client tools, then our TanStack chat discovers those tools from the browser. The model chooses them, and the browser executes the handlers. This is experimental browser support; the demo reports when it is unavailable.

Advance to the demo.

## 25 — WebMCP · demo

http://localhost:3100/#webmcp

Run the default task. Watch for: **These calls cross the browser’s native WebMCP registry. They change only this page.**

Verify the native registry shows two discovered tools. The prompt should produce three in-stock items under €10 and a lavender shop. Unsupported browsers must show an explicit status.

Then use Explain the code.

## 26 — WebMCP · code

http://localhost:3100/#webmcp-code

### Block 1: Write a page action

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

> The handler changes React state. The schema constrains the available themes. This tool has no authority to purchase, deploy, or modify another website.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Register and discover

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

> Registration publishes executable client tools on document.modelContext. Discovery reads them back through the native browser API. The filter keeps only our Vamos Alicante tools. A small compatibility adapter handles Chrome’s JSON-string schema and argument format while still calling the native registry. Leaving the demo removes its registrations.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Accept browser tool declarations

Source: server/app.ts

```tsx
const tools = mergeAgentTools([], params.tools?.filter(
  tool => ['alicante_filter_catalog', 'alicante_set_theme'].includes(tool.name)
));
chat({ ...options, tools, agentLoopStrategy: maxIterations(4) });
```

> The server receives tool descriptions from the client. It permits these named browser capabilities; their handlers still execute on the page. This demonstration uses an in-page agent, not an independent browser assistant.

Use the next-block control. The full running source can be expanded below the excerpt.

## 27 — Code Mode

http://localhost:3100/#codemode-feature

> Ordinary tool use often returns control to the model after each result. Code Mode lets the model write a program that makes several calls, uses loops and does calculations before returning. Here it reads three fictional teams in parallel. We expose one read-only data tool and run the generated program in a small QuickJS isolate. No host files, secrets or network API are exposed to the generated code.

Advance to the demo.

## 28 — Code Mode · demo

http://localhost:3100/#codemode

Run the default task. Watch for: **The model writes the program. An isolate runs it. Tools control its access.**

Point at the actual generated program. Look for the three data reads and arithmetic. Expected fictional weekly costs: engineering €3,360; marketing €2,750; leadership €5,760; total €11,870.

Then use Explain the code.

## 29 — Code Mode · code

http://localhost:3100/#codemode-code

### Block 1: Expose one typed data tool

Source: server/advanced.ts

```tsx
toolDefinition({
  name: 'team_costs',
  description: 'Read fictional staffing and weekly one-hour meeting data.',
  inputSchema: z.object({
    team: z.enum(['engineering', 'marketing', 'leadership']),
  }),
  outputSchema,
}).server(async ({ team }) => teams[team]);
```

> The complete handler also caps data reads. Code Mode exposes it inside the isolate as external_team_costs. The generated program has only the capabilities we bind.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 2: Create a bounded execution environment

Source: server/advanced.ts

```tsx
const { tool, systemPrompt } = createCodeMode({
  driver: createQuickJSIsolateDriver(),
  tools: [teamCosts],
  timeout: 3000,
  memoryLimit: 32,
});
// chat receives tools: [tool] and systemPrompt.
```

> createCodeMode pairs the execution tool with instructions and typed function declarations. QuickJS runs the generated code with a 32 MB limit and an execution deadline. The model request also has its own timeout.

Use the next-block control. The full running source can be expanded below the excerpt.

### Block 3: Inspect the actual generated program

Source: src/advanced-demos.tsx

```tsx
const execution = tools.findLast(
  tool => tool.name === 'execute_typescript' && tool.output
);
const parsed = costResult.safeParse(execution?.output);
// Render validated totals and the actual tool input.typescriptCode.
```

> The preceding demo shows the real program, not a prerecorded example. It should read three teams and calculate people × hourlyRate × meetingsPerWeek. We validate the returned shape before drawing the result.

Use the next-block control. The full running source can be expanded below the excerpt.

## 30 — Seven capabilities, one React app

http://localhost:3100/#takeaways

> These are eight different building blocks, not eight variations of a chat box. Streaming improves feedback. Structured output gives React predictable fields. Tools connect facts and actions. Approval preserves control. Typed decisions classify. WebMCP publishes page actions. Skills teach procedures. Code Mode composes tools into a program. The model contributes intelligence; our application owns the boundaries.

## 31 — Media generation

http://localhost:3100/#rc-media

> The same toolkit also covers media. Here is the smallest example: generate a mascot on the server, then use a React generation hook to show it. The hook exposes loading and result state. Different modalities need different adapters and sometimes job polling or streaming. Our product-comparison demo generates structured text; it does not generate an image. This slide shows how we could add that next.

### Block 1: Generate on the server

```tsx
import { generateImage } from '@tanstack/ai';
import { openaiImage } from '@tanstack/ai-openai';

const result = await generateImage({
  adapter: openaiImage('dall-e-3'),
  prompt: 'A smiling sun over a beach bag, editorial illustration',
});
// In your route: return Response.json(result);
```

> generateImage is a media activity, not a chat tool call. The adapter reads its provider key on the server. This model returns image URLs; other adapters may return base64 data.

### Block 2: Keep rendering in React

```tsx
import { useGenerateImage } from '@tanstack/ai-react';

const { generate, result, isLoading } = useGenerateImage({
  fetcher: async (input) => {
    const response = await fetch('/api/image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error('Image generation failed');
    return response.json();
  },
});

<button disabled={isLoading}
  onClick={() => generate({ prompt: 'A friendly beach-shop sun mascot' })}>
  Generate mascot
</button>
// Render result.images using the adapter's URL or base64 format.
```

> The hook coordinates the request and exposes the result. Supply a real route that validates the incoming prompt; the server snippet’s fixed prompt is only the minimal first example.

To build this: Documentation example; media generation is not connected in this demo app. Requires a media-capable provider, credentials and the /api/image route.

These are documentation examples, not additional live demos.

[Image generation](https://tanstack.com/ai/latest/docs/media/image-generation) · [Generation hooks](https://tanstack.com/ai/latest/docs/media/generation-hooks)

## 32 — Embeddings, reranking & RAG

http://localhost:3100/#rc-rag

> An embedding converts text into a vector we can compare for similarity. Our database uses those vectors to find candidate policy passages. A reranker sorts those candidates for the current question. Then we pass selected passages and their source links to the answer-generation step. TanStack provides embedding and reranking calls. We still supply the index, access checks and evidence-handling behavior.

### Block 1: Embed the query

```tsx
import { embed } from '@tanstack/ai';
import { openaiEmbedding } from '@tanstack/ai-openai';

const query = await embed({
  adapter: openaiEmbedding('text-embedding-3-small'),
  input: 'Can I return my beach towel?',
});
const vector = query.embeddings[0].vector;
// Search your index: document vectors must use the same model.
```

> The vector is a search representation, not an answer. Index documents first; retrieve only passages the current user may access. Embeddings alone are not a complete RAG pipeline.

### Block 2: Rank evidence before answering

```tsx
import { rerank } from '@tanstack/ai';
import { cohereRerank } from '@tanstack/ai-cohere';

const { rerankedDocuments } = await rerank({
  adapter: cohereRerank('rerank-v3.5'),
  query: 'Can I return my beach towel?',
  documents: candidatePolicyPassages, // from your retrieval code
  topN: 3,
});
// Give these passages + source links to chat().
```

> The reranker prioritizes evidence; chat generates the final answer. Keep original source IDs alongside the selected passages so the interface can cite them. Handle missing evidence explicitly.

To build this: Server examples. Supply your document index, retrieval code, authorized source text and relevant provider credentials.

These are documentation examples, not additional live demos.

[Embeddings](https://tanstack.com/ai/latest/docs/embeddings) · [Reranking](https://tanstack.com/ai/latest/docs/rerank/rerank)

## 33 — Agent memory

http://localhost:3100/#rc-memory

> Suppose a shopper tells Vamos Alicante they prefer minimalist designs. Memory middleware can recall relevant context in a later turn and save the new exchange. That is different from restoring an entire chat transcript. The scope must come from our authenticated server session. This in-memory adapter is useful for learning; a shared durable adapter is needed when the service restarts or runs across multiple processes.

### Block 1: Attach scoped recall and save

```tsx
import { memoryMiddleware } from '@tanstack/ai-memory';
import { inMemory } from '@tanstack/ai-memory/in-memory';

const memory = inMemory(); // module scope: reuse across requests

// Inside your authenticated chat route:
const stream = chat({
  adapter, messages,
  middleware: [memoryMiddleware({
    adapter: memory,
    scope: { userId: session.user.id, threadId },
  })],
});
```

> adapter, messages, session and threadId come from your server setup. The middleware recalls and saves through the memory adapter. Do not accept an arbitrary browser-supplied user ID as an authorization boundary.

To build this: Requires @tanstack/ai-memory. This development adapter stores records only in one process and loses them on restart.

These are documentation examples, not additional live demos.

[Memory quickstart](https://tanstack.com/ai/latest/docs/memory/quickstart)

## 34 — Remote MCP & generated types

http://localhost:3100/#rc-mcp

> We just saw page-local WebMCP. Remote MCP is a different boundary: the backend connects to a service exposing tools. TanStack can discover its tools and manage the connection lifecycle. The type generator records the server’s declared names. Runtime-discovered arguments are still unknown; use explicit tool definitions and schemas for typed, validated inputs. Generated types are not a substitute for authorization.

### Block 1: Connect and manage the lifecycle

```tsx
import { createMCPClient } from '@tanstack/ai-mcp';

const inventory = await createMCPClient({
  transport: { type: 'http', url: process.env.MCP_URL! },
});
const stream = chat({
  adapter, messages,
  mcp: { clients: [inventory], connection: 'close' },
});
```

> Configure required authentication and tool filtering on your client. chat discovers the tools and closes this per-run connection. For mutating service tools, define approval and server-side access controls.

### Block 2: Generate names; validate arguments

```tsx
// 1. Configure the server in mcp.config.ts.
// 2. Run: npx @tanstack/ai-mcp generate

import type { InventoryServer } from './mcp-types.generated';
const client = await createMCPClient<InventoryServer>({
  transport: { type: 'http', url: process.env.MCP_URL! },
});
const tools = await client.tools();
// Names are narrowed. Discovery-path arguments stay unknown.
// Use client.tools([toolDefinition(...)]) for typed schemas.
```

> InventoryServer is emitted for a server you configure, not a built-in TanStack type. Regenerate when the server changes. Explicit definitions add runtime schema validation and typed arguments.

To build this: Requires @tanstack/ai-mcp and a real authorized MCP server. Example URL and generated file are placeholders.

These are documentation examples, not additional live demos.

[Managed MCP](https://tanstack.com/ai/latest/docs/tools/mcp-managed) · [MCP type generation](https://tanstack.com/ai/latest/docs/tools/mcp-codegen)

## 35 — Persistence & stream durability

http://localhost:3100/#rc-persistence

> There are two layers here. Persistence saves the transcript and run state. Durability logs ordered stream events and resumes delivery. Neither means our current in-memory demo suddenly survives a restart. A production app supplies storage and access checks, and restores the client’s thread and run identity. The GET replay does not call the model again. It also cannot magically restart a producer that has died.

### Block 1: Save authoritative thread state

```tsx
import { withPersistence } from '@tanstack/ai-persistence';
import { persistence } from './persistence'; // your backend

const stream = chat({
  adapter,
  messages: params.messages,
  threadId: params.threadId,
  runId: params.runId,
  ...(params.resume ? { resume: params.resume } : {}),
  middleware: [withPersistence(persistence)],
});
```

> Your backend implements the stores. Preserve resume data for interrupted runs. Database-backed stores can survive restarts; a local in-memory stand-in cannot.

### Block 2: Record and replay stream events

```tsx
import { memoryStream, toServerSentEventsResponse,
  resumeServerSentEventsResponse } from '@tanstack/ai';

// In POST, after creating stream:
return toServerSentEventsResponse(stream, {
  durability: { adapter: memoryStream(request) },
});

// In GET, after checking access to the run:
return resumeServerSentEventsResponse({
  adapter: memoryStream(request),
});
```

> These are excerpts from two separate route handlers. For multiple processes use an external durability adapter. Reconnect can replay delivery; one-time side effects around POST must be guarded against repeat execution.

### Block 3: Rejoin from the client

```tsx
const { messages, joinRun } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});

// After loading the authorized conversation and active run:
await joinRun(activeRunId);
```

> Client restoration is part of the feature, not just server middleware. The app obtains the correct active run from its authenticated store. joinRun uses the replay endpoint; SSE event IDs support reconnect and deduplication.

To build this: Example integration only. Supply a persistence backend, stable IDs, ownership checks and client restoration/joinRun wiring. memoryStream is single-process development storage.

These are documentation examples, not additional live demos.

[Chat persistence](https://tanstack.com/ai/latest/docs/persistence/chat-persistence) · [Resumable streams](https://tanstack.com/ai/latest/docs/resumable-streams/overview)

## 36 — Composable middleware & telemetry

http://localhost:3100/#rc-telemetry

> Once an agent makes several calls, a single request duration does not explain much. The telemetry middleware gives us a chat span, model-call spans and tool-call spans. Our existing OpenTelemetry setup exports them. Skills, memory and persistence also compose through middleware. Stream durability is separate: it belongs on the streaming response. Keep content capture intentional because prompts and tool results may contain private data.

### Block 1: Add tracing to the same chat call

```tsx
import { otelMiddleware } from '@tanstack/ai/middlewares/otel';
import { trace, metrics } from '@opentelemetry/api';

const telemetry = otelMiddleware({
  tracer: trace.getTracer('alicante'),
  meter: metrics.getMeter('alicante'),
});
const stream = chat({
  adapter, messages, tools,
  middleware: [telemetry],
});
```

> Initialize the OTel SDK before this code. The middleware reports execution and provider-reported usage; a meter enables usage/duration metrics. A trace helps diagnose behavior but is not an evaluation of answer quality.

To build this: Requires an initialized OpenTelemetry SDK/exporter and @opentelemetry/api. This code slide does not provision a collector.

These are documentation examples, not additional live demos.

[OpenTelemetry](https://tanstack.com/ai/latest/docs/advanced/otel)

## 37 — Coding-agent harnesses

http://localhost:3100/#rc-harness

> Our Code Mode demo calculated with a few data tools. A coding-agent harness tackles a larger job: inspect a repository, edit files and run tests. The harness chooses the agent; the sandbox chooses where it executes. withSandbox attaches that environment to chat. Workspace permissions, provisioning and credentials are additional setup. This is an expansion path for a coding product, not a requirement for building a shopping assistant.

### Block 1: Connect a harness through chat

```tsx
import { chat } from '@tanstack/ai';
import { grokBuildText } from '@tanstack/ai-grok-build';
import { withSandbox } from '@tanstack/ai-sandbox';
import { sandbox } from './sandbox'; // provisioned by your app

const stream = chat({
  adapter: grokBuildText('grok-build'),
  messages: [{ role: 'user', content: 'Add a size selector. Run tests.' }],
  middleware: [withSandbox(sandbox)],
});
```

> The docs also describe Codex, Claude Code, OpenCode and ACP-compatible harnesses. Sandboxed coding runs have a broader lifecycle than the QuickJS function demo: workspaces, snapshots and durable runs require their own configuration.

To build this: Architecture example. Requires agent/provider packages, credentials, a provisioned sandbox, workspace and execution policy. No coding agent is launched by this slide.

These are documentation examples, not additional live demos.

[Harnesses](https://tanstack.com/ai/latest/docs/sandbox/harnesses) · [Sandbox quick start](https://tanstack.com/ai/latest/docs/sandbox/quick-start)

## 38 — Build it yourself

http://localhost:3100/#workshop

> If you would like to build this step by step, Vikas and I ran a four-hour workshop. Scan this code for the attendee repository, with starters, solutions and experiments. Thank you to Kitze for the inspiration behind the Jev cleanup demo. Thank you, React Alicante!

## Recovery

If a provider fails, show the visible error and retry only after checking it. Do not narrate a result that did not execute. Switch to explicitly labelled rehearsal if necessary. WebMCP needs supported Chrome; ordinary client-tool behavior is not proof of native WebMCP. The code snippets and recorded results remain useful for explaining an unavailable live step.
