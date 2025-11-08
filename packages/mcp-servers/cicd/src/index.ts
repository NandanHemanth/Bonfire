import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "bonfire-cicd",
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
      name: "trigger_deployment",
      description: "Trigger a deployment to specified environment",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
          environment: {
            type: "string",
            enum: ["development", "staging", "production"],
            description: "Target environment"
          },
          version: { type: "string", description: "Version/tag to deploy" },
        },
        required: ["service", "environment"],
      },
    },
    {
      name: "get_pipeline_status",
      description: "Get CI/CD pipeline status",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
        },
        required: ["service"],
      },
    },
    {
      name: "rollback_deployment",
      description: "Rollback to previous deployment",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
          environment: { type: "string", description: "Environment" },
        },
        required: ["service", "environment"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "trigger_deployment") {
    const { service, environment, version = "latest" } = args as {
      service: string;
      environment: string;
      version?: string;
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            deploymentId: `DEP-${Date.now()}`,
            service,
            environment,
            version,
            status: "in_progress",
            startedAt: new Date().toISOString(),
            estimatedDuration: "5-10 minutes",
            pipelineUrl: `https://github.com/your-org/${service}/actions`,
          }, null, 2),
        },
      ],
    };
  }

  if (name === "get_pipeline_status") {
    const { service } = args as { service: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            service,
            lastDeployment: {
              environment: "production",
              status: "success",
              version: "v1.2.3",
              deployedAt: "2024-01-20T10:30:00Z",
            },
            currentPipeline: {
              status: "running",
              stage: "tests",
              progress: "60%",
            },
          }, null, 2),
        },
      ],
    };
  }

  if (name === "rollback_deployment") {
    const { service, environment } = args as { service: string; environment: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            rollbackId: `RB-${Date.now()}`,
            service,
            environment,
            previousVersion: "v1.2.2",
            status: "initiated",
            estimatedDuration: "3-5 minutes",
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
  console.error("🔥 BonFire CI/CD MCP server running");
}

main();
