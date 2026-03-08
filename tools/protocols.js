import { z } from "zod";
import { toolResult, toolError } from "../lib/errors.js";
import {
  getProtocols,
  findProtocol,
  protocolContracts,
  protocolAssets,
} from "../lib/registry.js";

export function registerProtocolTools(server) {
  server.tool(
    "get_protocols",
    "List all known Algorand protocols with type and description",
    {
      type: z
        .string()
        .optional()
        .describe(
          "Filter by protocol type (dex, lending, naming-service, bridge, etc.)"
        ),
    },
    async ({ type }) => {
      let list = getProtocols();
      if (type) {
        list = list.filter((p) => p.type === type);
      }
      return toolResult({
        protocols: list.map((p) => ({
          id: p.id,
          name: p.name,
          type: p.type,
          description: p.description,
          tags: p.tags,
        })),
      });
    }
  );

  server.tool(
    "get_protocol",
    "Get detailed information about a specific Algorand protocol by ID",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. tinyman, nfdomains, folks-finance)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError({
          code: "protocol_not_found",
          message: `Unknown Algorand protocol: ${protocolId}`,
        });
      }
      return toolResult(protocol);
    }
  );

  server.tool(
    "get_protocol_contracts",
    "List all known application contracts for an Algorand protocol",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. tinyman, nfdomains)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError({
          code: "protocol_not_found",
          message: `Unknown Algorand protocol: ${protocolId}`,
        });
      }
      const contracts = protocolContracts(protocolId);
      const assets = protocolAssets(protocolId);
      return toolResult({
        protocolId,
        name: protocol.name,
        contracts,
        assets,
      });
    }
  );

  server.tool(
    "get_protocol_summary",
    "Get a concise agent-friendly summary of an Algorand protocol including its purpose, contracts, and assets",
    {
      protocolId: z
        .string()
        .describe("Protocol identifier (e.g. tinyman, folks-finance)"),
    },
    async ({ protocolId }) => {
      const protocol = findProtocol(protocolId);
      if (!protocol) {
        return toolError({
          code: "protocol_not_found",
          message: `Unknown Algorand protocol: ${protocolId}`,
        });
      }
      const contracts = protocolContracts(protocolId);
      const assets = protocolAssets(protocolId);

      const parts = [
        `${protocol.name} (${protocol.type})`,
        protocol.description,
      ];

      if (protocol.website) {
        parts.push(`Website: ${protocol.website}`);
      }

      if (contracts.length > 0) {
        parts.push(
          `Known contracts: ${contracts.map((c) => `${c.name} (${c.appId})`).join(", ")}`
        );
      }

      if (assets.length > 0) {
        parts.push(
          `Associated assets: ${assets.map((a) => `${a.symbol || a.name} (${a.assetId})`).join(", ")}`
        );
      }

      if (protocol.tags?.length > 0) {
        parts.push(`Tags: ${protocol.tags.join(", ")}`);
      }

      return toolResult({
        protocolId,
        summary: parts.join("\n"),
      });
    }
  );
}
