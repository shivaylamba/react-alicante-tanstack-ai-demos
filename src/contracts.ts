import { z } from "zod";
import { toolDefinition } from "@tanstack/ai";
export const comparisonSchema = z.object({
  heading: z.string().min(1).max(80),
  picks: z.array(z.object({
    productId: z.enum(['towel', 'water', 'sticker', 'fan']),
    reason: z.string().min(1).max(140),
  }).strict()).min(2).max(3),
}).strict().refine(value => new Set(value.picks.map(p => p.productId)).size === value.picks.length, 'Duplicate products');
export type Comparison = z.infer<typeof comparisonSchema>;
export const inventory = [
  {
    id: "towel",
    name: "Beach Towel",
    price: 12,
    stock: 8,
    icon: "🏖️",
    description: "One towel. Your laptop gets no reserved spot.",
  },
  {
    id: "water",
    name: "Reusable Water Bottle",
    price: 6,
    stock: 12,
    icon: "💧",
    description: "For the walk after the talks. Hydration is not a premium feature.",
  },
  {
    id: "sticker",
    name: "React Alicante Sticker",
    price: 3,
    stock: 100,
    icon: "🏷️",
    description: "A souvenir for the laptop you promised to close.",
  },
  {
    id: "parasol",
    name: "Beach Parasol",
    price: 29,
    stock: 0,
    icon: "⛱️",
    description: "Out of stock. No imaginary reservations.",
  },
  {
    id: "fan",
    name: "Pocket Fan",
    price: 8,
    stock: 20,
    icon: "🪭",
    description: "A handheld fan. Zero dependencies.",
  },
];
export const itemSchema = z.object({
  id: z.string(),
  name: z.string(),
  price: z.number(),
  stock: z.number(),
  icon: z.string(),
  description: z.string(),
});
export const catalogDef = toolDefinition({
  name: "search_beach_catalog",
  description:
    "Read the actual beach-kit catalog, including real prices and stock. Call before proposing a kit.",
  inputSchema: z.object({}),
  outputSchema: z.object({ items: z.array(itemSchema) }),
});
export const quoteInput = z.object({
  ids: z.array(z.string()).min(1).max(5),
  budget: z.number().min(1).max(200),
});
export function quoteKit(input: z.infer<typeof quoteInput>) {
  input = quoteInput.parse(input);
  const budget = Math.min(input.budget, 25); // Trusted demo spending cap; model arguments cannot raise it.
  const ids = [...new Set(input.ids)];
  const items = ids.map((id) => {
    const item = inventory.find((i) => i.id === id);
    if (!item) throw new Error("Unknown catalog item");
    if (item.stock < 1) throw new Error("Item out of stock");
    return item;
  });
  const total = items.reduce((sum, i) => sum + i.price, 0);
  if (total > budget) throw new Error("Kit exceeds the requested budget");
  return { items, total, budget, remaining: budget - total };
}
export const quoteDef = toolDefinition({
  name: "quote_beach_kit",
  description:
    "Validate a kit using catalog IDs. Prices, availability and totals are calculated by code. Pass the shopper budget exactly. One of each item. Does not buy anything.",
  inputSchema: quoteInput,
  outputSchema: z.object({
    items: z.array(itemSchema),
    total: z.number(),
    budget: z.number(),
    remaining: z.number(),
  }),
});
export const cartDef = toolDefinition({
  name: "add_to_cart",
  description: "Propose adding one of each selected catalog item to the local demo cart. Requires the Approve button. Does not place an order or charge money. Never claim a cart change until the tool succeeds.",
  inputSchema: z.object({ ids: z.array(z.enum(['towel', 'water', 'sticker', 'fan'])).min(1).max(4) }),
  outputSchema: z.object({ added: z.boolean(), items: z.array(itemSchema), total: z.number(), message: z.string() }),
  needsApproval: true,
});
export const blocks = [
  {
    id: "hero",
    text: "Vamos Alicante: beach essentials after the React talks.",
    kind: "essential",
  },
  {
    id: "features",
    text: "Browse beach essentials. Compare prices. Build a kit within your budget.",
    kind: "essential",
  },
  {
    id: "cta",
    text: "Review the products and demo cart. No payment or checkout.",
    kind: "essential",
  },
  {
    id: "cookie",
    text: "We use 438 cookies. Mostly because we are hungry.",
    kind: "clutter",
  },
  {
    id: "newsletter",
    text: "Join our newsletter about our other newsletter.",
    kind: "clutter",
  },
  {
    id: "ad",
    text: "BUY OUR WIFI-ENABLED BEACH TOWEL. Now with a mandatory firmware update.",
    kind: "clutter",
  },
  {
    id: "fomo",
    text: "47 imaginary conference attendees are looking at this page right now.",
    kind: "clutter",
  },
  {
    id: "video",
    text: "Autoplay: our CEO explains synergy for 19 minutes.",
    kind: "clutter",
  },
  {
    id: "chat",
    text: "Hi! Can I interrupt you before you know what we sell?",
    kind: "clutter",
  },
];
export const cleanupInput = z
  .object({
    goal: z.string().min(1).max(300),
    overrides: z.record(z.string(), z.string().max(240)).optional(),
  })
  .strict();
export const decisionSchema = z.object({
  category: z.enum(["keep", "clutter", "uncertain"]),
  probability: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1).optional(),
});
export function mayHide(id: string, decision: z.infer<typeof decisionSchema>) {
  const block = blocks.find((b) => b.id === id);
  return (
    !!block &&
    block.kind !== "essential" &&
    decision.category === "clutter" &&
    decision.probability >= 0.85 &&
    (decision.confidence === undefined || decision.confidence >= 0.85)
  );
}
