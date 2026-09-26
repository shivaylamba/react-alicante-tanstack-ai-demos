import { setTimeout as delay } from "node:timers/promises";
// A deterministic provider-wire rehearsal fixture. The real TanStack transport,
// structured output parser, tool loop and approval lifecycle still execute.
export function fixtureResponse(body: any, act: string) {
  const messages = body.messages || [];
  const returnSkill = /return|refund/i.test(JSON.stringify(messages.findLast((m: any) => m.role === "user")?.content));
  const after = messages.slice(
    messages.findLastIndex((m: any) => m.role === "user") + 1,
  );
  const called = after
    .flatMap((m: any) => m.tool_calls || [])
    .map((t: any) => t.function.name);
  let tool = "",
    args: any = {};
  if (act === "agent" && !called.includes("search_beach_catalog"))
    tool = "search_beach_catalog";
  else if (act === "agent" && !called.includes("quote_beach_kit")) {
    tool = "quote_beach_kit";
    args = { ids: ["towel", "water"], budget: 25 };
  } else if (act === "cart" && !called.includes("add_to_cart")) {
    tool = "add_to_cart";
    args = { ids: ["towel", "water"] };
  }
  if (act === "skills" && !called.includes("load_skill")) {
    tool = "load_skill";
    args = { name: returnSkill ? "returns-guide" : "beach-shopper" };
  }
  if (act === "webmcp" && !called.includes("alicante_filter_catalog")) {
    tool = "alicante_filter_catalog";
    args = { maxPrice: 10, inStockOnly: true };
  } else if (act === "webmcp" && !called.includes("alicante_set_theme")) {
    tool = "alicante_set_theme";
    args = { theme: "lavender" };
  }
  if (act === "codemode" && !called.includes("execute_typescript")) {
    tool = "execute_typescript";
    args = {
      typescriptCode: `const rows = await Promise.all(['engineering','marketing','leadership'].map(team => external_team_costs({team}))); const teams = rows.map(r => ({team:r.team, weeklyCost:r.people*r.hourlyRate*r.meetingsPerWeek})); return {teams,total:teams.reduce((s,r)=>s+r.weeklyCost,0),mostExpensive:[...teams].sort((a,b)=>b.weeklyCost-a.weeklyCost)[0].team};`,
    };
  }
  const structured = body.response_format?.type === "json_schema";
  const comparison = { heading: "Ready for the beach after the talks", picks: [{ productId: "towel", reason: "A place to sit after a day in conference chairs." }, { productId: "water", reason: "Carry water for your afternoon." }] };
  const text = structured
    ? JSON.stringify(comparison)
    : act === "skills"
      ? returnSkill ? "Our demo return policy allows unused products in their original packaging within 30 days. Contact support first. This answer does not process a refund." : "The Beach Towel (€12) and Reusable Water Bottle (€6) cost €18, leaving €7 of your €25 budget. Both are in stock. Would you like to compare them? Nothing has been added to your cart."
      : act === "codemode"
        ? "The fictional teams spend €11,870 per week. Leadership is the most expensive."
        : act === "webmcp"
          ? "The shop now shows three in-stock items under €10 in lavender."
          : act === "shopchat"
            ? "The towel is €12 and the reusable bottle is €6. Both are in stock. Together they cost €18, leaving €7 for your afternoon."
            : act === "agent"
              ? "The catalog says the parasol is out of stock. Your towel and water bottle cost €18, leaving €7. I have quoted the kit; nothing was purchased."
              : "The cart action follows your approval decision. No order has been placed.";
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      let cancelled = false;
      const send = (delta: any, finish_reason: string | null = null) => {
        try {
          controller.enqueue(
            encoder.encode(
              "data: " +
                JSON.stringify({
                  id: "fixture",
                  object: "chat.completion.chunk",
                  created: 1,
                  model: "rehearsal",
                  choices: [{ index: 0, delta, finish_reason }],
                }) +
                "\n\n",
            ),
          );
        } catch {
          cancelled = true;
        }
      };
      send({ role: "assistant", content: "" });
      if (tool && !structured) {
        send({
          tool_calls: [
            {
              index: 0,
              id: "call_" + crypto.randomUUID(),
              type: "function",
              function: { name: tool, arguments: "" },
            },
          ],
        });
        send({
          tool_calls: [
            { index: 0, function: { arguments: JSON.stringify(args) } },
          ],
        });
        send({}, "tool_calls");
      } else {
        for (const token of text.match(/.{1,14}/gs) || []) {
          if (cancelled) break;
          send({ content: token });
          await delay(35);
        }
        send({}, "stop");
      }
      if (!cancelled) {
        try {
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch {}
      }
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream" },
  });
}
