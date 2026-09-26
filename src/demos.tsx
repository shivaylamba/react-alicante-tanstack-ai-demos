import { useCart } from "./storefront";
import React, { useEffect, useMemo, useState } from "react";
import { fetchServerSentEvents, useChat } from "@tanstack/ai-react";
import {
  comparisonSchema,
  cartDef,
  catalogDef,
  quoteDef,
  blocks,
  inventory,
  quoteKit,
  type Comparison,
} from "./contracts";
import "@fontsource-variable/bricolage-grotesque";
import "@fontsource-variable/public-sans";
export const acts = [
  { id: "shopchat", title: "Ask the shop assistant.", feature: "Streaming + cancellation", prompt: "I am heading to the beach after React Alicante. What can I buy here for €25? Keep it short.", button: "Ask the assistant", takeaway: "Text arrives as events. React renders it before the model finishes." },
  { id: "comparison", title: "Which products suit my afternoon?", feature: "Structured output → comparison cards", prompt: "Compare useful products for a beach afternoon with a €25 budget. I need a towel and something for hydration. Explain each recommendation briefly.", button: "Compare products", takeaway: "AI supplies IDs and reasons. Our catalog supplies names, prices and stock." },
  { id: "agent", title: "Check my beach kit.", feature: "Server tools + bounded agent loop", prompt: "Build my beach kit under €25 with a towel and water bottle. Check stock and calculate the total before I decide.", button: "Build my beach kit", takeaway: "The model chooses tools. Code checks stock and calculates the price." },
  { id: "cart", title: "Add it to my cart—with my approval.", feature: "Client tool + human approval", prompt: "Add one beach towel and one reusable water bottle to my cart. Ask for approval before changing it.", button: "Propose cart addition", takeaway: "A suggestion does not change the cart. Approving this tool does." },
  { id: "cleanup", title: "Let me shop in peace.", feature: "decide() + Vercel AI Gateway", prompt: "I want to compare beach products and review my cart. Keep product and cart information. Remove promotional interruptions.", button: "Unclutter this disaster", takeaway: "Jev returns typed decisions. React applies reversible changes." },
];
const shopperPresets = [
  ['Beach essentials', acts[0].prompt],
  ['What is in stock?', 'Which products are in stock, and how much do they cost?'],
  ['Keep it under €10', 'Show me the available products priced at €10 or less.'],
];
export function ChatAct({
  act,
  active = true,
}: {
  act: (typeof acts)[number];
  active?: boolean;
}) {
  const cart = useCart();
  const [input, setInput] = useState(act.prompt),
    [actionError, setActionError] = useState(""),
    [events, setEvents] = useState<string[]>([]),
    [cartResult, setCartResult] = useState<string | null>(null);
  const clientTools = useMemo(() => [catalogDef, quoteDef,
    cartDef.client(async ({ ids }) => {
      const result = cart.add(ids);
      setCartResult('Added to your demo cart. Nothing purchased.');
      return { added: true, items: result.items, total: result.total, message: 'Demo cart updated. No order placed.' };
    }),
  ], [cart.add]);
  const {
    messages,
    sendMessage,
    isLoading,
    error,
    stop,
    interrupts,
    resuming,
  } = useChat({
    connection: fetchServerSentEvents("/api/chat/" + act.id),
    tools: clientTools,
    ...(act.id === "comparison" ? { outputSchema: comparisonSchema } : {}),
    onChunk(chunk) {
      if (
        [
          "RUN_STARTED",
          "TOOL_CALL_START",
          "TOOL_CALL_END",
          "TOOL_CALL_RESULT",
          "RUN_FINISHED",
          "RUN_ERROR",
        ].includes(chunk.type)
      )
        setEvents((v) => [
          ...v.slice(-11),
          chunk.type === "TOOL_CALL_START"
            ? `TOOL: ${chunk.toolCallName}`
            : chunk.type,
        ]);
    },
  });
  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);
  const pending = interrupts.some((i) => i.status === "pending");
  const assistant = messages.filter((m) => m.role === "assistant");
  const text = assistant
    .flatMap((m) =>
      m.parts.filter((p) => p.type === "text").map((p) => p.content),
    )
    .join("\n");
  const structured = messages
    .flatMap((m) => m.parts)
    .filter((p) => p.type === "structured-output" && p.status === "complete")
    .at(-1);
  const parsed =
    structured && "data" in structured
      ? comparisonSchema.safeParse(structured.data)
      : null;
  const toolParts = messages
    .flatMap((m) => m.parts)
    .filter((p) => p.type === "tool-call");
  const quote = toolParts.findLast(
    (p) => p.name === "quote_beach_kit" && p.output,
  )?.output as any;
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setActionError("");
    try {
      await sendMessage(input);
    } catch (e) {
      setActionError(e instanceof Error ? e.message : "Request failed");
    }
  }
  return (
    <div className="chat-act">
      <section className="prompt-column">
        <form onSubmit={submit}>
          <label htmlFor={`${act.id}-prompt`}>
            {act.id === "shopchat" ? "Ask about the products" : "Give it a task"}
          </label>
          {act.id === "shopchat" && <div className="shopchat-presets" aria-label="Shopping questions">
            {shopperPresets.map(([label, prompt]) => <button type="button" key={label} disabled={isLoading} onClick={() => setInput(prompt)}>{label}</button>)}
          </div>}
          <textarea
            id={`${act.id}-prompt`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={2000}
          />
          <div className="form-actions">
            <button
              className="primary"
              disabled={!input.trim() || isLoading || pending}
            >
              {act.button} ↗
            </button>
            <button type="button" disabled={!isLoading} onClick={stop}>
              Stop
            </button>
          </div>
        </form>
        <div className="run-status" role="status">
          <span className={isLoading ? "pulse" : ""} />
          {pending
            ? "Waiting for your decision"
            : isLoading
              ? "Model working…"
              : messages.length
                ? "Run complete"
                : "Ready when you are"}
        </div>
        <div className="event-list" aria-label="Run events">
          <h3>UNDER THE HOOD</h3>
          {events.length ? (
            events.map((e, i) => (
              <div key={i}>
                <span>{String(i + 1).padStart(2, "0")}</span>
                {e}
              </div>
            ))
          ) : (
            <p>The live event sequence will appear here.</p>
          )}
        </div>
        {(error || actionError) && (
          <p className="error" role="alert">
            {error?.message || actionError}
          </p>
        )}
      </section>
      <section
        className={`result-column result-${act.id}`}
        aria-label="Demo result"
        aria-live="polite"
      >
        {act.id === "shopchat" && (
          <>
            <div className="shopchat-mark">“</div>
            <div className="shopchat-text">
              {text || (
                <span className="placeholder">
                  What would you like to know?
                  <br />
                  Ask about the products in this shop.
                </span>
              )}
              {isLoading && <span className="cursor">▌</span>}
            </div>
            <div className="stamp">FICTIONAL CATALOG · REAL STREAMING</div>
          </>
        )}
        {act.id === "comparison" &&
          (parsed?.success ? (
            <ProductPreview comparison={parsed.data} />
          ) : (
            <div className="empty-product">
              <div className="mascot">☀️</div>
              <h2>
                {isLoading
                  ? "Comparing catalog products…"
                  : "Find the right products for your afternoon."}
              </h2>
              <p>Recommendations become cards. Prices and stock come from our catalog.</p>
            </div>
          ))}
        {act.id === "agent" && (
          <>
            <div className="receipt">
              <p className="eyebrow">BEACH KIT / QUOTE ONLY</p>
              <h2>
                Your beach kit has
                <br />a €25 budget.
              </h2>
              {quote?.items ? (
                <>
                  <div className="kit-items">
                    {quote.items.map((p: any) => (
                      <div key={p.id}>
                        <span className="item-icon">{p.icon}</span>
                        <span>{p.name}</span>
                        <b>€{p.price}</b>
                      </div>
                    ))}
                  </div>
                  <div className="total">
                    <span>Total</span>
                    <strong>€{quote.total}</strong>
                  </div>
                  <p>€{quote.remaining} left. Nothing purchased.</p>
                  <p className="demo-punchline">The beach kit has a budget. My conference merch habit doesn’t.</p>
                </>
              ) : (
                <p className="placeholder">
                  The agent must look up stock and ask code for a quote.
                </p>
              )}
            </div>
            {text && <p className="agent-summary">{text}</p>}
            <details>
              <summary>Inspect tool arguments and results</summary>
              {toolParts.map((p, i) => (
                <pre key={i}>
                  {JSON.stringify(
                    {
                      name: p.name,
                      state: p.state,
                      input: p.input,
                      output: p.output,
                    },
                    null,
                    2,
                  )}
                </pre>
              ))}
            </details>
          </>
        )}
        {act.id === "cart" && (
          <div className="cart-stage">
            <p className="eyebrow">PROPOSE → APPROVE → CART</p>
            <h2>{cartResult || 'Your cart stays unchanged until you approve.'}</h2>
            <p>One of each item. €25 maximum. Local demo cart; no checkout or payment.</p>
            {interrupts.map(i => i.kind === 'tool-approval' && i.status === 'pending' ? (
              <div className="approval" key={i.id}>
                <strong>Proposed addition</strong>
                <ul>{((i.originalArgs as { ids?: string[] })?.ids || []).map(id => {
                  const item = inventory.find(p => p.id === id);
                  return <li key={id}>{item ? `${item.icon} ${item.name} · €${item.price}` : 'Unknown product — execution will reject it'}</li>;
                })}</ul>
                <p>The model can suggest. You control the bag.</p>
                <button className="primary" disabled={!i.canResolve || resuming} onClick={() => void i.resolveInterrupt(true)}>Approve cart addition</button>
                <button disabled={!i.canResolve || resuming} onClick={() => void i.resolveInterrupt(false)}>Deny</button>
              </div>
            ) : null)}
            <div className="cart-receipt">
              <h3>In your cart</h3>
              {cart.items.length ? cart.items.map(p => <p key={p.id}>{p.icon} {p.name} × 1 — €{p.price}</p>) : <p>Your cart is empty.</p>}
              <strong>Cart total: €{cart.total}</strong>
            </div>
            {!pending && text && <p>{text}</p>}
          </div>
        )}
      </section>
    </div>
  );
}
function ProductPreview({ comparison }: { comparison: Comparison }) {
  return <article className="product-preview comparison-preview">
    <p className="eyebrow">YOUR SHOPPING SHORTLIST · NOT ADDED TO CART</p>
    <h2>{comparison.heading}</h2>
    <div className="features">{comparison.picks.map(pick => {
      const product = inventory.find(p => p.id === pick.productId)!;
      return <section key={product.id}><span className="item-icon">{product.icon}</span><h3>{product.name}</h3><b>€{product.price}</b><p>In stock: {product.stock}</p><p>{pick.reason}</p></section>;
    })}</div>
    <p>AI explains the fit. Our catalog supplies the product facts.</p>
  </article>;
}
export function Cleanup({ active = true }: { active?: boolean }) {
  const [goal, setGoal] = useState(acts[4].prompt),
    [result, setResult] = useState<any>(null),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(false),
    [restore, setRestore] = useState(false),
    [custom, setCustom] = useState(blocks.find((b) => b.id === "ad")!.text);
  const hidden = new Set<string>(
    restore
      ? []
      : result?.decisions.filter((d: any) => d.hidden).map((d: any) => d.id) ||
          [],
  );
  const controller = React.useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (!active) {
      controller.current?.abort();
      setLoading(false);
    }
  }, [active]);
  async function clean() {
    controller.current?.abort();
    const own = new AbortController();
    controller.current = own;
    setLoading(true);
    setError("");
    setRestore(false);
    try {
      const r = await fetch("/api/cleanup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ goal, overrides: { ad: custom } }),
        signal: own.signal,
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Jev request failed");
      if (controller.current === own) setResult(data);
    } catch (e) {
      if (!own.signal.aborted) setError((e as Error).message);
    } finally {
      if (controller.current === own) setLoading(false);
    }
  }
  return (
    <div className="cleanup-act">
      <section className="cleanup-toolbar">
        <div>
          <label htmlFor="goal">What are you trying to do?</label>
          <input
            id="goal"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            maxLength={300}
          />
        </div>
        <button
          className="primary"
          onClick={clean}
          disabled={loading || !goal.trim()}
        >
          {loading ? "Jev is judging…" : "Unclutter this disaster ↗"}
        </button>
        <button onClick={() => setRestore(!restore)} disabled={!result}>
          {restore ? "Apply decisions" : "Restore everything"}
        </button>
      </section>
      <div className="cleanup-layout">
        <section className="bad-site" aria-label="Storefront preview">
          <div className="bad-nav">
            <strong>alicante</strong>
            <span>Home / Beach kits / After the talks</span>
          </div>
          <div className="clutter-slot fomo" hidden={hidden.has("fomo")}>
            47 imaginary conference attendees are viewing this page 👀
          </div>
          <div className="bad-main">
            <div className="clutter-slot ad" hidden={hidden.has("ad")}>
              <span>ADVERTISEMENT</span>
              <b>{custom}</b>
            </div>
            <div className="hero-essential">
              <p>REACT TALKS. THEN BEACH WALKS.</p>
              <h2>
                Close the laptop.
                <br />
                Pack for the beach.
              </h2>
              <p>Beach essentials for React Alicante attendees after the talks.</p>
              <div className="beach-line">{inventory.filter(p => p.stock > 0).slice(0, 3).map(p => <span key={p.id}>{p.icon} {p.name} · €{p.price}<br /></span>)}</div>
              <div className="essential-features">
                Browse beach essentials. Compare prices. Build a kit within your budget.
              </div>
              <button
                className="preview-cta"
                onClick={() =>
                  setGoal(
                    "I want to compare these beach products without interruptions.",
                  )
                }
              >
                Compare the products ↗
              </button>
            </div>
            <div
              className="clutter-slot newsletter"
              hidden={hidden.has("newsletter")}
            >
              <strong>A newsletter about our newsletter.</strong>
              <p>Subscribe to get more subscriptions.</p>
            </div>
          </div>
          <div className="clutter-slot video" hidden={hidden.has("video")}>
            ▶ Autoplay: our CEO explains synergy for 19 minutes.
          </div>
          <div className="clutter-slot cookie" hidden={hidden.has("cookie")}>
            🍪 We use 438 cookies. Mostly because we are hungry.
          </div>
          <div className="clutter-slot chat-nag" hidden={hidden.has("chat")}>
            Hi! Can I interrupt you? 👋
          </div>
        </section>
        <aside className="jev-results">
          <div className="jev-word">
            Jev<span>THE RESCUE CREW</span>
          </div>
          <p>
            Typed choices via TanStack AI’s <code>decide()</code>.
          </p>
          {result && (
            <div className="decision-summary">
              <strong>{hidden.size} distractions hidden</strong>
              <span>
                {result.elapsedMs} ms{" "}
                {result.mode === "rehearsal"
                  ? "fixture time"
                  : "measured round trip"}
              </span>
            </div>
          )}
          {result && hidden.size > 0 && <p className="demo-punchline">We found the product.</p>}
          {result && restore && <p className="demo-punchline">The growth team has entered the chat.</p>}
          {result?.decisions.map((d: any) => (
            <div className="decision-row" key={d.id}>
              <span>{d.id}</span>
              <b>{d.hidden ? "hide" : d.category}</b>
            </div>
          ))}
          {error && (
            <p className="error" role="alert">
              {error}
            </p>
          )}
          <details>
            <summary>Try to fool it</summary>
            <label htmlFor="ad-copy">Change the ad’s text</label>
            <textarea
              id="ad-copy"
              value={custom}
              onChange={(e) => setCustom(e.target.value)}
              maxLength={240}
            />
            <p>
              Re-run to classify the changed text. Unknown or uncertain
              decisions remain visible.
            </p>
          </details>
          <p className="small">
            Essential content is protected in code. The 0.85 threshold is a demo
            policy, not a measured accuracy claim. This only changes our demo
            page.
          </p>
          <a
            href="https://github.com/kitze/unclutter"
            target="_blank"
            rel="noreferrer"
          >
            Inspired by Kitze’s Unclutter ↗
          </a>
        </aside>
      </div>
    </div>
  );
}
