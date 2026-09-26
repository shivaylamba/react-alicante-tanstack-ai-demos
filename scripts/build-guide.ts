import { writeFileSync } from "node:fs";
import { chapters, lessons, introScripts } from "../src/lessons";
import { rcById } from "../src/rc-topics";
let result =
  "# Presenter guide — Building AI-Powered React Apps with TanStack AI\n\nOpen http://localhost:3100/#welcome. Use the slide counter to jump, arrow keys to advance, and N to open the script. The supplied React Alicante image is the opening. Every feature has a demo and a three-part code walkthrough. No timings are projected. The RC capability tour adds documentation-based examples, with prerequisites and source links. Use the jump links to keep that deeper tour optional during a short talk.\n\nKeep one server running. Check the LIVE MODE badge. Rehearsal is a scripted fallback, not evidence of live inference.\n\n";
for (const [i, c] of chapters.filter(c => c.lesson !== 6).entries()) {
  result += `## ${String(i + 1).padStart(2, "0")} — ${c.name}\n\nhttp://localhost:3100/#${c.id}\n\n`;
  const l = c.lesson === undefined ? undefined : lessons[c.lesson];
  const rc = rcById[c.id];
  if (rc) {
    result += "> " + rc.script + "\n\n";
    for (const [n, s] of rc.steps.entries())
      result += `### Block ${n + 1}: ${s.title}\n\n\`\`\`tsx\n${s.code}\n\`\`\`\n\n> ${s.explanation}\n\n`;
    result += `To build this: ${rc.setup}\n\nThese are documentation examples, not additional live demos.\n\n${rc.sources.map(([n, u]) => `[${n}](${u})`).join(" · ")}\n\n`;
  } else if (!l) result += "> " + introScripts[c.id] + "\n\n";
  else if (c.kind === "feature")
    result += "> " + l.script + "\n\nAdvance to the demo.\n\n";
  else if (c.kind === "demo")
    result += `Run the default task. Watch for: **${l.takeaway}**\n\n${l.id === "webmcp" ? "Verify the native registry shows two discovered tools. The prompt should produce three in-stock items under €10 and a lavender shop. Unsupported browsers must show an explicit status." : l.id === "skills" ? "Expand the loaded instructions. Confirm beach-shopper was loaded. Ask about returning a used towel and inspect returns-guide." : l.id === "codemode" ? "Point at the actual generated program. Look for the three data reads and arithmetic. Expected fictional weekly costs: engineering €3,360; marketing €2,750; leadership €5,760; total €11,870." : l.id === "approval" ? "Deny the first proposal and confirm the cart stays empty. Reset the demo, propose again and approve. Confirm towel + bottle, €18, and cart persistence across slides." : l.id === "jev" ? "Run cleanup, inspect kept and hidden elements, then restore everything." : l.id === "agent" ? "Inspect search_beach_catalog and quote_beach_kit. The application must keep the quote at or below €25." : l.id === "product" ? "Compare products and inspect catalog-backed names, prices and stock. AI supplies IDs and reasons, never prices." : "Ask a product question. Show incremental text and the Stop button."}\n\nThen use Explain the code.\n\n`;
  else
    for (const [n, step] of l.steps.entries())
      result += `### Block ${n + 1}: ${step.title}\n\nSource: ${step.file}\n\n\`\`\`tsx\n${step.code}\n\`\`\`\n\n> ${step.explanation}\n\nUse the next-block control. The full running source can be expanded below the excerpt.\n\n`;
}
result +=
  "## Recovery\n\nIf a provider fails, show the visible error and retry only after checking it. Do not narrate a result that did not execute. Switch to explicitly labelled rehearsal if necessary. WebMCP needs supported Chrome; ordinary client-tool behavior is not proof of native WebMCP. The code snippets and recorded results remain useful for explaining an unavailable live step.\n";
writeFileSync("RUN-OF-SHOW.md", result);
