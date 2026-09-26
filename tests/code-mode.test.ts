import { test } from "node:test";
import assert from "node:assert/strict";
import { createMeetingCodeMode } from "../server/advanced";
test("Code Mode runs bound tools and has no host process or filesystem globals", async () => {
  const { tool } = createMeetingCodeMode();
  const result = await tool.execute!(
    {
      typescriptCode: `const row=await external_team_costs({team:'engineering'});return {cost:row.people*row.hourlyRate*row.meetingsPerWeek,process:typeof process,require:typeof require,fetch:typeof fetch};`,
    },
    {} as never,
  );
  assert.equal(result.success, true);
  assert.deepEqual(result.result, {
    cost: 3360,
    process: "undefined",
    require: "undefined",
    fetch: "undefined",
  });
});
