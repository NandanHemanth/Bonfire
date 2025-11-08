import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "bonfire-finance",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "check_budget",
      description: "Check if deployment/change is within budget constraints",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service or component name" },
          estimatedCost: { type: "number", description: "Estimated monthly cost in USD" },
        },
        required: ["service", "estimatedCost"],
      },
    },
    {
      name: "get_cost_analysis",
      description: "Get cost breakdown and analysis for a service",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
          timeframe: {
            type: "string",
            enum: ["daily", "weekly", "monthly"],
            description: "Analysis timeframe"
          },
        },
        required: ["service"],
      },
    },
    {
      name: "request_budget_approval",
      description: "Request budget approval for deployment or infrastructure change",
      inputSchema: {
        type: "object",
        properties: {
          requestor: { type: "string", description: "Person requesting approval" },
          amount: { type: "number", description: "Amount in USD" },
          reason: { type: "string", description: "Reason for request" },
        },
        required: ["requestor", "amount", "reason"],
      },
    },
  ],
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "check_budget") {
    const { service, estimatedCost } = args as { service: string; estimatedCost: number };

    // Simulate budget check
    const monthlyBudget = 10000; // $10k per service
    const currentSpend = 7500;
    const remainingBudget = monthlyBudget - currentSpend;
    const approved = estimatedCost <= remainingBudget;

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            service,
            estimatedCost,
            currentSpend,
            monthlyBudget,
            remainingBudget,
            approved,
            message: approved
              ? `✅ Budget approved. ${service} deployment within budget.`
              : `❌ Budget exceeded. Need additional $${estimatedCost - remainingBudget} approval.`,
          }, null, 2),
        },
      ],
    };
  }

  if (name === "get_cost_analysis") {
    const { service, timeframe = "monthly" } = args as { service: string; timeframe?: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            service,
            timeframe,
            breakdown: {
              compute: 4500,
              storage: 1200,
              network: 800,
              database: 1000,
            },
            total: 7500,
            trend: "stable",
            recommendations: [
              "Consider reserved instances for 30% savings",
              "Archive old logs to reduce storage costs",
            ],
          }, null, 2),
        },
      ],
    };
  }

  if (name === "request_budget_approval") {
    const { requestor, amount, reason } = args as {
      requestor: string;
      amount: number;
      reason: string;
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            approvalId: `APR-${Date.now()}`,
            status: "pending",
            requestor,
            amount,
            reason,
            estimatedApprovalTime: "2-4 hours",
            message: `Budget approval request submitted for $${amount}`,
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
  console.error("🔥 BonFire Finance MCP server running");
}

main();
