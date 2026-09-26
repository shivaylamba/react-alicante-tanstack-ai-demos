import brandPlaybook from "../skills/beach-shopper/SKILL.md?raw";
import skillbox from "../server/skillbox.ts?raw";
import storefront from "./storefront.tsx?raw";
import server from "../server/app.ts?raw";
import advanced from "../server/advanced.ts?raw";
import demos from "./demos.tsx?raw";
import advancedDemos from "./advanced-demos.tsx?raw";
import contracts from "./contracts.ts?raw";
import compat from "./webmcp-compat.ts?raw";
export const sourceFiles: Record<string, string> = {
  "server/app.ts": server,
  "src/storefront.tsx": storefront,
  "skills/beach-shopper/SKILL.md": brandPlaybook,
  "server/skillbox.ts": skillbox,
  "src/webmcp-compat.ts": compat,
  "server/advanced.ts": advanced,
  "src/demos.tsx": demos,
  "src/advanced-demos.tsx": advancedDemos,
  "src/contracts.ts": contracts,
};
