import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "bonfire-security",
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
      name: "run_security_scan",
      description: "Run security vulnerability scan on code",
      inputSchema: {
        type: "object",
        properties: {
          path: { type: "string", description: "Path to scan" },
          scanType: {
            type: "string",
            enum: ["dependencies", "code", "secrets", "full"],
            description: "Type of security scan"
          },
        },
        required: ["path"],
      },
    },
    {
      name: "check_compliance",
      description: "Check compliance with security policies",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
          standard: {
            type: "string",
            enum: ["SOC2", "HIPAA", "PCI-DSS", "GDPR"],
            description: "Compliance standard"
          },
        },
        required: ["service"],
      },
    },
    {
      name: "get_vulnerability_report",
      description: "Get vulnerability report for a service",
      inputSchema: {
        type: "object",
        properties: {
          service: { type: "string", description: "Service name" },
        },
        required: ["service"],
      },
    },
  ],
}));

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "run_security_scan") {
    const { path, scanType = "full" } = args as { path: string; scanType?: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            scanId: `SCAN-${Date.now()}`,
            path,
            scanType,
            status: "completed",
            findings: {
              critical: 0,
              high: 2,
              medium: 5,
              low: 12,
            },
            issues: [
              {
                severity: "high",
                type: "dependency",
                package: "lodash",
                version: "4.17.15",
                recommendation: "Upgrade to 4.17.21+",
              },
            ],
            passed: false,
            message: "Found 2 high severity issues requiring attention",
          }, null, 2),
        },
      ],
    };
  }

  if (name === "check_compliance") {
    const { service, standard = "SOC2" } = args as {
      service: string;
      standard?: string;
    };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            service,
            standard,
            compliant: true,
            lastAudit: "2024-01-15",
            nextAudit: "2024-04-15",
            requirements: {
              encryption: "pass",
              accessControl: "pass",
              logging: "pass",
              backups: "pass",
            },
          }, null, 2),
        },
      ],
    };
  }

  if (name === "get_vulnerability_report") {
    const { service } = args as { service: string };

    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({
            service,
            summary: {
              total: 19,
              critical: 0,
              high: 2,
              medium: 5,
              low: 12,
            },
            topVulnerabilities: [
              {
                cve: "CVE-2024-1234",
                severity: "high",
                package: "express",
                fixed: "4.18.2",
              },
            ],
            trend: "improving",
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
  console.error("🔥 BonFire Security MCP server running");
}

main();
