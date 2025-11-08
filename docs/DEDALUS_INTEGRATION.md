# Dedalus AI Integration Guide

## Overview

Dedalus AI is now integrated into BonFire's workflow builder, providing advanced AI-powered workflow generation using GPT-4 and other state-of-the-art language models.

## What is Dedalus?

Dedalus Labs provides an AI agent SDK with:
- **Advanced LLM Support**: GPT-4, GPT-4-turbo, Claude, and more
- **Tool Calling**: AI can execute functions and use tools
- **MCP Integration**: Model Context Protocol support
- **Streaming Responses**: Real-time workflow generation
- **Smart Reasoning**: Better workflow logic and optimization

## Setup

### 1. API Key Configuration

Your Dedalus API key is already configured in `.env.example`:

```bash
DEDALUS_API_KEY=dsk_test_df0fe003f0db_73c8348ae905bca2f64be6c9aa80d2b5
DEDALUS_API_URL=https://api.dedaluslabs.ai
```

**For Production:**
1. Create account at [dedaluslabs.ai](https://dedaluslabs.ai)
2. Go to Settings → API Keys
3. Generate a new API key
4. Replace the test key in your `.env` file

### 2. Environment Setup

Copy the example environment file:
```bash
cp .env.example .env
```

The Dedalus configuration is already included!

## Usage

### In the Workflow Builder Chat

Simply mention `@dedalus` in your message to use Dedalus AI instead of Gemini:

#### Example 1: Basic Workflow
```
@dedalus Create a workflow that sends a Slack message when a new Jira issue is created
```

#### Example 2: Complex Multi-Step Workflow
```
@dedalus Build a workflow that:
1. Monitors GitHub for new issues
2. Creates corresponding Jira tickets
3. Sends notifications to Teams
4. Updates a SharePoint list
```

#### Example 3: Conditional Workflow
```
@dedalus Create a workflow with conditional logic:
- If Jira priority is Critical, send to Slack #urgent
- Otherwise, send to Slack #general
```

### Without @dedalus

If you don't mention `@dedalus`, the workflow uses Google Gemini by default:

```
Create a simple workflow to send emails when calendar events start
```

## Features

### 1. Advanced AI Reasoning

Dedalus uses GPT-4 which provides:
- Better understanding of complex requirements
- More accurate workflow structures
- Smarter node connections
- Optimized workflow paths

### 2. Tool-Calling Capabilities

Dedalus can use tools to:
- Validate integrations are available
- Check configuration requirements
- Suggest best practices
- Optimize workflow execution order

### 3. MCP Integration

Dedalus supports Model Context Protocol for:
- Direct integration with enterprise tools
- Context-aware workflow generation
- Real-time data access during generation

## Comparison: Gemini vs Dedalus

| Feature | Gemini (Default) | Dedalus (@dedalus) |
|---------|------------------|-------------------|
| **Model** | Gemini Pro | GPT-4 Turbo |
| **Speed** | Fast | Medium |
| **Accuracy** | Good | Excellent |
| **Complex Logic** | Basic | Advanced |
| **Tool Calling** | Limited | Full Support |
| **Cost** | Free (with API key) | Paid |
| **Best For** | Simple workflows | Complex enterprise workflows |

## Advanced Features

### 1. Custom Model Selection

You can specify which model to use:

```typescript
// In the API call
{
  prompt: "@dedalus Create a workflow...",
  model: "gpt-4-turbo"  // or "gpt-3.5-turbo", "claude-3"
}
```

### 2. Streaming Responses

For real-time workflow generation updates:

```typescript
const dedalusClient = getDedalusClient();
await dedalusClient.streamWorkflowGeneration(
  prompt,
  (chunk) => {
    console.log('Generating:', chunk);
  }
);
```

### 3. Tool Integration

Dedalus can use custom tools during workflow generation:

```typescript
const tools = [
  {
    name: 'check_integration_available',
    description: 'Check if an integration is configured',
    parameters: {
      type: 'object',
      properties: {
        integration: { type: 'string' }
      }
    }
  }
];
```

## API Reference

### Backend Endpoints

#### Generate Workflow
```http
POST /api/workflows/generate
Content-Type: application/json

{
  "prompt": "@dedalus Create a workflow...",
  "model": "gpt-4-turbo"  // optional
}
```

**Response:**
```json
{
  "nodes": [...],
  "edges": [...],
  "explanation": "Workflow description",
  "generatedBy": "dedalus",
  "model": "gpt-4-turbo",
  "reasoning": "stop"
}
```

#### Test Dedalus Connection
```http
GET /api/integrations/dedalus/test
```

**Response:**
```json
{
  "success": true,
  "service": "Dedalus AI",
  "status": "connected"
}
```

### DedalusClient Class

#### Methods

**generateWorkflow(request)**
```typescript
const dedalus = getDedalusClient();
const workflow = await dedalus.generateWorkflow({
  prompt: "Create a workflow...",
  model: "gpt-4-turbo",
  temperature: 0.7,
  max_tokens: 2000
});
```

**generateWorkflowWithTools(prompt, integrations)**
```typescript
const workflow = await dedalus.generateWorkflowWithTools(
  "Create a complex workflow...",
  ['slack', 'jira', 'github']
);
```

**chat(messages, model)**
```typescript
const response = await dedalus.chat([
  { role: 'user', content: 'How do I optimize this workflow?' }
], 'gpt-4-turbo');
```

**testConnection()**
```typescript
const isConnected = await dedalus.testConnection();
```

## Best Practices

### 1. When to Use Dedalus

Use `@dedalus` for:
- ✅ Complex multi-step workflows
- ✅ Workflows with conditional logic
- ✅ Enterprise integration workflows
- ✅ Critical business processes
- ✅ When you need detailed explanations

### 2. When to Use Gemini

Use Gemini (default) for:
- ✅ Simple 2-3 step workflows
- ✅ Quick prototypes
- ✅ Testing ideas
- ✅ Learning workflow basics
- ✅ Free tier usage

### 3. Prompt Engineering Tips

**Good Prompts:**
```
@dedalus Create a workflow that monitors Jira for critical bugs,
creates GitHub issues, assigns them to on-call engineers,
and sends Slack alerts with severity levels
```

**Better Prompts:**
```
@dedalus Design an incident response workflow:
1. Trigger: Critical Jira bug created
2. Action: Create GitHub issue in ops repo
3. Condition: If severity = P0, page on-call via PagerDuty
4. Action: Send Slack message to #incidents with all details
5. Action: Create calendar event for post-mortem
```

### 4. Error Handling

If Dedalus fails, the system automatically:
1. Logs the error
2. Returns a fallback workflow
3. Explains what went wrong

## Troubleshooting

### Common Issues

#### 1. "Dedalus API Error: Unauthorized"

**Problem:** Invalid or expired API key

**Solution:**
```bash
# Check your .env file
cat .env | grep DEDALUS_API_KEY

# Make sure it starts with 'dsk_'
# Get a new key from dedaluslabs.ai if needed
```

#### 2. "Failed to parse workflow JSON"

**Problem:** AI returned invalid JSON

**Solution:**
- The system handles this automatically with fallback
- Try rephrasing your prompt to be more specific
- Use simpler language if the workflow is complex

#### 3. Rate Limits

**Problem:** Too many requests

**Solution:**
- Dedalus has rate limits on the free tier
- Upgrade your Dedalus account
- Use Gemini for simple workflows

#### 4. Connection Timeout

**Problem:** API not responding

**Solution:**
```bash
# Test connection
curl -X GET http://localhost:3001/api/integrations/dedalus/test
```

## Examples

### Example 1: Sales Pipeline Automation

```
@dedalus Create a sales workflow:
- When deal moves to "Negotiation" in Salesforce
- Send personalized email via Outlook
- Schedule follow-up in Calendar
- Notify sales team in Teams
- Update Excel report in SharePoint
```

### Example 2: DevOps Incident Response

```
@dedalus Build an incident response workflow:
1. Trigger on PagerDuty alert
2. Create Jira ticket with severity
3. Create war room in Slack
4. Notify on-call team via SMS
5. Start recording in Zoom
6. Create GitHub issue for tracking
```

### Example 3: HR Onboarding

```
@dedalus Design an employee onboarding workflow:
- Trigger: New hire in HR system
- Create accounts: GitHub, Jira, Slack
- Send welcome email with credentials
- Schedule orientation in Calendar
- Add to team channels in Teams
- Create OneDrive folder structure
```

## Security Best Practices

1. **API Key Safety**
   - Never commit `.env` to Git
   - Rotate keys every 90 days
   - Use different keys for dev/prod

2. **Workflow Validation**
   - Review AI-generated workflows before deploying
   - Test workflows in sandbox environment
   - Monitor execution logs

3. **Data Privacy**
   - Don't include sensitive data in prompts
   - Use placeholders for credentials
   - Enable audit logging

## Cost Optimization

### Free Tier

- Dedalus test key: Limited requests
- Good for: Development and testing

### Paid Plans

- Production key: Higher limits
- Good for: Production workflows

### Cost Saving Tips

1. Use Gemini for simple workflows (free)
2. Cache common workflow patterns
3. Batch workflow generation
4. Use lower temperature for deterministic results

## Resources

- **Dedalus Documentation**: https://docs.dedaluslabs.ai
- **API Reference**: https://docs.dedaluslabs.ai/api-reference
- **Community**: https://discord.gg/dedaluslabs
- **Examples**: https://github.com/dedaluslabs/examples

## Next Steps

1. ✅ API key is configured
2. ✅ Integration is complete
3. Try it out:
   ```bash
   npm run dev:all
   ```
4. Navigate to http://localhost:3000/workflows
5. Click "AI Assistant"
6. Type: `@dedalus Create a test workflow`
7. Watch the magic happen! ✨

## Support

Having issues?
- Check this guide first
- Review the [API_SETUP_GUIDE.md](./API_SETUP_GUIDE.md)
- Check Dedalus docs at https://docs.dedaluslabs.ai
- Open an issue in the BonFire repo

---

**Pro Tip:** Start with `@dedalus` for your first workflow to see the difference in quality!
