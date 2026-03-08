import { z } from "zod";
import { toolResult, toolError } from "../lib/errors.js";
import { findApplication, findAsset, findProtocol } from "../lib/registry.js";

export function registerIdentifyTools(server) {
  server.tool(
    "identify_application",
    "Identify an Algorand application by ID — returns protocol, role, type, and description if known",
    {
      appId: z.number().int().describe("Application ID on Algorand"),
    },
    async ({ appId }) => {
      const app = findApplication(appId);
      if (!app) {
        return toolResult({
          appId,
          recognized: false,
          message: `Application ${appId} is not in the known Algorand registry.`,
        });
      }
      const protocol = app.protocol ? findProtocol(app.protocol) : null;
      return toolResult({
        appId,
        recognized: true,
        name: app.name,
        protocol: app.protocol,
        protocolName: protocol?.name || null,
        role: app.role,
        type: app.type,
        description: app.description,
      });
    }
  );

  server.tool(
    "identify_asset",
    "Identify an Algorand asset by ID — returns name, symbol, type, protocol association, and tags if known",
    {
      assetId: z.number().int().min(0).describe("Asset ID on Algorand (0 for ALGO)"),
    },
    async ({ assetId }) => {
      const asset = findAsset(assetId);
      if (!asset) {
        return toolResult({
          assetId,
          recognized: false,
          message: `Asset ${assetId} is not in the known Algorand registry.`,
        });
      }
      const protocol = asset.protocol ? findProtocol(asset.protocol) : null;
      return toolResult({
        assetId,
        recognized: true,
        name: asset.name,
        symbol: asset.symbol,
        decimals: asset.decimals,
        type: asset.type,
        protocol: asset.protocol,
        protocolName: protocol?.name || null,
        tags: asset.tags,
        description: asset.description,
      });
    }
  );

  server.tool(
    "get_contract_role",
    "Get the known protocol role for an Algorand application (e.g. amm-router, name-registry, lending-pool)",
    {
      appId: z.number().int().describe("Application ID on Algorand"),
    },
    async ({ appId }) => {
      const app = findApplication(appId);
      if (!app) {
        return toolError({
          code: "application_not_identified",
          message: `Application ${appId} is not in the known Algorand registry.`,
        });
      }
      return toolResult({
        appId,
        protocol: app.protocol,
        role: app.role,
        name: app.name,
        type: app.type,
        description: app.description,
      });
    }
  );
}
