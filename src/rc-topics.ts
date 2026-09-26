import type { CodeStep } from "./lessons";

export type RCTopic = {
  id: string;
  name: string;
  title: string;
  concept: string;
  example: string;
  setup: string;
  sources: [string, string][];
  script: string;
  steps: CodeStep[];
};
const docs = "https://tanstack.com/ai/latest/docs/";
export const rcTopics: RCTopic[] = [
  {
    id: "rc-providers",
    name: "Provider choice & type safety",
    title: "Choose the model. Keep your app.",
    concept:
      "Adapters connect provider APIs to the same application primitives. Model capabilities still differ.",
    example:
      "Vamos Alicante can change its text provider without redesigning the React chat.",
    setup:
      "Server examples. The OpenAI adapter shown needs its own server-side credential. Our live text demos use Nebius.",
    sources: [
      ["Per-model type safety", docs + "advanced/per-model-type-safety"],
    ],
    script:
      "The RC announcement reported 24 provider adapters. That is the count in that announcement, not a permanent limit. An adapter connects the provider to TanStack’s API. We use Nebius today. This example uses a different adapter to show the common shape. TypeScript can reject options unsupported by a known model. That does not mean every provider supports every feature, or that a model’s answer is correct.",
    steps: [
      {
        title: "The shared entry point",
        file: "Server-side adapter example",
        code: `import { chat } from '@tanstack/ai';
import { openaiText } from '@tanstack/ai-openai';

const stream = chat({
  adapter: openaiText('gpt-5'),
  messages: [{ role: 'user', content: 'Describe the Vamos Alicante beach shop in one sentence.' }],
});`,
        explanation:
          "chat owns the application-facing call. The adapter identifies the provider and model. Keep the credential on the server; changing adapters also requires checking that model’s supported tools and output modes.",
      },
      {
        title: "Catch unsupported options early",
        file: "Intentional compile-time error",
        code: `chat({
  adapter: openaiText('gpt-4-turbo'),
  messages: [],
  modelOptions: {
    // @ts-expect-error: this model does not expose this option
    text: {},
  },
});`,
        explanation:
          "This is deliberately invalid: the adapter’s model metadata excludes text for this model. Type safety checks API contracts. Runtime validation and evaluations are still needed for external data and model behavior.",
      },
    ],
  },
  {
    id: "rc-transports",
    name: "AG-UI & transport choices",
    title: "Same events. Different delivery.",
    concept:
      "AG-UI describes the events. SSE, HTTP streaming and WebSockets describe how they reach React.",
    example:
      "Vamos Alicante can stream over ordinary HTTP now, or use a persistent connection later.",
    setup:
      "Alternative React connections, not three simultaneous connections. Each needs a matching server implementation.",
    sources: [["Connection adapters", docs + "chat/connection-adapters"]],
    script:
      "AG-UI is the vocabulary: a run started, text arrived, a tool was called, the run finished. It is not another name for SSE. In our demos SSE carries those events. TanStack also has HTTP streaming, WebSocket and custom connection adapters. We change the connection implementation and pair it with the right server response; we do not rewrite our entire message interface.",
    steps: [
      {
        title: "Use SSE for the demo",
        file: "React client",
        code: `import { useChat, fetchServerSentEvents } from '@tanstack/ai-react';

const { messages, sendMessage, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});
// Server pairs this with toServerSentEventsResponse(stream).`,
        explanation:
          "useChat consumes named events and updates messages. Stop requests cancellation. Our current demos use this path.",
      },
      {
        title: "Choose another connection",
        file: "Alternative client adapters",
        code: `import { fetchHttpStream, webSocket } from '@tanstack/ai-react';

const http = fetchHttpStream('/api/chat-http');
// Server: toHttpResponse(stream)

const socket = webSocket('/api/chat-ws');
// Server: toWebSocketStream or toWebSocketResponse
// Pass ONE of these as useChat({ connection }).`,
        explanation:
          "HTTP streaming uses NDJSON; WebSockets keep a bidirectional connection. Custom adapters can implement other transports. Adding a WebSocket URL alone does not create its server route or durability store.",
      },
    ],
  },
  {
    id: "rc-media",
    name: "Media generation",
    title: "Vamos Alicante needs a mascot. And a voice.",
    concept:
      "Images, video, audio, speech, transcription, music and realtime audio extend beyond chat. Support depends on the selected adapter and model.",
    example:
      "Generate a sun mascot, then render the result in your own React component.",
    setup:
      "Documentation example; media generation is not connected in this demo app. Requires a media-capable provider, credentials and the /api/image route.",
    sources: [
      ["Image generation", docs + "media/image-generation"],
      ["Generation hooks", docs + "media/generation-hooks"],
    ],
    script:
      "The same toolkit also covers media. Here is the smallest example: generate a mascot on the server, then use a React generation hook to show it. The hook exposes loading and result state. Different modalities need different adapters and sometimes job polling or streaming. Our product-comparison demo generates structured text; it does not generate an image. This slide shows how we could add that next.",
    steps: [
      {
        title: "Generate on the server",
        file: "Inside a validated image route",
        code: `import { generateImage } from '@tanstack/ai';
import { openaiImage } from '@tanstack/ai-openai';

const result = await generateImage({
  adapter: openaiImage('dall-e-3'),
  prompt: 'A smiling sun over a beach bag, editorial illustration',
});
// In your route: return Response.json(result);`,
        explanation:
          "generateImage is a media activity, not a chat tool call. The adapter reads its provider key on the server. This model returns image URLs; other adapters may return base64 data.",
      },
      {
        title: "Keep rendering in React",
        file: "React component excerpt",
        code: `import { useGenerateImage } from '@tanstack/ai-react';

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
// Render result.images using the adapter's URL or base64 format.`,
        explanation:
          "The hook coordinates the request and exposes the result. Supply a real route that validates the incoming prompt; the server snippet’s fixed prompt is only the minimal first example.",
      },
    ],
  },
  {
    id: "rc-rag",
    name: "Embeddings, reranking & RAG",
    title: "Answer from the shop’s actual policies.",
    concept:
      "Retrieve relevant sources, rank them, then give the selected evidence to the model. Retrieval-augmented generation does not retrain the model.",
    example:
      "“Can I return my beach towel?” should use Vamos Alicante’ policy, not a plausible guess.",
    setup:
      "Server examples. Supply your document index, retrieval code, authorized source text and relevant provider credentials.",
    sources: [
      ["Embeddings", docs + "embeddings"],
      ["Reranking", docs + "rerank/rerank"],
    ],
    script:
      "An embedding converts text into a vector we can compare for similarity. Our database uses those vectors to find candidate policy passages. A reranker sorts those candidates for the current question. Then we pass selected passages and their source links to the answer-generation step. TanStack provides embedding and reranking calls. We still supply the index, access checks and evidence-handling behavior.",
    steps: [
      {
        title: "Embed the query",
        file: "Retrieval preparation",
        code: `import { embed } from '@tanstack/ai';
import { openaiEmbedding } from '@tanstack/ai-openai';

const query = await embed({
  adapter: openaiEmbedding('text-embedding-3-small'),
  input: 'Can I return my beach towel?',
});
const vector = query.embeddings[0].vector;
// Search your index: document vectors must use the same model.`,
        explanation:
          "The vector is a search representation, not an answer. Index documents first; retrieve only passages the current user may access. Embeddings alone are not a complete RAG pipeline.",
      },
      {
        title: "Rank evidence before answering",
        file: "After candidate retrieval",
        code: `import { rerank } from '@tanstack/ai';
import { cohereRerank } from '@tanstack/ai-cohere';

const { rerankedDocuments } = await rerank({
  adapter: cohereRerank('rerank-v3.5'),
  query: 'Can I return my beach towel?',
  documents: candidatePolicyPassages, // from your retrieval code
  topN: 3,
});
// Give these passages + source links to chat().`,
        explanation:
          "The reranker prioritizes evidence; chat generates the final answer. Keep original source IDs alongside the selected passages so the interface can cite them. Handle missing evidence explicitly.",
      },
    ],
  },
  {
    id: "rc-memory",
    name: "Agent memory",
    title: "Remember preferences across visits.",
    concept:
      "Memory recalls relevant context. Persistence saves the conversation. They solve different problems.",
    example:
      "Vamos Alicante remembers that this shopper prefers quiet, minimalist merchandise.",
    setup:
      "Requires @tanstack/ai-memory. This development adapter stores records only in one process and loses them on restart.",
    sources: [["Memory quickstart", docs + "memory/quickstart"]],
    script:
      "Suppose a shopper tells Vamos Alicante they prefer minimalist designs. Memory middleware can recall relevant context in a later turn and save the new exchange. That is different from restoring an entire chat transcript. The scope must come from our authenticated server session. This in-memory adapter is useful for learning; a shared durable adapter is needed when the service restarts or runs across multiple processes.",
    steps: [
      {
        title: "Attach scoped recall and save",
        file: "Server-side memory configuration",
        code: `import { memoryMiddleware } from '@tanstack/ai-memory';
import { inMemory } from '@tanstack/ai-memory/in-memory';

const memory = inMemory(); // module scope: reuse across requests

// Inside your authenticated chat route:
const stream = chat({
  adapter, messages,
  middleware: [memoryMiddleware({
    adapter: memory,
    scope: { userId: session.user.id, threadId },
  })],
});`,
        explanation:
          "adapter, messages, session and threadId come from your server setup. The middleware recalls and saves through the memory adapter. Do not accept an arbitrary browser-supplied user ID as an authorization boundary.",
      },
    ],
  },
  {
    id: "rc-mcp",
    name: "Remote MCP & generated types",
    title: "Connect tools outside your application.",
    concept:
      "MCP connects service capabilities to an agent. WebMCP publishes capabilities of the current browser page.",
    example:
      "Vamos Alicante asks an inventory MCP service about stock; WebMCP changes the shop’s visible filters.",
    setup:
      "Requires @tanstack/ai-mcp and a real authorized MCP server. Example URL and generated file are placeholders.",
    sources: [
      ["Managed MCP", docs + "tools/mcp-managed"],
      ["MCP type generation", docs + "tools/mcp-codegen"],
    ],
    script:
      "We just saw page-local WebMCP. Remote MCP is a different boundary: the backend connects to a service exposing tools. TanStack can discover its tools and manage the connection lifecycle. The type generator records the server’s declared names. Runtime-discovered arguments are still unknown; use explicit tool definitions and schemas for typed, validated inputs. Generated types are not a substitute for authorization.",
    steps: [
      {
        title: "Connect and manage the lifecycle",
        file: "Server-side MCP example",
        code: `import { createMCPClient } from '@tanstack/ai-mcp';

const inventory = await createMCPClient({
  transport: { type: 'http', url: process.env.MCP_URL! },
});
const stream = chat({
  adapter, messages,
  mcp: { clients: [inventory], connection: 'close' },
});`,
        explanation:
          "Configure required authentication and tool filtering on your client. chat discovers the tools and closes this per-run connection. For mutating service tools, define approval and server-side access controls.",
      },
      {
        title: "Generate names; validate arguments",
        file: "Code generation workflow",
        code: `// 1. Configure the server in mcp.config.ts.
// 2. Run: npx @tanstack/ai-mcp generate

import type { InventoryServer } from './mcp-types.generated';
const client = await createMCPClient<InventoryServer>({
  transport: { type: 'http', url: process.env.MCP_URL! },
});
const tools = await client.tools();
// Names are narrowed. Discovery-path arguments stay unknown.
// Use client.tools([toolDefinition(...)]) for typed schemas.`,
        explanation:
          "InventoryServer is emitted for a server you configure, not a built-in TanStack type. Regenerate when the server changes. Explicit definitions add runtime schema validation and typed arguments.",
      },
    ],
  },
  {
    id: "rc-persistence",
    name: "Persistence & stream durability",
    title: "A refresh should not lose the conversation.",
    concept:
      "Persistence stores thread state. Durability records stream events so a client can reconnect to a run.",
    example:
      "A shopper reloads during a long comparison: restore their chat, then reconnect to the unfinished response.",
    setup:
      "Example integration only. Supply a persistence backend, stable IDs, ownership checks and client restoration/joinRun wiring. memoryStream is single-process development storage.",
    sources: [
      ["Chat persistence", docs + "persistence/chat-persistence"],
      ["Resumable streams", docs + "resumable-streams/overview"],
    ],
    script:
      "There are two layers here. Persistence saves the transcript and run state. Durability logs ordered stream events and resumes delivery. Neither means our current in-memory demo suddenly survives a restart. A production app supplies storage and access checks, and restores the client’s thread and run identity. The GET replay does not call the model again. It also cannot magically restart a producer that has died.",
    steps: [
      {
        title: "Save authoritative thread state",
        file: "Inside the server chat route",
        code: `import { withPersistence } from '@tanstack/ai-persistence';
import { persistence } from './persistence'; // your backend

const stream = chat({
  adapter,
  messages: params.messages,
  threadId: params.threadId,
  runId: params.runId,
  ...(params.resume ? { resume: params.resume } : {}),
  middleware: [withPersistence(persistence)],
});`,
        explanation:
          "Your backend implements the stores. Preserve resume data for interrupted runs. Database-backed stores can survive restarts; a local in-memory stand-in cannot.",
      },
      {
        title: "Record and replay stream events",
        file: "POST response and GET replay",
        code: `import { memoryStream, toServerSentEventsResponse,
  resumeServerSentEventsResponse } from '@tanstack/ai';

// In POST, after creating stream:
return toServerSentEventsResponse(stream, {
  durability: { adapter: memoryStream(request) },
});

// In GET, after checking access to the run:
return resumeServerSentEventsResponse({
  adapter: memoryStream(request),
});`,
        explanation:
          "These are excerpts from two separate route handlers. For multiple processes use an external durability adapter. Reconnect can replay delivery; one-time side effects around POST must be guarded against repeat execution.",
      },
      {
        title: "Rejoin from the client",
        file: "React after restoring the run ID",
        code: `const { messages, joinRun } = useChat({
  connection: fetchServerSentEvents('/api/chat'),
});

// After loading the authorized conversation and active run:
await joinRun(activeRunId);`,
        explanation:
          "Client restoration is part of the feature, not just server middleware. The app obtains the correct active run from its authenticated store. joinRun uses the replay endpoint; SSE event IDs support reconnect and deduplication.",
      },
    ],
  },
  {
    id: "rc-telemetry",
    name: "Composable middleware & telemetry",
    title: "See where an agent spends its time.",
    concept:
      "Middleware adds lifecycle behavior. OpenTelemetry connects model turns and tool execution to your tracing system.",
    example:
      "Was Vamos Alicante slow because of inference, a stock lookup, or repeated tool calls?",
    setup:
      "Requires an initialized OpenTelemetry SDK/exporter and @opentelemetry/api. This code slide does not provision a collector.",
    sources: [["OpenTelemetry", docs + "advanced/otel"]],
    script:
      "Once an agent makes several calls, a single request duration does not explain much. The telemetry middleware gives us a chat span, model-call spans and tool-call spans. Our existing OpenTelemetry setup exports them. Skills, memory and persistence also compose through middleware. Stream durability is separate: it belongs on the streaming response. Keep content capture intentional because prompts and tool results may contain private data.",
    steps: [
      {
        title: "Add tracing to the same chat call",
        file: "Server-side instrumentation",
        code: `import { otelMiddleware } from '@tanstack/ai/middlewares/otel';
import { trace, metrics } from '@opentelemetry/api';

const telemetry = otelMiddleware({
  tracer: trace.getTracer('alicante'),
  meter: metrics.getMeter('alicante'),
});
const stream = chat({
  adapter, messages, tools,
  middleware: [telemetry],
});`,
        explanation:
          "Initialize the OTel SDK before this code. The middleware reports execution and provider-reported usage; a meter enables usage/duration metrics. A trace helps diagnose behavior but is not an evaluation of answer quality.",
      },
    ],
  },
  {
    id: "rc-harness",
    name: "Coding-agent harnesses",
    title: "From using the shop to editing its code.",
    concept:
      "A harness selects the coding agent. A sandbox provides its execution environment. Code Mode runs smaller programs over bound tools.",
    example:
      "“Add a size selector to Vamos Alicante, run the tests, and show me the diff.”",
    setup:
      "Architecture example. Requires agent/provider packages, credentials, a provisioned sandbox, workspace and execution policy. No coding agent is launched by this slide.",
    sources: [
      ["Harnesses", docs + "sandbox/harnesses"],
      ["Sandbox quick start", docs + "sandbox/quick-start"],
    ],
    script:
      "Our Code Mode demo calculated with a few data tools. A coding-agent harness tackles a larger job: inspect a repository, edit files and run tests. The harness chooses the agent; the sandbox chooses where it executes. withSandbox attaches that environment to chat. Workspace permissions, provisioning and credentials are additional setup. This is an expansion path for a coding product, not a requirement for building a shopping assistant.",
    steps: [
      {
        title: "Connect a harness through chat",
        file: "Server-side harness example",
        code: `import { chat } from '@tanstack/ai';
import { grokBuildText } from '@tanstack/ai-grok-build';
import { withSandbox } from '@tanstack/ai-sandbox';
import { sandbox } from './sandbox'; // provisioned by your app

const stream = chat({
  adapter: grokBuildText('grok-build'),
  messages: [{ role: 'user', content: 'Add a size selector. Run tests.' }],
  middleware: [withSandbox(sandbox)],
});`,
        explanation:
          "The docs also describe Codex, Claude Code, OpenCode and ACP-compatible harnesses. Sandboxed coding runs have a broader lifecycle than the QuickJS function demo: workspaces, snapshots and durable runs require their own configuration.",
      },
    ],
  },
];
export const rcById = Object.fromEntries(rcTopics.map((t) => [t.id, t]));
export const rcAnnouncement = "https://tanstack.com/blog/tanstack-ai-rc";
export const rcOverview = [
  [
    "Chat & agents",
    "Conversations, tools, typed output and interrupts",
    "#agent-feature",
  ],
  [
    "Provider choice",
    "24 adapters reported at RC; model-specific typing",
    "#rc-providers",
  ],
  ["Streaming", "AG-UI events over your chosen connection", "#rc-transports"],
  ["Media", "Images, video, audio and voice interfaces", "#rc-media"],
  ["RAG & memory", "Find evidence and recall relevant context", "#rc-rag"],
  ["MCP", "Discover service tools and generate types", "#rc-mcp"],
  [
    "Persistence & durability",
    "Save thread state and resume event delivery",
    "#rc-persistence",
  ],
];
