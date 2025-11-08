import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "bonfire-hr",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "get_code_ownership",
      description: "Get team/person ownership for a code component",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "File or directory path" },
        },
        required: ["path"],
      },
    },
    {
      name: "check_team_capacity",
      description: "Check if team has capacity for new work",
      inputSchema: {
        type: "object",
        properties: {
          team: { type: "string", description: "Team name" },
        },
        required: ["team"],
      },
    },
    {
      name: "get_oncall_schedule",
      description: "Get on-call schedule for a team or service",
      inputSchema: {
        type: "object",
        properties: {
          team: { type: "string", description: "Team name" },
        },
        required: ["team"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "get_code_ownership") {
    const { path } = args as { path: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            path,
            owner: "Platform Team",
            primaryContact: "alice@company.com",
            backupContact: "bob@company.com",
            lastModified: "2024-01-15",
            contributors: [
              { name: "Alice", commits: 45 },
              { name: "Bob", commits: 23 },
            ],
          }, null, 2),
        },
      ],
    };
  }

  if (name === "check_team_capacity") {
    const { team } = args as { team: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            team,
            currentCapacity: "75%",
            availableHours: 40,
            hasCapacity: true,
            upcomingPTO: 2,
            recommendedWaitTime: "none",
          }, null, 2),
        },
      ],
    };
  }

  if (name === "get_oncall_schedule") {
    const { team } = args as { team: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            team,
            currentOncall: "Charlie",
            nextRotation: "2024-02-01",
            schedule: [
              { week: "2024-W5", engineer: "Charlie" },
              { week: "2024-W6", engineer: "Dana" },
            ],
          }, null, 2),
        },
      ],
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("🔥 BonFire HR MCP server running");
}

main();
