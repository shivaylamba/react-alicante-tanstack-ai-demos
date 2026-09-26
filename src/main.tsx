import { CartProvider, StorefrontBar, CatalogShelf } from "./storefront";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { acts, ChatAct, Cleanup } from "./demos";
import { AdvancedChat, WebMCPDemo } from "./advanced-demos";
import { Highlight } from "./highlight";
import { sourceFiles } from "./source-files";
import { chapters as fullChapters, lessons, introScripts } from "./lessons";
import {
  lightningChapters,
  demoCode,
  memeSlides,
  lightningNotes,
  extraCapabilities,
  shortServerCode,
  shortClientCode,
} from "./lightning";
import { rcById, rcOverview, rcAnnouncement, rcTopics } from "./rc-topics";
import "./style.css";
import "./deck.css";
import "./presentation.css";

const isLightning = location.pathname === "/lightning.html";
const chapters = isLightning ? lightningChapters : fullChapters;

function hashIndex() {
  const i = chapters.findIndex((c) => c.id === location.hash.slice(1));
  return i < 0 ? 0 : i;
}
function stored(key: string, fallback: string) {
  try {
    return localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
}

function Deck() {
  const [slide, setSlide] = useState(hashIndex),
    [step, setStep] = useState(0),
    [seen, setSeen] = useState(() => new Set([hashIndex()])),
    [epochs, setEpochs] = useState<Record<string, number>>({});
  const [panel, setPanel] = useState<
      "notes" | "sources" | "help" | "contents" | null
    >(null),
    [theme, setTheme] = useState(() => stored("talk-theme", "light")),
    [reduced, setReduced] = useState(
      () => stored("talk-motion", "full") === "reduce",
    ),
    [status, setStatus] = useState("connecting");
  const stage = useRef<HTMLDivElement>(null),
    dialog = useRef<HTMLDialogElement>(null),
    lastFocus = useRef<HTMLElement | null>(null);
  const chapter = chapters[slide],
    lesson = chapter.lesson === undefined ? undefined : lessons[chapter.lesson];
  const rcTopic = chapter.kind === "rc" ? rcById[chapter.id] : undefined;
  const count = rcTopic
    ? rcTopic.steps.length
    : chapter.kind === "code"
      ? lesson!.steps.length
      : 1;
  const go = useCallback((n: number) => {
    if (n >= 0 && n < chapters.length) location.hash = chapters[n].id;
  }, []);
  const next = useCallback(() => {
    if (step < count - 1) setStep((s) => s + 1);
    else go(slide + 1);
  }, [step, count, slide, go]);
  const prev = useCallback(() => {
    if (step > 0) setStep((s) => s - 1);
    else go(slide - 1);
  }, [step, slide, go]);
  useEffect(() => {
    if (!chapters.some((c) => c.id === location.hash.slice(1)))
      history.replaceState(null, "", "#welcome");
    const change = () => {
      const n = hashIndex();
      setSlide(n);
      setStep(0);
      setSeen((s) => new Set([...s, n]));
      setPanel(null);
      stage.current?.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    fetch("/api/status")
      .then((r) => r.json())
      .then((s) => setStatus(s.mode))
      .catch(() => setStatus("offline"));
  }, []);
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.dataset.motion = reduced ? "reduce" : "full";
    try {
      localStorage.setItem("talk-theme", theme);
      localStorage.setItem("talk-motion", reduced ? "reduce" : "full");
    } catch {}
  }, [theme, reduced]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        (e.target as HTMLElement).closest(
          'input,textarea,select,[contenteditable="true"]',
        ) ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      )
        return;
      if (panel) {
        if (e.key === "Escape") setPanel(null);
        return;
      }
      if (["ArrowRight", "PageDown"].includes(e.key)) {
        e.preventDefault();
        next();
      }
      if (["ArrowLeft", "PageUp"].includes(e.key)) {
        e.preventDefault();
        prev();
      }
      if (e.key === "Home") {
        e.preventDefault();
        go(0);
      }
      if (e.key === "End") {
        e.preventDefault();
        go(chapters.length - 1);
      }
      if (e.key.toLowerCase() === "n") setPanel("notes");
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, [next, prev, panel, go]);
  useEffect(() => {
    if (panel) {
      lastFocus.current = document.activeElement as HTMLElement;
      dialog.current?.showModal();
    } else if (dialog.current?.open) {
      dialog.current.close();
      lastFocus.current?.focus();
    }
  }, [panel]);
  const pace = isLightning ? lightningNotes[chapter.id] : undefined;
  const script = pace
    ? pace.script
    : rcTopic
      ? `${rcTopic.script}\n\n${rcTopic.steps.map((s, i) => `Part ${i + 1}: ${s.title}. ${s.explanation}`).join("\n\n")}\n\nSetup: ${rcTopic.setup}`
      : lesson
        ? `${lesson.script}\n\n${chapter.kind === "feature" ? "Introduce the feature, then advance to the demo." : chapter.kind === "demo" ? "Run the default task. Point to the visible result and tool evidence, then advance to the code walkthrough." : lesson.steps.map((s, i) => `Part ${i + 1}: ${s.title}. ${s.explanation}`).join("\n\n")}`
        : introScripts[chapter.id];
  return (
    <div
      className={`deck-shell ${chapter.kind === "title" ? "title-view" : ""}`}
      aria-label="TanStack AI interactive presentation"
    >
      <header className="deck-header">
        <a className="talk-brand" href="#welcome">
          <b>
            TanStack <span>AI</span>
          </b>
          <small>REACT ALICANTE</small>
        </a>
        <div className="deck-tools">
          <span className={`mode ${status === "live" ? "live" : ""}`}>
            {chapter.kind.startsWith("rc")
              ? "CAPABILITY TOUR"
              : status === "live"
                ? "LIVE MODE"
                : status === "rehearsal"
                  ? "REHEARSAL · scripted"
                  : status === "offline"
                    ? "SERVER OFFLINE"
                    : "CONNECTING"}
          </span>
          <button aria-label="Speaker notes" onClick={() => setPanel("notes")}>
            Notes
          </button>
          <button
            aria-label="Sources and scope"
            onClick={() => setPanel("sources")}
          >
            Sources
          </button>
          <button
            aria-label="Presentation help"
            onClick={() => setPanel("help")}
          >
            ?
          </button>
        </div>
      </header>
      <main className="deck-stage" ref={stage}>
        {chapter.kind === "meme" && (
          <section className="story-slide meme-slide">
            <p className="eyebrow">{memeSlides[chapter.id].setup}</p>
            <div className="meme-pair">
              <div className="meme-panel"><span aria-hidden="true">{memeSlides[chapter.id].leftIcon}</span><h2>{memeSlides[chapter.id].left}</h2></div>
              <div className="meme-panel meme-reality"><span aria-hidden="true">{memeSlides[chapter.id].rightIcon}</span><h2>{memeSlides[chapter.id].right}</h2></div>
            </div>
            <h1 className="meme-punchline">{memeSlides[chapter.id].punchline}</h1>
          </section>
        )}
        {chapter.kind === "demo-code" && lesson && (
          <section className="story-slide lightning-code demo-code-slide">
            <p className="eyebrow">THE CODE / {lesson.name}</p>
            <h1>{demoCode[chapter.lesson!].title}</h1>
            <div className="lightning-code-grid">
              {demoCode[chapter.lesson!].blocks.map((block, index) => (
                <div key={block.title}>
                  <h2>{index + 1}. {block.title}</h2>
                  <div className="code-file">{block.file}</div>
                  <Highlight code={block.code} />
                  <p className="block-caption">{block.explanation}</p>
                </div>
              ))}
            </div>
            <p className="demo-code-takeaway">{demoCode[chapter.lesson!].takeaway}</p>
            <p className="rc-source">Focused teaching excerpts; surrounding validation and lifecycle code omitted. <a href={"/#" + lesson.id + "-code"} target="_blank" rel="noreferrer">Full walkthrough ↗</a> · <a href={"#" + lesson.id}>Return to demo</a></p>
          </section>
        )}
        {chapter.kind === "short-code" && (
          <section className="story-slide lightning-code">
            <p className="eyebrow">CONNECT THE DOTS</p>
            <h1>
              One pattern. <em>Your boundaries.</em>
            </h1>
            <div className="lightning-code-grid">
              <div>
                <h2>1. Server coordinates</h2>
                <Highlight code={shortServerCode} />
              </div>
              <div>
                <h2>2. React responds</h2>
                <Highlight code={shortClientCode} />
              </div>
            </div>
            <p className="lightning-boundaries">
              Schema → data shape &nbsp; · &nbsp; Tool → allowed work &nbsp; ·
              &nbsp; Interrupt → human decision
            </p>
            <p className="rc-source">
              Focused excerpts; request validation, run IDs and cancellation
              plumbing are in the{" "}
              <a href="/#agent-code" target="_blank" rel="noreferrer">
                full walkthrough ↗
              </a>
              . Jev uses decide(); WebMCP supplies browser tools.
            </p>
          </section>
        )}
        {chapter.kind === "short-more" && (
          <section className="story-slide lightning-more">
            <p className="eyebrow">THE REST OF THE TOOLKIT</p>
            <h1>
              And there’s <em>more.</em>
            </h1>
            <div className="rc-map">
              {extraCapabilities.map(([name, description], i) => (
                <div className="capability-row" key={name}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{name}</strong>
                  <p>{description}</p>
                </div>
              ))}
            </div>
            <p className="rc-source">
              Provider adapters and transport choices run across these
              capabilities. These are additional capabilities, not extra live
              demos today.
            </p>
            <a
              className="text-link"
              href="/#rc-overview"
              target="_blank"
              rel="noreferrer"
            >
              Explore the full companion deck after the talk ↗
            </a>
          </section>
        )}
        {chapter.kind === "rc-overview" && (
          <section className="story-slide rc-overview">
            <p className="eyebrow">THE RELEASE CANDIDATE</p>
            <h1>
              More than <em>a chat box.</em>
            </h1>
            <p className="story-subtitle">
              One toolkit. Seven areas to build with.
            </p>
            <div className="rc-map">
              {rcOverview.map(([name, description, href], i) => (
                <a href={href} key={name}>
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <strong>{name}</strong>
                  <p>{description}</p>
                </a>
              ))}
            </div>
            <p className="rc-source">
              <a href={rcAnnouncement} target="_blank" rel="noreferrer">
                TanStack AI RC announcement
              </a>{" "}
              · Provider count refers to the announcement; capabilities vary by
              model.
            </p>
            <a className="text-link" href="#alicante">
              Jump to Vamos Alicante and the live demos →
            </a>
          </section>
        )}
        {rcTopic && (
          <section className="code-slide rc-slide">
            <p className="eyebrow">CAPABILITY TOUR / {rcTopic.name}</p>
            <h1>{rcTopic.title}</h1>
            <p className="rc-concept">{rcTopic.concept}</p>
            <p className="rc-example">
              <strong>Vamos Alicante:</strong> {rcTopic.example}
            </p>
            <div className="walkthrough">
              <aside>
                <nav aria-label="Code explanation steps">
                  {rcTopic.steps.map((s, i) => (
                    <button
                      key={s.title}
                      aria-current={step === i ? "step" : undefined}
                      onClick={() => setStep(i)}
                    >
                      <span>0{i + 1}</span>
                      {s.title}
                    </button>
                  ))}
                </nav>
                <p className="code-explanation">
                  {rcTopic.steps[step].explanation}
                </p>
                <div className="rc-source">
                  {rcTopic.sources.map(([name, url]) => (
                    <a key={url} href={url} target="_blank" rel="noreferrer">
                      {name} ↗
                    </a>
                  ))}
                </div>
              </aside>
              <div className="code-pane">
                <div className="code-file">{rcTopic.steps[step].file}</div>
                <Highlight code={rcTopic.steps[step].code} />
                <p className="excerpt-label">
                  Documentation-based code example · not connected to the live
                  demos.
                </p>
              </div>
            </div>
            <p className="rc-setup">
              <strong>To build this:</strong> {rcTopic.setup}
            </p>
            <a className="text-link" href="#workshop">
              Jump to the workshop QR →
            </a>
          </section>
        )}
        {chapter.kind === "title" && (
          <section className="conference-title">
            <img
              src="/react-alicante-title.jpeg"
              alt="React Alicante — Building AI-Powered React Apps with TanStack AI — Shivay Lamba — 2026"
            />
          </section>
        )}
        {chapter.kind === "intro" && (
          <section className="story-slide">
            <p className="eyebrow">THE TOOLKIT</p>
            <h1>
              What is <em>TanStack AI?</em>
            </h1>
            <p className="story-subtitle">
              An open-source TypeScript toolkit for AI-powered applications.
            </p>
            <div className="intro-columns">
              <div>
                <span>01</span>
                <h2>Connect a model</h2>
                <p>
                  Choose a provider adapter.
                  <br />
                  Keep credentials on the server.
                </p>
              </div>
              <div>
                <span>02</span>
                <h2>Give it capabilities</h2>
                <p>
                  Typed tools, structured output,
                  <br />
                  skills and controlled execution.
                </p>
              </div>
              <div>
                <span>03</span>
                <h2>Build your interface</h2>
                <p>
                  Streaming state and React hooks.
                  <br />
                  Your components, your UX.
                </p>
              </div>
            </div>
            <p className="provider-note">
              Today’s providers: Nebius for text · Jev through Vercel AI Gateway
              for decisions.
            </p>
          </section>
        )}
        {chapter.kind === "architecture" && (
          <section className="story-slide">
            <p className="eyebrow">THE REQUEST PATH</p>
            <h1>
              Your React app.
              <br />
              <em>Connected to intelligence.</em>
            </h1>
            <div className="intro-flow">
              <div>
                <b>React</b>
                <code>useChat()</code>
                <p>Input + interface state</p>
              </div>
              <span>→</span>
              <div>
                <b>Your server</b>
                <code>chat() / decide()</code>
                <p>Validation + tools + keys</p>
              </div>
              <span>→</span>
              <div>
                <b>Provider</b>
                <code>adapter</code>
                <p>Generate or decide</p>
              </div>
            </div>
            <div className="transport-note">
              <b>← Results return to your interface</b>
              <p>Chat: AG-UI events over SSE · Decision endpoint: JSON</p>
            </div>
            <p className="provider-note">
              AG-UI names the events. SSE carries them. Neither is the model.
            </p>
          </section>
        )}
        {chapter.kind === "story" && (
          <section className="story-slide">
            <p className="eyebrow">WHAT CAN TANSTACK AI DO?</p>
            <h1>
              Let’s build <em>Vamos Alicante.</em>
            </h1>
            <p className="story-subtitle">
              You are shopping for an afternoon at the beach.
              <br />“The talks are over. I have €25. Help me choose what to bring.”
            </p>
            <div className="beach-intro">
              <span aria-hidden="true">🛍️</span>
              <div>
                <p>Ask about products. Compare your options. Check stock and price.</p>
                <p>Approve the cart addition. Remove distractions. Filter the storefront.</p>
                {!isLightning && <p>Load a skill. Let code do the calculations.</p>}
              </div>
            </div>
            <CatalogShelf />
            <p className="sequence-label">
              {isLightning ? <>Today’s goal: <b>see what AI can do inside a real React interface.</b></> : <>For every capability: <b>feature → live demo → code walkthrough</b></>}
            </p>
          </section>
        )}
        {chapter.kind === "short-roadmap" && (
          <section className="story-slide lightning-more">
            <p className="eyebrow">WHAT WE WILL SHOW</p>
            <h1>Seven demos. <em>One beach shop.</em></h1>
            <div className="rc-map">
              {[
                ["Ask the shop assistant", "Streaming → read the answer as it arrives"],
                ["Compare products", "Structured output → catalog-backed comparison cards"],
                ["Pack for the beach", "Tools + an agent loop → facts and a calculated quote"],
                ["Add to cart", "Human approval → the bag changes only after your click"],
                ["Clean up the clutter", "Jev decisions → a focused, reversible interface"],
                ["Operate the shop", "WebMCP → discover and execute page capabilities"],
                ["Add shop playbooks", "Skillbox → reusable product and returns instructions"],
              ].map(([title, description], index) => (
                <div className="capability-row" key={title}>
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  <strong>{title}</strong><p>{description}</p>
                </div>
              ))}
            </div>
            <p className="provider-note">Watch the result. Inspect the tool calls. Keep the application in control.</p>
          </section>
        )}
        {chapter.kind === "feature" && lesson && (
          <section className="story-slide feature-slide">
            <p className="eyebrow">FEATURE / {lesson.name}</p>
            <h1>{lesson.title}</h1>
            <p className="feature-concept">{lesson.concept}</p>
            <div className="feature-example">
              <span>IN VAMOS ALICANTE</span>
              <p>{lesson.example}</p>
            </div>
            <code className="api-line">{lesson.api}</code>
            <a className="text-link" href={"#" + lesson.id}>
              Next: see it work →
            </a>
          </section>
        )}
        {chapter.kind === "code" && lesson && (
          <section className="code-slide">
            <p className="eyebrow">CODE WALKTHROUGH / {lesson.name}</p>
            <h1>{lesson.steps[step].title}</h1>
            <div className="walkthrough">
              <aside>
                <nav aria-label="Code explanation steps">
                  {lesson.steps.map((s, i) => (
                    <button
                      key={s.title}
                      aria-current={i === step ? "step" : undefined}
                      onClick={() => setStep(i)}
                    >
                      <span>0{i + 1}</span>
                      {s.title}
                    </button>
                  ))}
                </nav>
                <p className="code-explanation">
                  {lesson.steps[step].explanation}
                </p>
                <a href={"#" + lesson.id}>← Return to the live demo</a>
              </aside>
              <div className="code-pane">
                <div className="code-file">{lesson.steps[step].file}</div>
                <Highlight code={lesson.steps[step].code} />
                <p className="excerpt-label">
                  Focused teaching excerpt · surrounding validation and
                  lifecycle code omitted.
                </p>
                {Object.entries(sourceFiles)
                  .filter(([file]) => lesson.steps[step].file.includes(file))
                  .map(([file, source]) => (
                    <details className="full-source" key={file}>
                      <summary>Read the full running source: {file}</summary>
                      <Highlight code={source} />
                    </details>
                  ))}
              </div>
            </div>
          </section>
        )}
        {chapters.map((c, index) => {
          if (c.kind !== "demo" || !seen.has(index)) return null;
          const l = lessons[c.lesson!],
            i = c.lesson!,
            active = index === slide;
          return (
            <section
              key={c.id}
              hidden={!active}
              className="embedded-demo"
              aria-label={l.name + " demo"}
            >
              <div className="act-heading">
                <div>
                  <p className="eyebrow">LIVE DEMO / {l.name}</p>
                  <h1>
                    {i < 5
                      ? acts[i].title
                      : i === 5
                        ? "Ask the page."
                        : i === 6
                          ? "Your shop assistant knows the playbook."
                          : "This meeting could be a function."}
                  </h1>
                </div>
                <div className="act-actions">
                  <button onClick={() => { location.hash = l.id + "-code"; }}>
                    Explain the code
                  </button>
                  <button
                    onClick={() =>
                      setEpochs((e) => ({ ...e, [c.id]: (e[c.id] || 0) + 1 }))
                    }
                  >
                    Reset demo
                  </button>
                </div>
              </div>
              <StorefrontBar />
              <div key={epochs[c.id] || 0}>
                {i < 4 ? (
                  <ChatAct act={acts[i]} active={active} />
                ) : i === 4 ? (
                  <Cleanup active={active} />
                ) : i === 5 ? (
                  <WebMCPDemo active={active} />
                ) : (
                  <AdvancedChat
                    kind={i === 6 ? "skills" : "codemode"}
                    active={active}
                  />
                )}
              </div>
            </section>
          );
        })}
        {chapter.kind === "recap" && (
          <section className="story-slide">
            <p className="eyebrow">CONNECT THE DOTS</p>
            <h1>
              {chapter.id === "recap"
                ? "What have we covered?"
                : "Eight capabilities. One React app."}
            </h1>
            <div className="recap-grid">
              {lessons.slice(0, chapter.id === "recap" ? 5 : 8).map((l, i) => (
                <a href={"#" + l.id + "-feature"} key={l.id}>
                  <span>0{i + 1}</span>
                  <div>
                    <h2>{l.name}</h2>
                    <p>{l.takeaway}</p>
                  </div>
                </a>
              ))}
            </div>
          </section>
        )}
        {chapter.kind === "closing" && (
          <section className="story-slide">
            <div className="deck-closing">
              <div>
                <p className="eyebrow">KEEP BUILDING</p>
                <h1>
                  Make it <em>your own.</em>
                </h1>
                <p className="story-subtitle">
                  The four-hour hands-on workshop
                  <br />
                  with Shivay & Vikas.
                </p>
                <p>Starters. Solutions. Experiments.</p>
                <a
                  className="workshop-link"
                  href="https://github.com/shivaylamba/react-alicante-tanstack-ai-live-workshop"
                  target="_blank"
                  rel="noreferrer"
                >
                  Get the workshop repository ↗
                </a>
                <p className="kitze-credit">
                  Jev demo inspired by{" "}
                  <a
                    href="https://github.com/kitze/unclutter"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Kitze’s Unclutter
                  </a>
                  .<br />
                  Catch Kitze’s talk later.
                </p>
              </div>
              <figure>
                <img
                  src="/workshop-qr.png"
                  alt="QR code to the React Alicante TanStack AI workshop repository"
                />
                <figcaption>SCAN IT. BUILD IT. MAKE IT YOURS.</figcaption>
              </figure>
            </div>
          </section>
        )}
      </main>
      <footer className="deck-footer">
        <div className="deck-controls">
          <div className="view-controls">
            <button
              aria-label="Toggle dark theme"
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              {theme === "light" ? "◐ Dark" : "◑ Light"}
            </button>
            <button aria-pressed={reduced} onClick={() => setReduced(!reduced)}>
              Motion {reduced ? "off" : "on"}
            </button>
            <button
              aria-label="Enter fullscreen"
              onClick={() =>
                void (
                  document.fullscreenElement
                    ? document.exitFullscreen()
                    : document.documentElement.requestFullscreen()
                ).catch(() => {})
              }
            >
              ⛶
            </button>
          </div>
          <p className="chapter-indicator">
            {chapter.kind === "code" || chapter.kind === "rc"
              ? `Code · ${step + 1} of ${count}`
              : chapter.name}
          </p>
          <nav aria-label="Slide navigation">
            <button
              aria-label="Previous reveal or slide"
              disabled={slide === 0 && step === 0}
              onClick={prev}
            >
              ←
            </button>
            <button
              className="slide-picker"
              onClick={() => setPanel("contents")}
              aria-label="Choose slide"
            >
              {String(slide + 1).padStart(2, "0")}{" "}
              <span>/ {chapters.length}</span>
            </button>
            <button
              className="primary"
              aria-label="Next reveal or slide"
              disabled={slide === chapters.length - 1}
              onClick={next}
            >
              {step < count - 1 ? "Next block" : "Next"} →
            </button>
          </nav>
        </div>
      </footer>
      <dialog
        ref={dialog}
        onCancel={() => setPanel(null)}
        onClose={() => setPanel(null)}
        aria-labelledby="panel-title"
        className="deck-panel"
      >
        <div className="panel-top">
          <h2 id="panel-title">
            {panel === "notes"
              ? "Speaker notes"
              : panel === "contents"
                ? "Choose a slide"
                : panel === "sources"
                  ? "Sources & scope"
                  : "Presentation controls"}
          </h2>
          <button
            autoFocus
            aria-label="Close panel"
            onClick={() => setPanel(null)}
          >
            Close ×
          </button>
        </div>
        {panel === "notes" && (
          <>
            <p className="eyebrow">{chapter.name}</p>
            {pace && (
              <div className="pacing-note">
                <strong>
                  Presenter only · {pace.window} · {pace.seconds} seconds
                </strong>
                <p>{pace.action}</p>
                <p>
                  If a live call takes more than 10 seconds, explain the
                  intended contract while it runs. At the end of the segment,
                  stop and move on; never claim an unfinished result. Keep the
                  final 20 seconds as buffer.
                </p>
              </div>
            )}
            <div className="speaker-notes">
              {script?.split("\n\n").map((p, i) => (
                <p className="spoken" key={i}>
                  {p}
                </p>
              ))}
            </div>
            {pace?.jokeExplanation && (
              <section className="pacing-note joke-explanation">
                <strong>Why this is funny · preparation only, do not read aloud</strong>
                <p>{pace.jokeExplanation}</p>
                <strong>Delivery</strong>
                <p>{pace.jokeDelivery}</p>
              </section>
            )}
          </>
        )}
        {panel === "contents" && (
          <ol className="chapter-list">
            {chapters.map((c, i) => (
              <li key={c.id}>
                <button
                  aria-current={slide === i ? "step" : undefined}
                  onClick={() => {
                    go(i);
                    setPanel(null);
                  }}
                >
                  <span>{String(i + 1).padStart(2, "0")}</span>
                  <b>{c.name}</b>
                  <em>{c.kind}</em>
                </button>
              </li>
            ))}
          </ol>
        )}
        {panel === "sources" && (
          <>
            <p>
              <a
                href={isLightning ? "/#welcome" : "/lightning.html#welcome"}
                target="_blank"
                rel="noreferrer"
              >
                {isLightning
                  ? "Open the full 41-slide companion deck ↗"
                  : "Open the short lightning-talk edition ↗"}
              </a>
            </p>
            <p>
              {isLightning
                ? "Seven demos in React, including Skillbox by Kitze. "
                : "Eight interactive examples in React. "}
              Model requests happen only when you press a demo button. Rehearsal
              is explicitly labelled and never proves live inference.
            </p>
            <ul>
              <li>
                <a href={rcAnnouncement} target="_blank" rel="noreferrer">
                  TanStack AI RC announcement
                </a>
              </li>
              <li><a href="https://github.com/kitze/skillbox" target="_blank" rel="noreferrer">Skillbox by Kitze — versioned agent playbooks</a></li>
              {rcTopics
                .flatMap((t) => t.sources)
                .filter(
                  ([_, url], i, list) =>
                    list.findIndex((s) => s[1] === url) === i,
                )
                .map(([name, url]) => (
                  <li key={url}>
                    <a href={url} target="_blank" rel="noreferrer">
                      {name}
                    </a>
                  </li>
                ))}
              {[
                ["Overview", "getting-started/overview"],
                ["Streaming", "chat/streaming"],
                ["Structured output", "structured-outputs/overview"],
                ["Tools", "tools/tools"],
                ["WebMCP", "tools/webmcp"],
                ["Page WebMCP tools", "tools/webmcp-page-tools"],
                ["Portable agent skills", "skills/agent-skills"],
                ["Code Mode", "code-mode/code-mode"],
              ].map(([name, url]) => (
                <li key={url}>
                  <a
                    href={"https://tanstack.com/ai/latest/docs/" + url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    TanStack AI: {name}
                  </a>
                </li>
              ))}
            </ul>
            <p>
              The catalog, business and meeting data are fictional. No purchase
              or deployment occurs. WebMCP changes only the demo shop. Code Mode
              exposes one read-only tool in a bounded QuickJS isolate. Skills
              supply instructions; they are not permission enforcement.
            </p>
            <p>
              Jev uses known text descriptions and typed decisions. Its cleanup
              threshold is a demonstration policy, not an accuracy claim.{" "}
              <a href="https://github.com/kitze/unclutter">Kitze’s Unclutter</a>{" "}
              inspired this demo.
            </p>
            <p>
              Opening image supplied by Shivay. Presentation interaction
              inspired by{" "}
              <a href="https://rudrakshkarpe.com/presentations/openvoice">
                Rudraksh Karpe’s OpenVoice deck
              </a>
              .
            </p>
          </>
        )}
        {panel === "help" && (
          <>
            <p>
              Arrow keys move between slides. On a code slide they walk through
              the explained blocks first. Capability-tour examples describe
              additional integrations; they make no API calls. Home opens the
              title, End opens the workshop QR, N opens notes, Escape closes
              panels.
            </p>
            <p>
              Use the slide counter to jump to any feature, demo or code
              walkthrough. Typing in an input never changes slides. Navigation
              makes no model requests.
            </p>
            <p>
              Completed demo results stay available when you return. Leaving a
              running demo cancels it; Reset demo clears only that demo. WebMCP
              registrations are removed when its demo is inactive.
            </p>
          </>
        )}
      </dialog>
    </div>
  );
}
createRoot(document.getElementById("root")!).render(<CartProvider><Deck /></CartProvider>);
