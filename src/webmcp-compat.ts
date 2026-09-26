import type { AnyClientTool } from "@tanstack/ai-client";

// Chrome 154 exposes JSON-string schemas and arguments; newer implementations
// may expose objects. Adapt the wire format without replacing the native registry.
export function normalizeNativeTools(tools: AnyClientTool[]): AnyClientTool[] {
  return tools.map((tool) => {
    if (typeof tool.inputSchema !== "string") return tool;
    const schema = JSON.parse(tool.inputSchema);
    return {
      ...tool,
      inputSchema: schema,
      async execute(input, context) {
        const native = (
          document as unknown as {
            modelContext: {
              getTools(): Promise<Array<{ name: string }>>;
              executeTool(
                tool: unknown,
                input: string,
                options?: { signal?: AbortSignal },
              ): Promise<string>;
            };
          }
        ).modelContext;
        const descriptor = (await native.getTools()).find(
          (entry) => entry.name === tool.name,
        );
        if (!descriptor)
          throw new Error("The native page tool is no longer registered.");
        const result = await native.executeTool(
          descriptor,
          JSON.stringify(input),
          { signal: context?.abortSignal },
        );
        try {
          return JSON.parse(result);
        } catch {
          return result;
        }
      },
    };
  });
}
