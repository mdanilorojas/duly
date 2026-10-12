#!/usr/bin/env node
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { createDulyServer } from "./server.js";

const server = createDulyServer();
await server.connect(new StdioServerTransport());
