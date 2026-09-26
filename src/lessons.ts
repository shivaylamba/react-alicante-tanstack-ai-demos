import { rcTopics } from "./rc-topics";
export type CodeStep = {
  title: string;
  file: string;
  code: string;
  explanation: string;
};
export type Lesson = {
  id: string;
  name: string;
  title: string;
  concept: string;
  example: string;
  api: string;
  takeaway: string;
  steps: CodeStep[];
  script: string;
};
export const lessons: Lesson[] = [
  {
    id: "shopchat",
    name: "Streaming",
    title: "Start rendering before the answer is finished.",
    concept:
      "A model produces text incrementally. A stream lets React display that text as it arrives, and lets the user stop waiting.",
    example:
      "Ask which beach essentials fit your budget and watch the shopping advice appear as it streams.",
    api: "chat() · SSE · useChat() · stop()",
    takeaway:
      "SSE carries the events. AG-UI describes the events. React renders the state.",
    script:
      "A normal JSON endpoint waits for a complete result. Here the HTTP response stays open while events arrive. TanStack AI gives those events a consistent format, and useChat turns them into React state. Watch the response arrive, then try Stop. Our provider choice today is Nebius; the application pattern is the important part.",
    steps: [
      {
        title: "Start a generation",
        file: "server/app.ts",
        code: `const stream = chat({
  adapter: model,
  messages: params.messages,
  systemPrompts: [prompts.shopchat],
  abortController: controller,
});`,
        explanation:
          "The adapter connects to our chosen provider on the server. Messages supply the conversation. The AbortController lets a disconnected or cancelled request stop work. This is the text-only path, with no tools registered.",
      },
      {
        title: "Transport the events",
        file: "server/app.ts",
        code: `return toServerSentEventsResponse(guarded(), {
  abortController: controller,
});`,
        explanation:
          "The route returns an HTTP event stream. The supplied guarded generator forwards chunks and cleans up the timeout and disconnect listener. AG-UI is the event vocabulary; SSE is the transport.",
      },
      {
        title: "Connect React",
        file: "src/demos.tsx",
        code: `const { messages, sendMessage, isLoading, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat/shopchat'),
});

// Event handlers in our interface:
await sendMessage(input);
stop();`,
        explanation:
          "The hook holds conversation state and connects it to our route. The submit handler sends the prompt; a separate Stop button cancels the active run. These are separate UI actions, not consecutive statements in one handler.",
      },
    ],
  },
  {
    id: "product", name: "Structured output",
    title: "Turn a shopping question into comparison cards.",
    concept: "A schema gives React predictable fields. Product IDs link model recommendations to our actual catalog.",
    example: "Compare a towel and water bottle for a beach afternoon. Render real names, prices and stock beside each reason.",
    api: "outputSchema · Zod · React",
    takeaway: "The model supplies a shortlist. The catalog supplies the facts.",
    script: "The shopper is choosing products, not building a website. We ask for product IDs and short reasons in a known shape. React validates that shape, looks up each ID in our own catalog, and renders comparison cards. The model cannot invent the displayed price. This is a shortlist; it has not changed the cart. Next we will ask code to calculate a precise bundle quote.",
    steps: [
      { title: "Constrain the recommendation", file: "src/contracts.ts", code: `const comparisonSchema = z.object({
  heading: z.string().min(1).max(80),
  picks: z.array(z.object({
    productId: z.enum(['towel', 'water', 'sticker', 'fan']),
    reason: z.string().min(1).max(140),
  }).strict()).min(2).max(3),
}).strict(); // Full schema also rejects duplicate IDs.`, explanation: "The model returns IDs and reasons, never prices or HTML. This demo allowlists available products; a production catalog would need a dynamic lookup and current stock validation." },
      { title: "Request data, not markup", file: "server/app.ts", code: `chat({ ...options, outputSchema: comparisonSchema, stream: true });`, explanation: "The prompt supplies the fictional catalog. We wait for complete validated structured output before rendering cards." },
      { title: "Join with trusted catalog facts", file: "src/demos.tsx", code: `const parsed = comparisonSchema.safeParse(structured.data);
// ProductPreview receives only validated data:
const product = inventory.find(p => p.id === pick.productId)!;
// React renders product.name, product.price, product.stock and pick.reason.`, explanation: "Names, prices and availability come from the same catalog as the tools. Model-written reasons remain suggestions; schema validation alone does not prove the quality of advice." },
    ],
  },
  {
    id: "agent",
    name: "Tools & agents",
    title: "Let the model ask your code for facts.",
    concept:
      "A tool call is a structured request to execute a function. An agent can use the result to choose another step.",
    example:
      "Find in-stock beach essentials, then calculate a quote under €25. No imaginary prices.",
    api: "toolDefinition() · .server() · maxIterations()",
    takeaway:
      "Model → tool request → application result → model. Repeat within a budget.",
    script:
      "The model cannot inspect our stock by guessing. We give it two capabilities: read the catalog and calculate a quote. It chooses the calls and arguments. Our code checks stock, adds prices and enforces the spending cap. This repeated model-tool-result cycle is what we mean by an agent here.",
    steps: [
      {
        title: "Define the contract",
        file: "src/contracts.ts",
        code: `const quoteInput = z.object({
  ids: z.array(z.string()).min(1).max(5),
  budget: z.number().min(1).max(200),
});
// quoteDef uses this inputSchema and a typed outputSchema.`,
        explanation:
          "The model requests a named tool with JSON arguments. It supplies IDs and a budget, not arbitrary executable code. Input validation happens before those values are used.",
      },
      {
        title: "Implement trusted work",
        file: "server/app.ts / src/contracts.ts",
        code: `catalogDef.server(async () => ({ items: inventory }));
quoteDef.server(async (input) => quoteKit(input));

// Inside quoteKit:
const budget = Math.min(input.budget, 25);
const total = items.reduce((sum, item) => sum + item.price, 0);
if (total > budget) throw new Error('Kit exceeds the requested budget');`,
        explanation:
          "server means these handlers execute on our backend. quoteKit also checks IDs, stock and duplicate items. The model cannot raise the trusted €25 ceiling by changing its argument.",
      },
      {
        title: "Bound the loop",
        file: "server/app.ts",
        code: `chat({
  ...options,
  tools,
  agentLoopStrategy: maxIterations(4),
});`,
        explanation:
          "The loop allows the model to react to tool results. Four iterations limit repeated generation; the route additionally caps tool calls and wall-clock duration. Inspect the actual calls in the demo.",
      },
    ],
  },
  {
    id: "approval", name: "Human approval",
    title: "A recommendation is not a cart change.",
    concept: "Pause before changing application state. Show exactly what the user is approving.",
    example: "Propose one towel and one bottle. Deny: the bag stays empty. Approve: the demo cart becomes €18.",
    api: "needsApproval · interrupts · .client()",
    takeaway: "The model proposes. The button approves. Code updates the cart.",
    script: "We have compared the products and checked the total. Now I ask to add the towel and bottle. The assistant calls add_to_cart, but needsApproval pauses it. Notice the cart is still empty. The card lists exact products and catalog prices. Deny leaves the bag unchanged. Approve runs our client implementation, validates the IDs, stock and combined €25 cap, then changes React state. The cart remains visible across slides. It is a local demo cart, not a real order or payment; a production cart would need backend validation and authorization.",
    steps: [
      { title: "Pause at the cart boundary", file: "src/contracts.ts", code: `const cartDef = toolDefinition({
  name: 'add_to_cart',
  inputSchema: z.object({
    ids: z.array(z.enum(['towel', 'water', 'sticker', 'fan'])).min(1).max(4),
  }),
  outputSchema, // added, items, total, message
  needsApproval: true,
});`, explanation: "The tool requests catalog IDs, not model-generated prices. needsApproval creates a specific interrupt before execution." },
      { title: "Update the shared cart", file: "src/demos.tsx / src/storefront.tsx", code: `cartDef.client(async ({ ids }) => {
  const result = cart.add(ids);
  return { added: true, items: result.items, total: result.total,
    message: 'Demo cart updated. No order placed.' };
});
// cart.add combines IDs, deduplicates them, and calls quoteKit
// before changing shared React state. Invalid stock/budget rejects.`, explanation: "One of each product is supported. Repeated IDs cannot duplicate a cart line. The cart uses the same catalog and €25 spending rule as the quote." },
      { title: "Resolve the proposal", file: "src/demos.tsx", code: `const { interrupts, resuming } = useChat({ connection, tools });
// Separate buttons on the pending card:
interrupt.resolveInterrupt(true);  // Approve cart addition
interrupt.resolveInterrupt(false); // Deny`, explanation: "The cart stays unchanged before approval and after denial. Shared React state survives slide navigation, while a refresh resets this demo cart." },
    ],
  },
  {
    id: "jev",
    name: "Typed decisions",
    title: "Sometimes the answer is a choice, not a paragraph.",
    concept:
      "Ask a bounded question with known answer options. Application policy decides what to do with the result.",
    example:
      "Jev separates useful product content from six absurd homepage interruptions.",
    api: "decide() · choice() · Vercel AI Gateway",
    takeaway:
      "Typed choices constrain the answer shape. They do not guarantee correct judgment.",
    script:
      "Kitze inspired this one with Unclutter. Instead of generating a chat reply, Jev answers named questions about the page elements. Our code protects essential content regardless of the answer. Only eligible clutter above our confidence policy is hidden. Restore makes the change reversible.",
    steps: [
      {
        title: "Ask a typed question",
        file: "server/app.ts",
        code: `choice({
  instructions: 'Classify this element for the stated reading goal.',
  options: {
    keep: 'Useful for the reader goal',
    clutter: 'Interrupts or distracts from the goal',
    uncertain: 'Not enough evidence',
  },
});`,
        explanation:
          "The full route creates one question per known element. The model selects from these options; it never invents a DOM selector or supplies code for us to run.",
      },
      {
        title: "Use the decision adapter",
        file: "server/app.ts",
        code: `const answers = await decide({
  adapter: vercelGatewayDecider('typesafe-ai/jev'),
  state: { goal, elements },
  questions,
  abortSignal,
});`,
        explanation:
          "This request uses Jev through Gateway. State contains descriptions of this demo page, not screenshots or browsing history. This endpoint returns JSON rather than the chat event stream.",
      },
      {
        title: "Apply a reversible policy",
        file: "src/contracts.ts / src/demos.tsx",
        code: `return !!block && block.kind !== 'essential'
  && decision.category === 'clutter'
  && decision.probability >= 0.85
  && (decision.confidence === undefined
      || decision.confidence >= 0.85);

// Restore discards the hidden-element set.`,
        explanation:
          "Even a confident model decision cannot hide protected content. The threshold is our chosen demo rule, not a measured accuracy guarantee. Unknown and uncertain content stays visible.",
      },
    ],
  },
  {
    id: "webmcp",
    name: "WebMCP",
    title: "Give the browser agent a real page API.",
    concept:
      "WebMCP exposes named page actions with schemas, so agents can discover and execute them through the browser.",
    example:
      "“Show affordable in-stock items and switch to lavender.” The visible shop responds.",
    api: "useRegisterWebMCPTools() · usePageWebMCPTools()",
    takeaway:
      "These calls cross the browser’s native WebMCP registry. They change only this page.",
    script:
      "Clicking coordinates is a fragile way for an agent to use a site. WebMCP lets the page publish explicit capabilities instead. We register two client tools, then our TanStack chat discovers those tools from the browser. The model chooses them, and the browser executes the handlers. This is experimental browser support; the demo reports when it is unavailable.",
    steps: [
      {
        title: "Write a page action",
        file: "src/advanced-demos.tsx",
        code: `toolDefinition({
  name: 'alicante_set_theme',
  description: 'Change the Vamos Alicante catalog color theme on this page.',
  inputSchema: z.object({ theme: z.enum(['tomato', 'lime', 'lavender']) }),
  outputSchema: z.object({ theme: z.string() }),
}).client(async ({ theme }) => {
  setTheme(theme);
  return { theme };
});`,
        explanation:
          "The handler changes React state. The schema constrains the available themes. This tool has no authority to purchase, deploy, or modify another website.",
      },
      {
        title: "Register and discover",
        file: "src/advanced-demos.tsx / src/webmcp-compat.ts",
        code: `useRegisterWebMCPTools(registered, registrationOptions);
const discovered = usePageWebMCPTools(browserToolFilter);
const pageTools = normalizeNativeTools(discovered);
const chat = useChat({
  connection: fetchServerSentEvents('/api/chat/webmcp'),
  tools: pageTools,
});`,
        explanation:
          "Registration publishes executable client tools on document.modelContext. Discovery reads them back through the native browser API. The filter keeps only our Vamos Alicante tools. A small compatibility adapter handles Chrome’s JSON-string schema and argument format while still calling the native registry. Leaving the demo removes its registrations.",
      },
      {
        title: "Accept browser tool declarations",
        file: "server/app.ts",
        code: `const tools = mergeAgentTools([], params.tools?.filter(
  tool => ['alicante_filter_catalog', 'alicante_set_theme'].includes(tool.name)
));
chat({ ...options, tools, agentLoopStrategy: maxIterations(4) });`,
        explanation:
          "The server receives tool descriptions from the client. It permits these named browser capabilities; their handlers still execute on the page. This demonstration uses an in-page agent, not an independent browser assistant.",
      },
    ],
  },
  {
    id: "skills",
    name: "Skills + Skillbox",
    title: "Same agent. A different playbook.",
    concept: "A skill is reusable instructions, not a tool implementation. Skillbox stores versioned playbooks; TanStack AI loads the one relevant to the task.",
    example: "Product advice uses the catalog and budget. Return questions load the shop’s policy.",
    api: "SkillSource · withSkills() · load_skill · Skillbox HTTP API",
    takeaway: "Skillbox stores the knowledge. TanStack AI orchestrates. Your app still controls execution.",
    script: "Kitze built Skillbox, a versioned library of agent playbooks. Our shopper asks for a towel and hydration within €25. The model loads beach-shopper and responds using the supplied catalog. Then the shopper asks whether a used towel can be returned. It loads returns-guide and explains our fictional 30-day, unused-condition policy. Skillbox stores those instructions; TanStack withSkills exposes the catalog and load_skill. Watch the real revision receipt. No skill executes code or grants permission, and this uses Skillbox HTTP rather than its optional MCP or Jev recommendation paths.",
    steps: [
      {
        title: "Store a playbook in Skillbox",
        file: "skills/beach-shopper/SKILL.md",
        code: `---
name: beach-shopper
description: Help choose beach essentials within a budget.
---
Use only the supplied catalog for products, prices and stock.
Give the products, total and remaining budget.
For towel and hydration: one towel and one bottle, no extras.
Ask one follow-up question. Do not change the cart.`,
        explanation: "The setup script imports this Markdown into the real Skillbox service. The live demo reads it from Skillbox using a read-only client restricted to our two playbooks. Editing a skill there creates a new revision; setup does not overwrite your edits.",
      },
      {
        title: "Adapt the library to TanStack",
        file: "server/skillbox.ts",
        code: `// Focused excerpt: a custom SkillSource, not a built-in Skillbox adapter.
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
};`,
        explanation: "list fetches descriptions once per run. load fetches only the chosen body at that run’s pinned revision. The client key stays on our server. A missing service fails visibly; live mode never quietly substitutes an inline skill.",
      },
      {
        title: "Let the model select, then inspect the receipt",
        file: "server/app.ts",
        code: `const source = createSkillboxSource(controller.signal);
const stream = chat({
  ...options,
  middleware: [withSkills([source])],
  tools,
  agentLoopStrategy: maxIterations(4),
});
// React renders load_skill input/output and the Skillbox revision.`,
        explanation: "withSkills exposes the catalog and load_skill tool. The actual tool output proves which instructions arrived; the streamed text shows how the model applied them. Loading a skill does not execute scripts or grant permissions. Kitze’s Skillbox remains a separate project.",
      },
    ],
  },
  {
    id: "codemode",
    name: "Code Mode",
    title: "One program can coordinate several tool calls.",
    concept:
      "Instead of choosing each call in a separate model turn, the model writes a short program that composes permitted tools.",
    example:
      "Calculate what Vamos Alicante spends on meetings across three teams. The function replaces another meeting.",
    api: "createCodeMode() · execute_typescript · QuickJS",
    takeaway:
      "The model writes the program. An isolate runs it. Tools control its access.",
    script:
      "Ordinary tool use often returns control to the model after each result. Code Mode lets the model write a program that makes several calls, uses loops and does calculations before returning. Here it reads three fictional teams in parallel. We expose one read-only data tool and run the generated program in a small QuickJS isolate. No host files, secrets or network API are exposed to the generated code.",
    steps: [
      {
        title: "Expose one typed data tool",
        file: "server/advanced.ts",
        code: `toolDefinition({
  name: 'team_costs',
  description: 'Read fictional staffing and weekly one-hour meeting data.',
  inputSchema: z.object({
    team: z.enum(['engineering', 'marketing', 'leadership']),
  }),
  outputSchema,
}).server(async ({ team }) => teams[team]);`,
        explanation:
          "The complete handler also caps data reads. Code Mode exposes it inside the isolate as external_team_costs. The generated program has only the capabilities we bind.",
      },
      {
        title: "Create a bounded execution environment",
        file: "server/advanced.ts",
        code: `const { tool, systemPrompt } = createCodeMode({
  driver: createQuickJSIsolateDriver(),
  tools: [teamCosts],
  timeout: 3000,
  memoryLimit: 32,
});
// chat receives tools: [tool] and systemPrompt.`,
        explanation:
          "createCodeMode pairs the execution tool with instructions and typed function declarations. QuickJS runs the generated code with a 32 MB limit and an execution deadline. The model request also has its own timeout.",
      },
      {
        title: "Inspect the actual generated program",
        file: "src/advanced-demos.tsx",
        code: `const execution = tools.findLast(
  tool => tool.name === 'execute_typescript' && tool.output
);
const parsed = costResult.safeParse(execution?.output);
// Render validated totals and the actual tool input.typescriptCode.`,
        explanation:
          "The preceding demo shows the real program, not a prerecorded example. It should read three teams and calculate people × hourlyRate × meetingsPerWeek. We validate the returned shape before drawing the result.",
      },
    ],
  },
];
export const chapters = [
  { id: "welcome", name: "Building AI-Powered React Apps", kind: "title" },
  { id: "toolkit", name: "What is TanStack AI?", kind: "intro" },
  { id: "rc-overview", name: "The RC capability map", kind: "rc-overview" },
  { id: "how-it-works", name: "How the pieces connect", kind: "architecture" },
  ...rcTopics.slice(0, 2).map((t) => ({ id: t.id, name: t.name, kind: "rc" })),
  { id: "alicante", name: "What can it do? Meet Vamos Alicante.", kind: "story" },
  ...lessons.flatMap((lesson, i) => [
    {
      id: lesson.id + "-feature",
      name: lesson.name,
      kind: "feature",
      lesson: i,
    },
    { id: lesson.id, name: lesson.name + " · demo", kind: "demo", lesson: i },
    {
      id: lesson.id + "-code",
      name: lesson.name + " · code",
      kind: "code",
      lesson: i,
    },
    ...(i === 4
      ? [{ id: "recap", name: "What have we covered?", kind: "recap" }]
      : []),
  ]),
  { id: "takeaways", name: "Eight capabilities, one React app", kind: "recap" },
  ...rcTopics.slice(2).map((t) => ({ id: t.id, name: t.name, kind: "rc" })),
  { id: "workshop", name: "Build it yourself", kind: "closing" },
] as { id: string; name: string; kind: string; lesson?: number }[];

export const introScripts: Record<string, string> = {
  "rc-overview":
    "The release-candidate announcement describes a toolkit that extends well beyond a chat box. These seven areas show its scope. We will demonstrate the chat and agent building blocks, then use code examples for the additional capabilities. The article reported 24 provider adapters at RC. Support varies by model and adapter. The later capability slides are an optional deeper tour; they do not launch extra live services.",
  welcome:
    "Hello React Alicante! I’m Shivay. Today we are building AI-powered React applications with TanStack AI. We will connect each feature to something you can actually see, then look at the code that makes it work.",
  toolkit:
    "TanStack AI is an open-source TypeScript toolkit for connecting AI models, tools and application interfaces. It is not itself a model. We choose our provider and our React components. It handles the coordination: requests, streamed events, tool execution and interaction state. Today we use Nebius for text generation and Jev through Vercel AI Gateway for typed decisions.",
  "how-it-works":
    "React sends a task to our server. The server keeps the API key private and uses an adapter to call the model. The model can return text, structured data or a request to use a tool. Our code validates data and decides what can execute. For chat, named AG-UI events travel over SSE and useChat updates React. SSE is the delivery mechanism; AG-UI is the event vocabulary.",
  alicante:
    "Now let’s give these capabilities something to do. Vamos Alicante is a fictional beach-essentials shop for React Alicante attendees after the talks. You are the shopper: ask about products, compare options, get a checked quote, then approve an addition to your cart. Later we will remove distractions and let WebMCP filter the same catalog. Skills supply product and return-policy playbooks; Code Mode remains an optional operations example. The shop and its inventory are fictional. The API calls are real when the badge says live.",
  recap:
    "So far we have streamed a response, rendered typed data, looked up facts using tools, paused for human approval and applied typed decisions. Notice that these are different contracts. A structured output is data to render. A tool call is a request to execute. An approval is a decision about execution. Now we will add browser capabilities, reusable skills and generated programs.",
  takeaways:
    "These are eight different building blocks, not eight variations of a chat box. Streaming improves feedback. Structured output gives React predictable fields. Tools connect facts and actions. Approval preserves control. Typed decisions classify. WebMCP publishes page actions. Skills teach procedures. Code Mode composes tools into a program. The model contributes intelligence; our application owns the boundaries.",
  workshop:
    "If you would like to build this step by step, Vikas and I ran a four-hour workshop. Scan this code for the attendee repository, with starters, solutions and experiments. Thank you to Kitze for the inspiration behind the Jev cleanup demo. Thank you, React Alicante!",
};
