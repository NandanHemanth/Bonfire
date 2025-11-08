# MCP Integration Guide

## What is MCP?

**Model Context Protocol (MCP)** is Anthropic's open protocol that enables Claude to connect to external tools and data sources. BonFire uses MCP servers to orchestrate cross-functional workflows across Finance, HR, CI/CD, and Security teams.

## Architecture

```
┌──────────────┐
│    Claude    │ (AI orchestrator)
└──────┬───────┘
       │ MCP Protocol (JSON-RPC)
       │
       ┌─────────────────┬─────────────────┐
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Finance MCP │   │   HR MCP    │   │  CI/CD MCP  │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       ▼                 ▼                 ▼
  External APIs    HRIS Systems    GitHub Actions
```

## Available MCP Servers

### 1. Finance MCP

**Purpose:** Budget tracking, cost analysis, and approval workflows

**Tools:**
- `check_budget` - Verify if change is within budget
- `get_cost_analysis` - Get detailed cost breakdown
- `request_budget_approval` - Request additional budget

**Example:**
```typescript
// Check if deployment is within budget
const result = await mcpClient.callTool('finance', 'check_budget', {
  service: 'api-gateway',
  estimatedCost: 2500
});

// Result:
{
  approved: true,
  currentSpend: 7500,
  monthlyBudget: 10000,
  remainingBudget: 2500
}
```

### 2. HR MCP

**Purpose:** Team ownership, capacity planning, on-call management

**Tools:**
- `get_code_ownership` - Find who owns code
- `check_team_capacity` - Check if team has bandwidth
- `get_oncall_schedule` - Get on-call rotation

**Example:**
```typescript
// Check if team has capacity for new work
const result = await mcpClient.callTool('hr', 'check_team_capacity', {
  team: 'Platform Team'
});

// Result:
{
  currentCapacity: '75%',
  availableHours: 40,
  hasCapacity: true
}
```

### 3. CI/CD MCP

**Purpose:** Deployment automation and pipeline management

**Tools:**
- `trigger_deployment` - Deploy to environment
- `get_pipeline_status` - Check pipeline status
- `rollback_deployment` - Rollback to previous version

**Example:**
```typescript
// Trigger production deployment
const result = await mcpClient.callTool('cicd', 'trigger_deployment', {
  service: 'payment-api',
  environment: 'production',
  version: 'v2.1.0'
});

// Result:
{
  deploymentId: 'DEP-12345',
  status: 'in_progress',
  estimatedDuration: '5-10 minutes'
}
```

### 4. Security MCP

**Purpose:** Security scanning and compliance checks

**Tools:**
- `run_security_scan` - Scan for vulnerabilities
- `check_compliance` - Verify compliance standards
- `get_vulnerability_report` - Get detailed vulnerability info

**Example:**
```typescript
// Run security scan
const result = await mcpClient.callTool('security', 'run_security_scan', {
  path: 'src/',
  scanType: 'full'
});

// Result:
{
  findings: {
    critical: 0,
    high: 2,
    medium: 5,
    low: 12
  },
  passed: false
}
```

## Installation

### 1. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

### 2. Configure Claude Desktop

Edit `~/.config/claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "bonfire-finance": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/finance/dist/index.js"]
    },
    "bonfire-hr": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/hr/dist/index.js"]
    },
    "bonfire-cicd": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/cicd/dist/index.js"]
    },
    "bonfire-security": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/security/dist/index.js"]
    }
  }
}
```

### 3. Build MCP Servers

```bash
cd packages/mcp-servers/finance
npm run build

cd ../hr
npm run build

cd ../cicd
npm run build

cd ../security
npm run build
```

## Creating Custom MCP Servers

### 1. Create Server Structure

```bash
mkdir -p packages/mcp-servers/custom/src
cd packages/mcp-servers/custom
npm init -y
```

### 2. Install Dependencies

```json
{
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.5.0"
  }
}
```

### 3. Implement Server

```typescript
// src/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";

const server = new Server(
  {
    name: "bonfire-custom",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my_tool",
      description: "What my tool does",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string" }
        },
        required: ["param1"]
      }
    }
  ]
}));

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  if (name === "my_tool") {
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify({ result: "success" })
        }
      ]
    };
  }

  throw new Error(`Unknown tool: ${name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Custom MCP server running");
}

main();
```

## Orchestration Workflows

### Example: Automated Deployment

Claude can orchestrate a full deployment with all approvals:

```
User: "Deploy payment-api v2.1.0 to production"

Claude orchestrates:
  1. Finance MCP → Check budget
  2. HR MCP → Verify team has on-call coverage
  3. Security MCP → Run security scan
  4. CI/CD MCP → Trigger deployment
  5. All teams → Send notifications

Result: Deployment complete in 2 minutes vs 2-5 days manually
```

### Example: Cost Optimization

```
User: "Analyze costs and suggest optimizations"

Claude orchestrates:
  1. Finance MCP → Get cost breakdown by service
  2. CI/CD MCP → Check deployment frequencies
  3. Claude analyzes patterns
  4. Finance MCP → Calculate potential savings

Result: "Switch api-gateway to reserved instances for 30% savings ($3k/month)"
```

## Testing MCP Servers

### Unit Testing

```typescript
import { describe, it, expect } from 'vitest';
import { server } from './index';

describe('Finance MCP', () => {
  it('should check budget correctly', async () => {
    const result = await server.callTool('check_budget', {
      service: 'test',
      estimatedCost: 1000
    });

    expect(result.approved).toBeDefined();
  });
});
```

### Manual Testing

```bash
# Start MCP server
node dist/index.js

# Send test request (stdin)
{"jsonrpc":"2.0","method":"tools/call","params":{"name":"check_budget","arguments":{"service":"test","estimatedCost":1000}},"id":1}
```

## Troubleshooting

### MCP Server Not Starting

1. Check Node.js version (18+)
2. Verify build output exists: `ls dist/index.js`
3. Check logs in Claude Desktop

### Tool Not Found

1. Verify tool is listed in `ListToolsRequestSchema`
2. Check tool name matches exactly
3. Rebuild server: `npm run build`

### Connection Issues

1. Check `claude_desktop_config.json` paths
2. Verify MCP server is executable
3. Restart Claude Desktop

## Best Practices

1. **Error Handling** - Always return helpful error messages
2. **Validation** - Validate all input parameters
3. **Logging** - Use `console.error()` for logs (stdout is for MCP protocol)
4. **Async Operations** - Handle async operations properly
5. **Timeouts** - Implement timeouts for external API calls
6. **Security** - Never log sensitive data

## Resources

- [MCP Specification](https://github.com/anthropics/mcp)
- [MCP SDK Documentation](https://github.com/anthropics/mcp/tree/main/docs)
- [Example MCP Servers](https://github.com/anthropics/mcp-examples)
