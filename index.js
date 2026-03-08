import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerProtocolTools } from "./tools/protocols.js";
import { registerIdentifyTools } from "./tools/identify.js";
import { registerNameTools } from "./tools/names.js";

const server = new McpServer({
  name: "ulu-algorand-mcp",
  version: "1.0.0",
});

registerProtocolTools(server);
registerIdentifyTools(server);
registerNameTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
