import { z } from "zod";
import { toolResult, toolError } from "../lib/errors.js";
import { getNames } from "../lib/registry.js";

export function registerNameTools(server) {
  server.tool(
    "resolve_name",
    "Resolve an Algorand name (e.g. 'example.algo') to its address and metadata from the static registry. For live resolution, use UluCoreMCP or NFDomains API.",
    {
      name: z
        .string()
        .describe("Algorand name to resolve (e.g. 'pera.algo')"),
    },
    async ({ name }) => {
      const normalized = name.toLowerCase().trim();
      const registry = getNames();
      const entry = registry.names[normalized];
      if (!entry) {
        return toolError({
          code: "name_not_found",
          message: `Name '${normalized}' is not in the static Algorand name registry. Try the NFDomains API for live resolution.`,
        });
      }
      return toolResult({
        name: normalized,
        ...entry,
        source: registry.meta.source,
      });
    }
  );

  server.tool(
    "reverse_resolve_address",
    "Look up well-known Algorand names associated with an address from the static registry. For live resolution, use UluCoreMCP or NFDomains API.",
    {
      address: z
        .string()
        .describe("Algorand wallet address to reverse-resolve"),
    },
    async ({ address }) => {
      const registry = getNames();
      const matches = [];
      for (const [name, entry] of Object.entries(registry.names)) {
        if (entry.address === address) {
          matches.push({ name, ...entry });
        }
      }
      if (matches.length === 0) {
        return toolResult({
          address,
          names: [],
          message:
            "No known names found for this address in the static registry. Try the NFDomains API for live resolution.",
        });
      }
      return toolResult({ address, names: matches });
    }
  );

  server.tool(
    "search_names",
    "Search the static Algorand name registry by pattern. Returns matching .algo names.",
    {
      pattern: z
        .string()
        .describe("Search pattern (substring match against registered names)"),
    },
    async ({ pattern }) => {
      const query = pattern.toLowerCase().trim();
      if (!query) {
        return toolError({
          code: "invalid_input",
          message: "Search pattern must not be empty.",
        });
      }
      const registry = getNames();
      const matches = [];
      for (const [name, entry] of Object.entries(registry.names)) {
        if (name.includes(query)) {
          matches.push({ name, ...entry });
        }
      }
      return toolResult({
        pattern: query,
        results: matches,
        count: matches.length,
      });
    }
  );
}
