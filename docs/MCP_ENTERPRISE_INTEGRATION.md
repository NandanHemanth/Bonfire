# MCP (Model Context Protocol) Enterprise Integration Guide

## Overview

The Model Context Protocol (MCP) allows AI models like Claude and Gemini to interact with your enterprise tools and APIs. This guide shows you how to set up MCP servers for all your enterprise integrations.

## What is MCP?

MCP is Anthropic's standardized protocol that allows AI assistants to:
- Access external data sources
- Execute actions in external systems
- Use tools and integrations
- Maintain context across conversations

## Architecture

```
┌─────────────────┐
│   AI Model      │
│ (Claude/Gemini) │
└────────┬────────┘
         │
         │ MCP Protocol
         │
┌────────▼────────┐
│   MCP Server    │
│  (Your Custom)  │
└────────┬────────┘
         │
         ├─────► Slack API
         ├─────► Jira API
         ├─────► Microsoft Graph API
         ├─────► GitHub API
         └─────► Custom Enterprise APIs
```

## Setting Up MCP Servers for Enterprise Tools

### 1. Slack MCP Server

#### Required APIs
- **Slack Web API**: For posting messages, reading channels, managing users
- **Slack Events API**: For real-time notifications

#### Setup Steps

1. **Create Slack App** (see API_SETUP_GUIDE.md)
2. **Get API Keys**:
   - Bot Token (`xoxb-...`)
   - App Token (`xapp-...`)
   - Webhook URL

3. **Create MCP Server**:

```typescript
// packages/mcp-servers/slack/index.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { WebClient } from '@slack/web-api';

const slackClient = new WebClient(process.env.SLACK_BOT_TOKEN);

const server = new Server({
  name: 'slack-mcp-server',
  version: '1.0.0',
}, {
  capabilities: {
    tools: {},
  },
});

// Tool: Send message to Slack
server.setRequestHandler('tools/call', async (request) => {
  if (request.params.name === 'send_slack_message') {
    const { channel, text } = request.params.arguments as any;

    const result = await slackClient.chat.postMessage({
      channel,
      text,
    });

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result),
      }],
    };
  }

  if (request.params.name === 'list_channels') {
    const result = await slackClient.conversations.list();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(result.channels),
      }],
    };
  }

  throw new Error('Unknown tool');
});

// List available tools
server.setRequestHandler('tools/list', async () => {
  return {
    tools: [
      {
        name: 'send_slack_message',
        description: 'Send a message to a Slack channel',
        inputSchema: {
          type: 'object',
          properties: {
            channel: { type: 'string', description: 'Channel ID or name' },
            text: { type: 'string', description: 'Message text' },
          },
          required: ['channel', 'text'],
        },
      },
      {
        name: 'list_channels',
        description: 'List all Slack channels',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

const transport = new StdioServerTransport();
await server.connect(transport);
```

### 2. Jira MCP Server

#### Required APIs
- **Jira REST API v3**: For issue management
- **Jira Cloud Platform API**: For advanced features

#### Tools to Implement
- `create_jira_issue`: Create new issues
- `get_jira_issue`: Get issue details
- `update_jira_issue`: Update existing issues
- `search_jira_issues`: Search using JQL
- `list_jira_projects`: List all projects
- `transition_issue`: Change issue status

### 3. Microsoft Graph MCP Server

#### Required APIs
- **Microsoft Graph API**: Unified API for Microsoft 365

#### Scopes Needed
```
Mail.Read
Mail.Send
Calendars.Read
Calendars.ReadWrite
Files.Read.All
Files.ReadWrite.All
User.Read.All
Team.ReadBasic.All
Channel.ReadBasic.All
```

#### Tools to Implement

**Email Operations**:
- `send_email`: Send emails via Outlook
- `read_emails`: Read inbox messages
- `search_emails`: Search emails by query

**Calendar Operations**:
- `create_calendar_event`: Create new events
- `list_calendar_events`: List upcoming events
- `update_calendar_event`: Update existing events

**OneDrive Operations**:
- `upload_file`: Upload files to OneDrive
- `download_file`: Download files
- `list_files`: List files and folders
- `share_file`: Create sharing links

**Teams Operations**:
- `send_teams_message`: Send message to Teams channel
- `list_teams`: List all teams
- `list_team_channels`: List channels in a team

**SharePoint Operations**:
- `list_sharepoint_sites`: List SharePoint sites
- `upload_to_sharepoint`: Upload documents
- `get_sharepoint_list`: Get list items

### 4. GitHub MCP Server

#### Required APIs
- **GitHub REST API**: For repository operations
- **GitHub GraphQL API**: For complex queries

#### Tools to Implement
- `create_github_issue`: Create issues
- `create_pull_request`: Create PRs
- `list_repositories`: List repos
- `get_commit_history`: Get commits
- `trigger_workflow`: Trigger GitHub Actions

### 5. Custom Enterprise MCP Server

For internal tools and custom APIs.

#### Tools to Implement
- `query_internal_database`: Query company database
- `call_internal_api`: Call internal REST APIs
- `execute_business_logic`: Run custom workflows

## Complete API List for Enterprise Integration

### Communication & Collaboration

1. **Slack**
   - Get from: https://api.slack.com/apps
   - APIs: Web API, Events API, RTM API
   - Required: Bot Token, Webhook URL

2. **Microsoft Teams**
   - Get from: Azure Portal (Graph API)
   - APIs: Graph API (Teams endpoints)
   - Required: Client ID, Client Secret, Tenant ID

3. **Discord** (optional)
   - Get from: https://discord.com/developers/applications
   - APIs: Discord API
   - Required: Bot Token, Application ID

### Project Management

4. **Jira**
   - Get from: https://id.atlassian.com/manage-profile/security/api-tokens
   - APIs: REST API v3, Cloud Platform API
   - Required: API Token, Base URL, Email

5. **Asana**
   - Get from: https://app.asana.com/0/my-apps
   - APIs: Asana API
   - Required: Personal Access Token

6. **Trello**
   - Get from: https://trello.com/power-ups/admin
   - APIs: Trello REST API
   - Required: API Key, Token

7. **Linear**
   - Get from: https://linear.app/settings/api
   - APIs: Linear API (GraphQL)
   - Required: API Key

8. **Monday.com**
   - Get from: https://monday.com/developers/apps
   - APIs: Monday API (GraphQL)
   - Required: API Token

### Microsoft 365 Suite

9. **Microsoft Graph API** (covers all below)
   - Get from: Azure Portal
   - Required: Client ID, Client Secret, Tenant ID

   Includes:
   - Outlook (Email)
   - Calendar
   - OneDrive
   - SharePoint
   - Teams
   - Excel Online
   - Word Online
   - OneNote

### Development & DevOps

10. **GitHub**
    - Get from: https://github.com/settings/tokens
    - APIs: REST API, GraphQL API
    - Required: Personal Access Token

11. **GitLab**
    - Get from: https://gitlab.com/-/profile/personal_access_tokens
    - APIs: GitLab API
    - Required: Personal Access Token

12. **Bitbucket**
    - Get from: https://bitbucket.org/account/settings/app-passwords/
    - APIs: Bitbucket Cloud API
    - Required: App Password

13. **Jenkins**
    - Get from: Your Jenkins instance
    - APIs: Jenkins REST API
    - Required: API Token, Jenkins URL

14. **CircleCI**
    - Get from: https://app.circleci.com/settings/user/tokens
    - APIs: CircleCI API v2
    - Required: API Token

15. **Travis CI**
    - Get from: https://app.travis-ci.com/account/preferences
    - APIs: Travis CI API
    - Required: API Token

### Cloud Platforms

16. **AWS**
    - Get from: AWS IAM Console
    - APIs: AWS SDK (S3, Lambda, EC2, etc.)
    - Required: Access Key ID, Secret Access Key

17. **Google Cloud Platform**
    - Get from: GCP Console
    - APIs: Google Cloud APIs
    - Required: Service Account Key (JSON)

18. **Azure**
    - Get from: Azure Portal
    - APIs: Azure SDK
    - Required: Subscription ID, Credentials

### Data & Storage

19. **Google Drive**
    - Get from: Google Cloud Console
    - APIs: Google Drive API
    - Required: OAuth 2.0 Credentials

20. **Dropbox**
    - Get from: https://www.dropbox.com/developers/apps
    - APIs: Dropbox API
    - Required: Access Token

21. **Box**
    - Get from: https://app.box.com/developers/console
    - APIs: Box API
    - Required: Developer Token

### AI & Analytics

22. **Google Gemini**
    - Get from: https://makersuite.google.com/app/apikey
    - APIs: Gemini API
    - Required: API Key

23. **OpenAI**
    - Get from: https://platform.openai.com/api-keys
    - APIs: OpenAI API
    - Required: API Key

24. **Anthropic Claude**
    - Get from: https://console.anthropic.com/
    - APIs: Claude API
    - Required: API Key

### Documentation & Knowledge

25. **Notion**
    - Get from: https://www.notion.so/my-integrations
    - APIs: Notion API
    - Required: Integration Token

26. **Confluence**
    - Get from: Atlassian (same as Jira)
    - APIs: Confluence REST API
    - Required: API Token, Base URL

27. **Docusign**
    - Get from: https://developers.docusign.com/
    - APIs: DocuSign eSignature API
    - Required: Integration Key, Secret

### CRM & Sales

28. **Salesforce**
    - Get from: Salesforce Setup
    - APIs: Salesforce REST API
    - Required: Consumer Key, Consumer Secret

29. **HubSpot**
    - Get from: https://app.hubspot.com/settings/api
    - APIs: HubSpot API
    - Required: API Key or OAuth

30. **Zendesk**
    - Get from: Zendesk Admin
    - APIs: Zendesk API
    - Required: API Token, Subdomain

### Databases

31. **PostgreSQL**
    - Built-in driver
    - Required: Connection string

32. **MongoDB**
    - Built-in driver
    - Required: Connection string

33. **Redis**
    - Built-in driver
    - Required: Connection string

34. **MySQL**
    - Built-in driver
    - Required: Connection string

## MCP Server Configuration

### package.json for MCP Servers

Each MCP server needs these dependencies:

```json
{
  "name": "@bonfire/mcp-server-enterprise",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "@modelcontextprotocol/sdk": "^0.4.0",
    "@slack/web-api": "^6.12.0",
    "@microsoft/microsoft-graph-client": "^3.0.7",
    "@google/generative-ai": "^0.2.0",
    "axios": "^1.6.0",
    "isomorphic-fetch": "^3.0.0"
  }
}
```

### Claude Desktop Configuration

To use MCP servers with Claude Desktop, add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "slack": {
      "command": "node",
      "args": ["./packages/mcp-servers/slack/index.js"],
      "env": {
        "SLACK_BOT_TOKEN": "xoxb-your-token"
      }
    },
    "jira": {
      "command": "node",
      "args": ["./packages/mcp-servers/jira/index.js"],
      "env": {
        "JIRA_API_TOKEN": "your-token",
        "JIRA_BASE_URL": "https://your-company.atlassian.net",
        "JIRA_EMAIL": "your-email@company.com"
      }
    },
    "microsoft": {
      "command": "node",
      "args": ["./packages/mcp-servers/microsoft/index.js"],
      "env": {
        "MICROSOFT_CLIENT_ID": "your-client-id",
        "MICROSOFT_CLIENT_SECRET": "your-secret",
        "MICROSOFT_TENANT_ID": "your-tenant-id"
      }
    }
  }
}
```

## Using MCP in BonFire Workflows

Once MCP servers are set up, you can:

1. **AI-Powered Automation**: Let Claude/Gemini execute workflows
2. **Natural Language Control**: Describe workflows in plain English
3. **Context-Aware Actions**: AI understands your enterprise context
4. **Smart Recommendations**: AI suggests workflow improvements

### Example Workflow with MCP

```typescript
// User asks: "When a critical Jira issue is created, notify the team on Slack"

// AI generates workflow using MCP:
1. MCP Jira Server: Monitor for new issues with priority=Critical
2. MCP Slack Server: Send message to #engineering channel
3. MCP Microsoft Server: Create calendar event for triage meeting
4. MCP GitHub Server: Create tracking issue in ops repo
```

## Quick Start Guide

### 1. Install MCP SDK

```bash
npm install @modelcontextprotocol/sdk
```

### 2. Create Your First MCP Server

```bash
cd packages/mcp-servers
mkdir enterprise
cd enterprise
npm init -y
npm install @modelcontextprotocol/sdk
```

### 3. Implement Basic Server

See the code examples above for Slack, Jira, and Microsoft Graph.

### 4. Test the Server

```bash
node index.js
```

### 5. Connect to Claude/Gemini

Update your AI client configuration to include the MCP server.

## Environment Variables Summary

Add all these to your `.env` file:

```bash
# Slack
SLACK_BOT_TOKEN=xoxb-...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...

# Jira
JIRA_API_TOKEN=...
JIRA_BASE_URL=https://yourcompany.atlassian.net
JIRA_EMAIL=your@email.com

# Microsoft
MICROSOFT_CLIENT_ID=...
MICROSOFT_CLIENT_SECRET=...
MICROSOFT_TENANT_ID=...

# GitHub
GITHUB_TOKEN=ghp_...

# Gemini
GEMINI_API_KEY=...

# Claude
ANTHROPIC_API_KEY=...
```

## Best Practices

1. **Security**: Never commit API keys to Git
2. **Rate Limiting**: Implement rate limiting for API calls
3. **Error Handling**: Handle API errors gracefully
4. **Logging**: Log all MCP tool calls for debugging
5. **Testing**: Test each MCP tool thoroughly
6. **Documentation**: Document what each tool does

## Troubleshooting

### Common Issues

1. **Authentication Errors**: Check API keys and tokens
2. **Permission Errors**: Verify API scopes/permissions
3. **Rate Limits**: Implement exponential backoff
4. **Network Issues**: Check firewall and proxy settings

## Next Steps

1. Set up your enterprise API keys (see API_SETUP_GUIDE.md)
2. Create MCP servers for your tools
3. Test MCP servers independently
4. Integrate with BonFire workflows
5. Enable AI-powered automation

## Resources

- MCP Specification: https://spec.modelcontextprotocol.io/
- Anthropic MCP Docs: https://docs.anthropic.com/en/docs/model-context-protocol
- Sample MCP Servers: https://github.com/modelcontextprotocol/servers
