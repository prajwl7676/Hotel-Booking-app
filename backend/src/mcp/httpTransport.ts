import express from "express";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { mcpServer } from "./server";

export function startHttpMcp() {
  const app = express();
  app.use(express.json());

  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined });

  app.all("/mcp", (req, res) => {
    transport.handleRequest(req, res);
  });

  mcpServer.connect(transport);

  app.listen(7001, () => {
    console.log("MCP HTTP transport running on :7001");
  });
}
