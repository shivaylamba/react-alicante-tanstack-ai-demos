import { toolDefinition } from "@tanstack/ai";
import { inlineSkill } from "@tanstack/ai-skills";
import { createCodeMode } from "@tanstack/ai-code-mode";
import { createQuickJSIsolateDriver } from "@tanstack/ai-isolate-quickjs";
import { z } from "zod";

// Explicit rehearsal sources only. Live mode reads the actual Skillbox service.
export const demoSkills = [
  inlineSkill({ name: 'beach-shopper', description: 'Help choose products within a budget.', instructions: 'Use the supplied catalog. A towel and bottle cost €18. Do not change the cart.' }),
  inlineSkill({ name: 'returns-guide', description: 'Explain the fictional shop return policy.', instructions: 'Unused products, original packaging, within 30 days. Contact support first. No invented refunds or exceptions.' }),
];
const teams = {
  engineering: {
    team: "engineering",
    people: 8,
    hourlyRate: 70,
    meetingsPerWeek: 6,
  },
  marketing: {
    team: "marketing",
    people: 5,
    hourlyRate: 55,
    meetingsPerWeek: 10,
  },
  leadership: {
    team: "leadership",
    people: 4,
    hourlyRate: 120,
    meetingsPerWeek: 12,
  },
};
export function createMeetingCodeMode() {
  let calls = 0;
  const teamCosts = toolDefinition({
    name: "team_costs",
    description:
      "Read fictional staffing and weekly one-hour meeting data. No employee records or external systems.",
    inputSchema: z.object({
      team: z.enum(["engineering", "marketing", "leadership"]),
    }),
    outputSchema: z.object({
      team: z.string(),
      people: z.number(),
      hourlyRate: z.number(),
      meetingsPerWeek: z.number(),
    }),
  }).server(async ({ team }) => {
    if (++calls > 6) throw new Error("At most six data reads per demo run.");
    return teams[team];
  });
  return createCodeMode({
    driver: createQuickJSIsolateDriver(),
    tools: [teamCosts],
    timeout: 3000,
    memoryLimit: 32,
  });
}
