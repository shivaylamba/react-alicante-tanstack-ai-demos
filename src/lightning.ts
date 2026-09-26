import { lessons } from "./lessons";

export const lightningChapters = [
  { id: "welcome", name: "Building AI-Powered React Apps", kind: "title" },
  { id: "toolkit", name: "What is TanStack AI?", kind: "intro" },
  { id: "how-it-works", name: "How React connects to AI", kind: "architecture" },
  { id: "alicante", name: "Today we are building Vamos Alicante", kind: "story" },
  { id: "demo-roadmap", name: "Seven demos. One beach shop.", kind: "short-roadmap" },
  { id: "shopchat", name: "Streaming shopping assistant", kind: "demo", lesson: 0 },
  { id: "shopchat-code", name: "Streaming · code", kind: "demo-code", lesson: 0 },
  { id: "meme-founder", name: "The conference-to-beach transition", kind: "meme" },
  { id: "product", name: "Structured output", kind: "demo", lesson: 1 },
  { id: "product-code", name: "Product · code", kind: "demo-code", lesson: 1 },
  { id: "agent", name: "Tools & agents", kind: "demo", lesson: 2 },
  { id: "agent-code", name: "Agent · code", kind: "demo-code", lesson: 2 },
  { id: "meme-budget", name: "A developer goes shopping", kind: "meme" },
  { id: "approval", name: "Human approval", kind: "demo", lesson: 3 },
  { id: "approval-code", name: "Approval · code", kind: "demo-code", lesson: 3 },
  { id: "meme-internet", name: "Let me read the website", kind: "meme" },
  { id: "jev", name: "Jev cleanup", kind: "demo", lesson: 4 },
  { id: "jev-code", name: "Jev · code", kind: "demo-code", lesson: 4 },
  { id: "webmcp", name: "WebMCP page actions", kind: "demo", lesson: 5 },
  { id: "webmcp-code", name: "Webmcp · code", kind: "demo-code", lesson: 5 },
  { id: "skills", name: "Agent skills + Skillbox", kind: "demo", lesson: 6 },
  { id: "skills-code", name: "Skillbox · code", kind: "demo-code", lesson: 6 },
  { id: "one-pattern", name: "The pattern behind the storefront", kind: "short-code" },
  { id: "more", name: "And there is more", kind: "short-more" },
  { id: "workshop", name: "Build it with Shivay & Vikas", kind: "closing" },
] as { id: string; name: string; kind: string; lesson?: number }[];

export const lightningNotes: Record<
  string,
  { window: string; seconds: number; script: string; action: string; jokeExplanation?: string; jokeDelivery?: string }
> = {
  welcome: {
    window: "0:00–0:15",
    seconds: 15,
    script:
      "Hello React Alicante! I’m Shivay. Let’s see how TanStack AI turns a React application into something that can generate, decide and act.",
    action:
      "Advance immediately. This is the title, not a separate introduction.",
  },
  toolkit: {
    window: "", seconds: 30,
    script: "TanStack AI is an open-source TypeScript toolkit for adding AI features to applications. It is not the model itself. It coordinates model requests, streamed responses and tool calls, then gives React useful state to render. We choose the model provider, define the tools and keep our own components. Today we use Nebius for text and Jev through Vercel AI Gateway for typed decisions. Let’s see where those pieces live.",
    action: "Point to model connection, capabilities and interface. Advance to the request path; do not introduce Vamos Alicante yet.",
  },
  "how-it-works": {
    window: "", seconds: 25,
    script: "The React app sends a request to our server. The server validates it and talks to a model through an adapter. Our credentials stay there. As a chat response arrives, useChat updates the interface. AG-UI describes the chat events, and SSE transports them. The decision endpoint returns JSON. So the model supplies output, while our application controls data, actions and rendering. Let’s make that concrete with something we can actually see.",
    action: "Trace React → server → provider, then the returning result. Move on without a code detour.",
  },
  alicante: {
    window: "", seconds: 25,
    script: "Imagine you are leaving React Alicante for the beach. You open Vamos Alicante with twenty-five euros and need a towel and something to carry water. That is our entire story. You are the shopper. We will ask questions, compare actual products, check stock and price, and add the chosen items only after approval. This is a fictional catalog and local demo cart; no money changes hands.",
    action: "Point at the catalog: towel €12, bottle €6, and the out-of-stock parasol. Establish the shopper’s €25 goal.",
  },
  "demo-roadmap": {
    window: "", seconds: 16,
    script: "We will stream an answer, compare products, check a bundle with tools, approve the cart addition, remove distractions with Jev, and filter the page with WebMCP. Then we finish with Skillbox: reusable instructions for this same shop assistant. The catalog and cart stay consistent throughout.",
    action: "Follow the roadmap in order. Start with the plain streaming assistant; save Skillbox for the final demo.",
  },
  shopchat: {
    window: "", seconds: 35,
    script: "I’m the shopper, and I need a towel and something to carry water. Watch the answer appear as it is generated. React receives streamed events through useChat, so I can read before the answer is complete or press Stop. This first demo has catalog context but no tools and no Skillbox. It answers a question; it cannot change my cart. Next let’s turn advice into comparison cards.",
    action: "Click Ask the assistant with the beach-essentials preset. Point to the streamed text and Stop control, then open the streaming code slide.",
  },
  skills: {
    window: "", seconds: 35,
    script: "One final upgrade: reusable shop instructions. Can I return a towel after using it? The assistant loads returns-guide from Skillbox, Kitze’s versioned skill library, and explains our fictional policy: unused, original packaging, thirty days. The receipt shows the loaded revision. Skillbox stores the playbook; TanStack AI loads it through load_skill. Instructions guide an answer; they do not authorize refunds or cart changes. Another shoutout to Kitze for Skillbox.",
    action: "Click Can I return it?, then Ask the shop assistant. Show returns-guide and its revision receipt. Keep the product-advice preset for questions. Advance to the Skillbox code slide, then the recap.",
  },
  product: {
    window: "2:30–3:45",
    seconds: 45,
    script: "I need to choose, so let’s compare products. Instead of a paragraph, we request IDs and reasons in a schema. React joins those IDs to our catalog and renders cards. The towel’s twelve euros and the bottle’s six euros come from application data, not generated text. This is structured output: a shape our components can render. It is still a shortlist, not a cart action.",
    action: "Click Compare products. Point to the reasons, catalog prices and stock. Show its code slide next.",
  },
  agent: {
    window: "3:45–4:45",
    seconds: 45,
    script: "Now I want a checked bundle. The assistant requests the catalog tool, then calls the quote tool for a towel and bottle. Code checks availability and calculates eighteen euros, leaving seven. The repeated model, tool request, result, next decision cycle is the agent loop. A quote still does not change the cart.",
    action: "Click Build my beach kit. Inspect search_beach_catalog and quote_beach_kit. Expected default: towel + bottle, €18.",
  },
  approval: {
    window: "4:45–5:30",
    seconds: 35,
    script: "Now add those products. The assistant proposes add_to_cart. Look: the cart is still empty. The approval card names the towel and bottle with their catalog prices. I approve, the client tool executes, and the shared cart shows two items, eighteen euros. It follows us to the next demo. This is a real React state change in a demo cart, not an order or payment.",
    action: "Click Propose cart addition. Pause on the empty cart and named proposal, then Approve cart addition. Show two items and €18. Denial and budget checks are covered in rehearsal tests.",
  },
  jev: {
    window: "5:30–7:00",
    seconds: 55,
    script:
      "Sometimes the output should be a choice rather than a paragraph. This disaster of a homepage was inspired by Kitze’s Unclutter—catch his talk later. We ask Jev, through Vercel AI Gateway, to classify known page elements for a reading goal.\n\nOur application protects the useful product content and only hides eligible distractions that meet its decision policy. Watch the interruptions disappear. This is a typed decision, not model-generated JavaScript taking over the page. Restore makes it reversible.\n\nNow let’s move from deciding what should be visible to giving an agent explicit actions it can use on the page.",
    action:
      "Click Unclutter this disaster, show the before/after change, then Restore everything once. Give Kitze the shoutout here. Show the Jev code, then move directly to WebMCP.",
  },
  webmcp: {
    window: "7:00–8:30",
    seconds: 60,
    script:
      "An agent could try to click coordinates. Instead, the page publishes named capabilities with schemas: filter this catalog and change this theme. That is WebMCP. Our TanStack client registers and discovers those tools through Chrome’s native browser registry.\n\nI ask for affordable, in-stock items and a lavender shop. The model chooses the tools, the browser executes their handlers, and React updates the visible page. Here are the two actual executions.\n\nThis is our in-page agent using native WebMCP, not a separate browser assistant. It only controls this preview. Our final demo adds reusable instructions to the shop assistant with Skillbox.",
    action:
      "Confirm native status shows two discovered tools. Click Ask the page agent. Point at three items, lavender and the execution log. If support is unavailable, say so and explain the named tools; do not claim they executed.",
  },
  "one-pattern": {
    window: "8:30–9:30",
    seconds: 15,
    script:
      "This is the common shape behind the chat demos. On the server, chat receives an adapter, messages and the tools for that feature. The response sends a stream of events. In React, useChat consumes that stream and exposes state.\n\nA schema controls the shape of data. A tool implementation controls the work. An interrupt controls when it can proceed. Jev uses decide for typed decisions, and WebMCP supplies browser capabilities. The model contributes a decision; our application supplies the boundaries.",
    action:
      "Read the two short blocks from server to React. Recap the three boundaries in the footer; the individual code slides have already explained the APIs.",
  },
  more: {
    window: "",
    seconds: 23,
    script:
      "What we saw is only part of the toolkit. We just saw Skillbox supply reusable instructions. Code Mode lets an agent compose permitted tools into a small program. There are also media APIs, embeddings and reranking, memory, remote MCP, persistence, resumable streams, telemetry and coding-agent harnesses.\n\nThe remaining capabilities are for exploration after this talk. The full companion deck has examples and setup notes. You can explore those after the talk.",
    action:
      "Mention the capability groups once. Keep all of them on this one slide. Do not follow the full-deck link during the talk.",
  },
  workshop: {
    window: "10:15–10:40",
    seconds: 25,
    script:
      "If you want to build this instead of just watch it, Vikas and I ran a four-hour hands-on workshop. Scan this code for the attendee repository: starters, solutions and experiments. Thank you, React Alicante!",
    action:
      "Leave the QR visible. Keep the remaining twenty seconds as buffer. Stop by 11:00.",
  },
};
export const extraCapabilities = [
  ["Agent skills", "Load a relevant playbook on demand."],
  ["Code Mode", "Compose permitted tools in an isolated program."],
  [
    "Media & realtime voice",
    "Image, video, audio, speech, transcription and music.",
  ],
  ["RAG & memory", "Embeddings, reranking and context recall."],
  ["Remote MCP", "Connect service tools and generate their types."],
  ["Persistence & durability", "Save conversations and reconnect to streams."],
  ["Middleware & telemetry", "Observe execution and add lifecycle behavior."],
  ["Coding-agent harnesses", "Run coding agents in configured sandboxes."],
];
export const shortServerCode = `// Server · focused excerpt from the chat route
const stream = chat({
  adapter: model, // our configured provider
  messages: params.messages,
  tools,         // capabilities for this demo
  agentLoopStrategy: maxIterations(4),
});
return toServerSentEventsResponse(stream);`;
export const shortClientCode = `// React · one streaming connection
const { messages, sendMessage, stop } = useChat({
  connection: fetchServerSentEvents('/api/chat/agent'),
});

// Render messages with your own components.
// Approvals resolve a specific interrupt.
// WebMCP handlers update state on the page.`;

export const demoCode = [
  {
    title: "Stream from server to React.",
    blocks: [
      { ...lessons[0].steps[0], code: lessons[0].steps[0].code + "\n\n" + lessons[0].steps[1].code, explanation: "chat starts generation; the SSE response carries events back." },
      { ...lessons[0].steps[2], explanation: "useChat exposes React state. Send and Stop are separate UI handlers." },
    ],
    script: "On the left, chat starts generation and the route returns streamed events. On the right, useChat connects React to that route. The submit handler sends a message; the separate Stop handler cancels it. That is the streaming interface we just saw.",
    takeaway: "AG-UI describes the events. SSE transports them. React renders them.",
  },
  {
    title: "A shortlist becomes product cards.",
    blocks: [
      { ...lessons[1].steps[0], explanation: "Product IDs and short reasons define the recommendation contract." },
      { ...lessons[1].steps[1], title: "Request, validate, render", file: "server/app.ts → src/demos.tsx", code: lessons[1].steps[1].code + "\n\n// React\n" + lessons[1].steps[2].code, explanation: "outputSchema requests data; safeParse gates the catalog-backed cards." },
    ],
    script: "The schema defines product IDs and reasons. outputSchema asks for that shape. React validates it, then looks up the matching catalog records to display prices and stock. Recommendations do not mutate the cart.",
    takeaway: "Valid data shape does not prove factual accuracy.",
  },
  {
    title: "The model asks. Your code executes.",
    blocks: [
      { ...lessons[2].steps[1], explanation: "Server handlers read stock and calculate a budget-checked quote." },
      { ...lessons[2].steps[2], explanation: "Register the tools and bound the model–tool–result loop." },
    ],
    script: "The server implementations read our catalog and calculate a quote. The model chooses which tools to request, but these functions enforce the rules. Registering tools gives the model those capabilities. maxIterations bounds the repeated model-and-tool cycle.",
    takeaway: "The route also validates inputs, caps tool calls and enforces a deadline.",
  },
  {
    title: "Pause before executing the action.",
    blocks: [
      { ...lessons[3].steps[0], explanation: "needsApproval marks the tool as requiring a human decision." },
      { ...lessons[3].steps[2], explanation: "The buttons resolve that specific interrupt, not a chat message." },
    ],
    script: "needsApproval makes this tool pause before execution. useChat exposes the pending interrupt. These are separate Approve and Deny handlers, resolving that exact request. After approval, our client implementation validates the items and updates the shared cart.",
    takeaway: "The .client() handler changes the demo cart. Production checkout needs server authorization.",
  },
  {
    title: "Ask Jev for a choice, not prose.",
    blocks: [
      { ...lessons[4].steps[0], explanation: "Each known page element gets a question with allowed answers." },
      { ...lessons[4].steps[1], explanation: "The server sends descriptions and the reading goal through Gateway." },
    ],
    script: "choice defines the allowed answers: keep, clutter or uncertain. decide sends the questions and page descriptions to Jev through Gateway. Application policy then protects essential content and only hides eligible clutter. Restore reverses it. Next, let’s give the page explicit tools.",
    takeaway: "No generated selectors or executable code. Essential content stays protected.",
  },
  {
    title: "Publish a tool. Let the page respond.",
    blocks: [
      { ...lessons[5].steps[0], explanation: "A typed client handler changes the visible theme through React state." },
      { ...lessons[5].steps[1], explanation: "Register → discover through native WebMCP → provide tools to useChat." },
    ],
    script: "The client tool has a schema and a React implementation. Registration publishes it to the native browser registry. Discovery reads those tools back, and useChat exposes them to our in-page agent. The compatibility helper handles Chrome’s serialization format. Execution still crosses the native registry.",
    takeaway: "Native browser support is required. These tools control only this preview.",
  },
  {
    title: "A remote playbook becomes agent context.",
    blocks: [
      { ...lessons[6].steps[1], explanation: "Our SkillSource reads authorized descriptions, then the selected pinned revision." },
      { ...lessons[6].steps[2], explanation: "withSkills supplies load_skill; React shows the result and streams the answer." },
    ],
    script: "On the left, our custom SkillSource connects the Skillbox HTTP library to TanStack. list returns short descriptions; load returns the chosen version. On the right, withSkills gives the model the catalog and load_skill. The browser never receives the client key. This is a separate open-source project by Kitze, integrated with a small adapter.",
    takeaway: "Skillbox stores skills. TanStack applies them. Instructions are not execution permissions.",
  },
];
for (const [index, content] of demoCode.entries()) {
  const id = lessons[index].id + "-code";
  if (!lightningChapters.some(chapter => chapter.id === id)) continue;
  lightningNotes[id] = {
    window: "", seconds: 20, script: content.script,
    action: "Explain the left block, then the right block. Point at the takeaway. Advance after this focused explanation; the longer source walkthrough remains in the full deck.",
  };
}
lightningNotes["one-pattern"].script = "Across these demos, schemas control data shape, tool implementations control work, and interrupts capture a human decision. Models contribute output; our application owns the boundaries. Those are the pieces to remember.";

export const memeSlides: Record<string, { setup: string; left: string; right: string; leftIcon: string; rightIcon: string; punchline: string; script: string }> = {
  "meme-founder": {
    setup: "AFTER A DAY AT REACT ALICANTE",
    left: "I came here to learn hooks.", right: "My brain: useBeach().",
    leftIcon: "⚛️", rightIcon: "🏖️",
    punchline: "One more hook. Then the beach.",
    script: "One more hook. Then the beach. Let’s choose our products.",
  },
  "meme-budget": {
    setup: "A DEVELOPER GOES SHOPPING",
    left: "I needed a towel and a bottle.", right: "Naturally, I built an AI agent.",
    leftIcon: "🏖️", rightIcon: "🤖",
    punchline: "Shopping: 10 seconds. Building this: 3 days.",
    script: "I needed a towel and a bottle. Naturally, I built an AI agent. The shopping took ten seconds. This took three days.",
  },
  "meme-internet": {
    setup: "BROWSING THE MODERN WEB",
    left: "I’d like to read one sentence.", right: "First, meet our cookies, newsletter and CEO.",
    leftIcon: "🧑‍💻", rightIcon: "🍪",
    punchline: "The content is the Easter egg.",
    script: "The content is the Easter egg. Jev, help us out.",
  },
};
for (const [id, meme] of Object.entries(memeSlides)) {
  lightningNotes[id] = { window: "", seconds: id === "meme-budget" ? 8 : 4, script: meme.script,
    action: "Let the room read the visual. Deliver just the punchline, pause briefly, then advance. If the previous joke already got a laugh, skip this beat. Do not explain the joke." };
}
lightningNotes.product.action += " When the cards appear, point out that prices come from the catalog.";
lightningNotes.agent.action += " Point at the real total: ‘The beach kit has a budget. My conference merch habit doesn’t.’";
lightningNotes.approval.action += " On the pending card: ‘It can recommend the towel. It cannot spend my beach budget.’ Click Approve after the pause.";
lightningNotes.jev.action += " Let the clutter disappear before saying: ‘We found the product.’ Briefly hover Restore: ‘This button is sponsored by the growth team.’ No need to rerun.";
lightningNotes.webmcp.action += " After the actual tools succeed: ‘The budget is strict. The brand guidelines are lavender.’ Do not deliver the success joke before the page changes.";


// Presenter preparation only; never projected as slide content.
const jokeNotes = {
  "meme-founder": {
    "explanation": "React developers use hooks such as useState. The invented name useBeach sounds like another hook, but means your tired brain wants to leave the conference and relax at the beach. You are joking about yourself and the audience wanting a break.",
    "delivery": "Say “One more hook. Then the beach.” with a straight face. Let the useBeach text on the slide supply the React reference. Pause briefly and advance; do not explain hooks on stage."
  },
  "product": {
    "explanation": "“No imaginary discount” gently jokes about models inventing convincing facts. The useful point is that displayed prices come from your catalog, so the model cannot make up a sale. This is a light aside, not a big punchline.",
    "delivery": "Only say the line once the comparison cards appear. Point at a price, then continue explaining structured output. Skip it if you are behind schedule."
  },
  "agent": {
    "explanation": "The assistant sticks to the €25 limit, while you joke that you struggle to resist conference merchandise. “The beach kit has a budget. My conference merch habit doesn’t” is self-deprecating: the joke is your shopping habit, not the AI’s intelligence.",
    "delivery": "Wait for the real quote. Point at €18 and say the merch line. Use this OR “Seven euros left. The model is better at sticking to my budget than I am”—not both."
  },
  "meme-budget": {
    "explanation": "Buying a towel and bottle is a tiny task. Building an entire AI agent to do it takes far more effort than simply shopping. “Naturally” makes the unnecessary engineering sound like the obvious choice. The audience recognises the developer habit of automating a ten-second task for days. The three days is a comic exaggeration, not a project-timing claim.",
    "delivery": "Say “I needed a towel and a bottle” normally. Pause before “Naturally, I built an AI agent,” as if that decision was perfectly sensible. Finish “The shopping took ten seconds. This took three days.” Pause for a laugh, then advance. Do not explain the joke aloud."
  },
  "approval": {
    "explanation": "“It can recommend the towel. It cannot spend my beach budget” treats a small shopping decision like a serious spending approval. The mild joke also demonstrates the feature: making a recommendation does not grant permission to change the cart.",
    "delivery": "Point at the unchanged cart while the approval card is pending. Deliver the line, pause, then click Approve. Only describe the cart as changed after the result appears."
  },
  "meme-internet": {
    "explanation": "An Easter egg is a hidden surprise in software. Here, the actual content has become the hidden surprise because cookies, newsletter popups and promotional messages cover it. The audience recognises the frustration of trying to read a modern website.",
    "delivery": "Let the audience read the two panels. Say “The content is the Easter egg. Jev, help us out.” Move directly to the cluttered page so the next demo makes the joke visible."
  },
  "jev": {
    "explanation": "“We found the product” implies the page was so buried in interruptions that the shop was hard to find. “This button is sponsored by the growth team” jokes that a team focused on signups and conversions would want those promotional popups restored. There is no actual sponsor; it is a playful jab at overdoing marketing.",
    "delivery": "Show the clutter first. Click cleanup and wait for the visible change before saying “We found the product.” Then point to Restore and deliver the growth-team line. If people laugh, wait; do not speak over them. Never claim cleanup succeeded if it has not."
  },
  "webmcp": {
    "explanation": "“The budget is strict. The brand guidelines are lavender” pairs a practical shopping requirement with an unnecessarily serious colour preference. The small joke is treating a playful theme choice like an important business rule. It also points to the two different tools that just ran.",
    "delivery": "Wait until the filtered products and lavender theme are visible. Say the line while pointing at each change. Keep it casual; no long pause or explanation is needed."
  }
};
for (const [id, joke] of Object.entries(jokeNotes)) {
  lightningNotes[id].jokeExplanation = joke.explanation;
  lightningNotes[id].jokeDelivery = joke.delivery;
}

for (const id of Object.keys(lightningNotes)) {
  if (!lightningChapters.some(chapter => chapter.id === id)) delete lightningNotes[id];
}

// Presenter timing follows the narrative; slide count is not a time limit.
let elapsedSeconds = 0;
const clock = (value: number) => `${Math.floor(value / 60)}:${String(value % 60).padStart(2, "0")}`;
for (const chapter of lightningChapters) {
  const note = lightningNotes[chapter.id];
  note.window = `${clock(elapsedSeconds)}–${clock(elapsedSeconds + note.seconds)}`;
  elapsedSeconds += note.seconds;
}
