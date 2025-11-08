# BonFire Workflow Builder - Quick Start Guide

## What You've Got

A complete enterprise workflow automation platform with:
- ✅ 2D Canvas Workflow Builder (drag & drop)
- ✅ AI-Powered Workflow Generation (Gemini + Dedalus)
- ✅ 30+ Enterprise Tool Integrations
- ✅ MCP (Model Context Protocol) Support
- ✅ Complete API Integration Layer

## Quick Start (3 Steps)

### 1. Set Up Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your API keys (Dedalus key is already there!)
# At minimum, you need:
# - GEMINI_API_KEY (get from https://makersuite.google.com/app/apikey)
```

### 2. Start the Application

```bash
npm run dev:all
```

This starts:
- Web App: http://localhost:3000
- API Server: http://localhost:3001

### 3. Create Your First Workflow

1. Open http://localhost:3000
2. Click "Workflows" in navigation
3. You'll see the workflow builder with:
   - **Left**: Node Library (Slack, Jira, MS Teams, etc.)
   - **Center**: Canvas
   - **Right**: Saved Workflows
   - **Bottom**: AI Assistant

## Using the AI Assistant

### Method 1: Use Gemini (Default - Free)

Click "AI Assistant" button and type:
```
Create a workflow that sends a Slack message when a Jira issue is created
```

### Method 2: Use Dedalus AI (Advanced - GPT-4)

Type `@dedalus` in your message:
```
@dedalus Create a complex workflow that monitors GitHub, creates Jira tickets, and notifies Teams
```

## Manual Workflow Creation

1. **Drag Nodes**: Drag from library to canvas
2. **Connect**: Click and drag from one node to another
3. **Save**: Click "Save" button
4. **Run**: Click "Run" to execute

## API Keys You Need

### Essential (For Core Features)

1. **Gemini API** (Google AI)
   - Get from: https://makersuite.google.com/app/apikey
   - Free tier available
   - Required for: AI workflow generation

2. **Dedalus API** (Advanced AI)
   - Already configured: `dsk_test_df0fe003f0db_73c8348ae905bca2f64be6c9aa80d2b5`
   - For production: Get from https://dedaluslabs.ai
   - Required for: `@dedalus` AI workflows

### Optional (For Integrations)

3. **Slack API**
   - Guide: [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md#1-slack-api-setup)
   - Get from: https://api.slack.com/apps
   - Required for: Slack nodes in workflows

4. **Jira API**
   - Guide: [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md#2-jira-api-setup)
   - Get from: https://id.atlassian.com/manage-profile/security/api-tokens
   - Required for: Jira nodes

5. **Microsoft Graph API** (Office 365)
   - Guide: [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md#3-microsoft-graph-api-setup)
   - Get from: Azure Portal
   - Required for: Outlook, Teams, OneDrive, SharePoint, Calendar

## Example Workflows

### Example 1: Slack Notification on Jira Issue

**Using AI:**
```
@dedalus When a critical Jira issue is created, send a Slack message to #engineering
```

**Manual:**
1. Drag "Jira" node to canvas
2. Drag "Slack" node to canvas
3. Connect Jira → Slack
4. Save workflow

### Example 2: GitHub to Teams Integration

```
@dedalus Create a workflow:
1. Monitor GitHub for new pull requests
2. Send notification to Teams #dev-team channel
3. Create calendar reminder for code review
```

### Example 3: Email Automation

```
Create a workflow that sends an email summary of today's calendar events every morning at 9 AM
```

## Troubleshooting

### Port Already in Use

```bash
# On Windows
netstat -ano | findstr ":3000"
taskkill /PID <PID> /F

# Or use different ports in .env
WEB_URL=http://localhost:3002
API_URL=http://localhost:3003
```

### API Connection Errors

1. Check `.env` file has correct API keys
2. Test Dedalus connection:
   ```bash
   curl http://localhost:3001/api/integrations/dedalus/test
   ```

### Workflow Not Generating

1. Make sure API server is running (http://localhost:3001)
2. Check browser console for errors (F12)
3. Verify Gemini/Dedalus API key is set

## Documentation

- **API Setup**: [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md) - How to get all API keys
- **Dedalus Integration**: [docs/DEDALUS_INTEGRATION.md](docs/DEDALUS_INTEGRATION.md) - Using @dedalus AI
- **MCP Integration**: [docs/MCP_ENTERPRISE_INTEGRATION.md](docs/MCP_ENTERPRISE_INTEGRATION.md) - Advanced enterprise features

## Next Steps

1. ✅ Start with AI-generated workflows to learn
2. ✅ Add your enterprise API keys as needed
3. ✅ Build custom workflows manually
4. ✅ Set up MCP servers for advanced automation
5. ✅ Deploy to production

## Pro Tips

### 1. Start with @dedalus

For your first workflow, use `@dedalus` to see the quality difference:
```
@dedalus Create a workflow to onboard new employees
```

### 2. Use Specific Prompts

Better results with detailed prompts:
```
@dedalus Build a DevOps workflow:
- Trigger: GitHub PR merged to main
- Action: Run CI/CD pipeline
- Condition: If tests pass, deploy to staging
- Action: Notify on Slack
- Action: Create Jira release ticket
```

### 3. Iterate

Start simple, then refine:
1. "Create a Slack notification workflow"
2. Review and save
3. "@dedalus improve this workflow to include error handling"

## Features Overview

### Drag & Drop Canvas
- Visual workflow builder
- Real-time node connections
- Minimap for large workflows
- Auto-save

### AI Generation
- **Gemini**: Fast, free, good for simple workflows
- **Dedalus**: Advanced, GPT-4, complex logic, tool calling

### Enterprise Integrations
- **Communication**: Slack, Teams, Email
- **Project Mgmt**: Jira, Asana, Trello
- **Microsoft 365**: Full suite (Outlook, OneDrive, Calendar, SharePoint, Excel)
- **Development**: GitHub, GitLab, Jenkins
- **Data**: PostgreSQL, MongoDB, Redis
- **Custom APIs**: Any REST API

### Execution
- Test workflows before deploying
- Monitor execution logs
- Error handling
- Conditional logic

## Support

Questions? Check:
1. This guide first
2. [docs/API_SETUP_GUIDE.md](docs/API_SETUP_GUIDE.md) for API keys
3. [docs/DEDALUS_INTEGRATION.md](docs/DEDALUS_INTEGRATION.md) for AI features
4. Console logs (browser F12, server terminal)

## Ready?

```bash
npm run dev:all
```

Then navigate to http://localhost:3000/workflows and start building! 🔥
