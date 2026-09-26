import { Prose } from "./prose";
import { normalizeNativeTools } from "./webmcp-compat";
import { useEffect, useMemo, useState } from "react";
import {
  fetchServerSentEvents,
  useChat,
  usePageWebMCPTools,
  useRegisterWebMCPTools,
} from "@tanstack/ai-react";
import { toolDefinition } from "@tanstack/ai";
import { z } from "zod";
import { inventory } from "./contracts";
import { Highlight } from "./highlight";

const costResult = z.object({
  success: z.literal(true),
  result: z.object({
    teams: z.array(
      z.object({ team: z.string(), weeklyCost: z.number().nonnegative() }),
    ),
    total: z.number().nonnegative(),
    mostExpensive: z
      .union([
        z.string(),
        z.object({ team: z.string(), weeklyCost: z.number() }),
      ])
      .transform((v) => (typeof v === "string" ? v : v.team)),
  }),
});
export function AdvancedChat({
  kind,
  active,
}: {
  kind: "skills" | "codemode";
  active: boolean;
}) {
  const [input, setInput] = useState(
    kind === "skills"
      ? "I am heading to the beach after React Alicante. I have €25 and need a towel and something for water. What should I buy?"
      : "Which team spends the most on meetings? Compare engineering, marketing and leadership. Fetch their data in parallel, calculate weekly costs and return the total.",
  );
  const [failure, setFailure] = useState("");
  const [library, setLibrary] = useState<{ mode: string; error?: string; skills?: { name: string; metadata?: { revision?: string } }[] } | null>(null);
  useEffect(() => {
    if (kind !== "skills" || !active) return;
    const controller = new AbortController();
    fetch('/api/skillbox', { signal: controller.signal }).then(r => r.json()).then(setLibrary)
      .catch(() => { if (!controller.signal.aborted) setLibrary({ mode: 'unavailable' }); });
    return () => controller.abort();
  }, [kind, active]);
  const { messages, sendMessage, isLoading, error, stop } = useChat({
    connection: fetchServerSentEvents("/api/chat/" + kind),
  });
  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);
  // Keep the full conversation in useChat, but project the current task only.
  const visibleMessages = kind === "skills" ? messages.slice(messages.findLastIndex(m => m.role === "user") + 1) : messages;
  const parts = visibleMessages.flatMap((m) => m.parts),
    tools = parts.filter((p) => p.type === "tool-call");
  const text = visibleMessages
    .filter((m) => m.role === "assistant")
    .flatMap((m) =>
      m.parts.filter((p) => p.type === "text").map((p) => p.content),
    )
    .join("\n");
  const execution = tools.findLast(
    (t) => t.name === "execute_typescript" && t.output,
  );
  const parsed = costResult.safeParse(execution?.output);
  const generated = tools.filter((t) => t.name === "execute_typescript").at(-1)
    ?.input as { typescriptCode?: string } | undefined;
  return (
    <div className="advanced-layout">
      <aside className="advanced-input">
        <label htmlFor={kind + "-task"}>Give it a task</label>
        <textarea
          id={kind + "-task"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={2000}
        />
        <div className="form-actions">
          <button
            className="primary"
            disabled={isLoading || !input.trim()}
            onClick={() => {
              setFailure("");
              void sendMessage(input).catch((e) => setFailure(String(e)));
            }}
          >
            {kind === "skills" ? "Ask the shop assistant" : "Audit the meetings"}
          </button>
          <button disabled={!isLoading} onClick={stop}>
            Stop
          </button>
        </div>
        <p role="status">
          {isLoading
            ? "Model working…"
            : messages.length
              ? "Run complete"
              : "Ready"}
        </p>
        {kind === "skills" ? (
          <>
            <div className="skillbox-credit">
              <b>Skillbox by <a href="https://github.com/kitze/skillbox" target="_blank" rel="noreferrer">Kitze ↗</a></b>
              <p className="skillbox-status">{library?.mode === 'live' ? 'Live Skillbox · read-only library' : library?.mode === 'rehearsal' ? 'Rehearsal · local fixtures, not Skillbox' : library?.mode === 'unavailable' ? 'Skillbox unavailable · start the local service' : 'Connecting to Skillbox…'}</p>
              {library?.skills?.map(skill => <small key={skill.name}>{skill.name} {skill.metadata?.revision ? '· ' + skill.metadata.revision.slice(0, 8) : ''}<br /></small>)}
            </div>
            <h3>ONE AGENT. TWO PLAYBOOKS.</h3>
            <p>
              <b>beach-shopper</b>
              <br />
              Product advice from the catalog. Respect the shopper’s budget.
            </p>
            <p>
              <b>returns-guide</b>
              <br />
              Return questions. Read the policy before answering.
            </p>
            <button
              disabled={isLoading}
              onClick={() =>
                setInput(
                  "I have €25 and need a towel and something for water. What should I buy?"
                )
              }
            >
              Help me choose products
            </button>
            <button disabled={isLoading} onClick={() => setInput("Can I return this towel if I have already used it at the beach?")}>Can I return it?</button>
            <p className="provider-note">Same model. Different instructions. Skillbox stores the playbooks; TanStack AI loads and applies one.</p>
          </>
        ) : (
          <>
            <h3>CODE MODE BOUNDARY</h3>
            <p>Three fictional teams. One read-only tool.</p>
            <p>QuickJS isolate · 32 MB limit · 3-second execution deadline.</p>
            <p>
              No host filesystem or network API is exposed to generated code.
            </p>
          </>
        )}
        {(error || failure) && (
          <p role="alert" className="error">
            {error?.message || failure}
          </p>
        )}
      </aside>
      <section className="advanced-result">
        {kind === "skills" ? (
          <>
            <p className="eyebrow">
              SKILL SELECTION → LOADED INSTRUCTIONS → ANSWER
            </p>
            <div className="skill-loads">
              {tools
                .filter((t) => t.name === "load_skill")
                .map((t, i) => (
                  <div key={i} className="loaded-skill">
                    <strong>load_skill</strong>
                    {typeof (t.output as { content?: string } | undefined)?.content === 'string' && /Skillbox revision: ([^\n]+)/.test((t.output as { content: string }).content) && <p className="skillbox-receipt">Loaded from Skillbox · revision {(t.output as { content: string }).content.match(/Skillbox revision: ([^\n]+)/)?.[1].slice(0, 8)}</p>}
                    <Highlight code={JSON.stringify(t.input, null, 2)} />
                    <details>
                      <summary>Read the loaded instructions</summary>
                      <pre>{JSON.stringify(t.output, null, 2)}</pre>
                    </details>
                  </div>
                ))}
            </div>
            <div className="skill-answer">
              <Prose text={text || "Ask about products or returns. Watch the assistant load the matching playbook."} />
            </div>
          </>
        ) : (
          <>
            <p className="eyebrow">
              MODEL-WRITTEN PROGRAM → TOOL READS → CALCULATED RESULT
            </p>
            {generated?.typescriptCode ? (
              <Highlight code={generated.typescriptCode} />
            ) : (
              <div className="empty-program">
                Could this meeting have been a function?
                <br />
                <small>The actual generated program will appear here.</small>
              </div>
            )}
            {parsed.success && (
              <div className="cost-results">
                <h2>€{parsed.data.result.total.toLocaleString()} / week</h2>
                <p>
                  Fictional meeting costs · highest:{" "}
                  {parsed.data.result.mostExpensive}
                </p>
                {parsed.data.result.teams.map((t) => (
                  <div className="cost-row" key={t.team}>
                    <b>{t.team}</b>
                    <meter min="0" max="6000" value={t.weeklyCost} />
                    <strong>€{t.weeklyCost.toLocaleString()}</strong>
                  </div>
                ))}
              </div>
            )}
            {execution?.output && !parsed.success && (
              <p role="alert" className="error">
                The program result did not match the demo contract. Inspect the
                tool result and retry.
              </p>
            )}
            <Prose text={text} />
          </>
        )}
        <details>
          <summary>Inspect actual tool calls</summary>
          {tools.map((t, i) => (
            <pre key={i}>
              {JSON.stringify(
                { name: t.name, input: t.input, output: t.output },
                null,
                2,
              )}
            </pre>
          ))}
        </details>
      </section>
    </div>
  );
}
const browserToolFilter = {
  filter: (tool: { name: string }) => tool.name.startsWith("alicante_"),
};
export function WebMCPDemo({ active }: { active: boolean }) {
  const [theme, setTheme] = useState("tomato"),
    [limit, setLimit] = useState(200),
    [available, setAvailable] = useState(false),
    [log, setLog] = useState<string[]>([]),
    [failure, setFailure] = useState("");
  const [input, setInput] = useState(
    "Show only in-stock items under €10 and change the shop theme to lavender.",
  );
  const registered = useMemo(
    () => [
      toolDefinition({
        name: "alicante_filter_catalog",
        description:
          "Filter the visible Vamos Alicante catalog by maximum price and stock. Only updates this page.",
        inputSchema: z.object({
          maxPrice: z.number().min(0).max(200),
          inStockOnly: z.boolean(),
        }),
        outputSchema: z.object({ visible: z.number() }),
      }).client(async ({ maxPrice, inStockOnly }) => {
        setLimit(maxPrice);
        setAvailable(inStockOnly);
        setLog((l) => [
          ...l,
          `alicante_filter_catalog(${maxPrice}, ${inStockOnly})`,
        ]);
        return {
          visible: inventory.filter(
            (i) => i.price <= maxPrice && (!inStockOnly || i.stock > 0),
          ).length,
        };
      }),
      toolDefinition({
        name: "alicante_set_theme",
        description: "Change the Vamos Alicante catalog color theme on this page.",
        inputSchema: z.object({
          theme: z.enum(["tomato", "lime", "lavender"]),
        }),
        outputSchema: z.object({ theme: z.string() }),
      }).client(async ({ theme }) => {
        setTheme(theme);
        setLog((l) => [...l, `alicante_set_theme(${theme})`]);
        return { theme };
      }),
    ],
    [],
  );
  const registrationOptions = useMemo(
    () => ({ onError: (e: unknown) => setFailure(String(e)) }),
    [],
  );
  const empty = useMemo(() => [], []);
  useRegisterWebMCPTools(active ? registered : empty, registrationOptions);
  const discoveredTools = usePageWebMCPTools(browserToolFilter);
  const pageTools = useMemo(
    () => normalizeNativeTools(discoveredTools),
    [discoveredTools],
  );
  const { messages, sendMessage, isLoading, error, stop } = useChat({
    connection: fetchServerSentEvents("/api/chat/webmcp"),
    tools: pageTools,
  });
  useEffect(() => {
    if (!active) stop();
  }, [active, stop]);
  const visible = inventory.filter(
    (i) => i.price <= limit && (!available || i.stock > 0),
  );
  const text = messages
    .filter((m) => m.role === "assistant")
    .flatMap((m) =>
      m.parts.filter((p) => p.type === "text").map((p) => p.content),
    )
    .join("\n");
  return (
    <div className="advanced-layout">
      <aside className="advanced-input">
        <span className="native-status">
          {pageTools.length
            ? `NATIVE WEBMCP · ${pageTools.length} tools discovered`
            : "WEBMCP NOT AVAILABLE"}
        </span>
        <p>
          Page tools are registered with the browser, discovered by TanStack AI,
          and called by the model.
        </p>
        <label htmlFor="webmcp-task">Ask the page to change</label>
        <textarea
          id="webmcp-task"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={1000}
        />
        <div className="form-actions">
          <button
            className="primary"
            disabled={isLoading || pageTools.length !== 2 || !input.trim()}
            onClick={() => {
              setFailure("");
              void sendMessage(input).catch((e) => setFailure(String(e)));
            }}
          >
            Ask the page agent
          </button>
          <button onClick={stop} disabled={!isLoading}>
            Stop
          </button>
        </div>
        {!pageTools.length && (
          <p>
            Use a Chrome version with WebMCP enabled. This demo requires native
            document.modelContext; it does not replace it with a mock.
          </p>
        )}
        <h3>DISCOVERED TOOLS</h3>
        {pageTools.map((t) => (
          <p key={t.name}>
            <code>{t.name}</code>
          </p>
        ))}
        {(error || failure) && (
          <p className="error" role="alert">
            {error?.message || failure}
          </p>
        )}
        <p role="status">
          {isLoading
            ? "Agent working…"
            : messages.length
              ? "Run complete"
              : "Ready"}
        </p>
      </aside>
      <section className={`webmcp-store ${theme}`} data-theme-name={theme}>
        <p className="eyebrow">VAMOS ALICANTE / BROWSER-OWNED STATE</p>
        <h2>The page is an API.</h2>
        <p className="grid-summary">
          {visible.length} items · up to €{limit} ·{" "}
          {available ? "in stock only" : "all stock"}
        </p>
        {theme === "lavender" && available && limit === 10 && log.length >= 2 && <p className="demo-punchline">The budget is strict. The brand guidelines are lavender.</p>}
        <div className="mini-catalog">
          {visible.map((i) => (
            <article key={i.id}>
              <span>{i.icon}</span>
              <h3>{i.name}</h3>
              <strong>€{i.price}</strong>
              <p>{i.stock ? "In stock" : "Out of stock"}</p>
            </article>
          ))}
        </div>
        <div className="browser-call-log" aria-label="Browser tool executions">
          {log.map((line, i) => (
            <div key={i}>✓ {line}</div>
          ))}
        </div>
        <Prose text={text} />
      </section>
    </div>
  );
}
