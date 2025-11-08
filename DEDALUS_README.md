# Dedalus AI Integration - Complete

## ✅ What's Been Implemented

### 1. Dedalus Client Service
- **File**: `apps/api/src/services/dedalus-client.ts`
- **Features**:
  - Workflow generation with GPT-4
  - Tool calling capabilities
  - Streaming support
  - Connection testing
  - Fallback handling

### 2. API Integration
- **File**: `apps/api/src/routes/workflows.ts`
- **Endpoint**: `POST /api/workflows/generate`
- **Features**:
  - `@dedalus` mention detection
  - Automatic routing (Gemini vs Dedalus)
  - Metadata tracking (which AI was used)

### 3. Frontend Integration
- **File**: `apps/web/src/components/workflows/GeminiChat.tsx`
- **Features**:
  - Clear instructions on using `@dedalus`
  - Visual feedback for AI selection
  - Seamless integration

### 4. Environment Configuration
- **File**: `.env.example`
- **Variables**:
  ```bash
  DEDALUS_API_KEY=dsk_test_df0fe003f0db_73c8348ae905bca2f64be6c9aa80d2b5
  DEDALUS_API_URL=https://api.dedaluslabs.ai
  ```

## 🚀 How to Use

### In the Workflow Builder

1. Click "AI Assistant" button
2. Type your workflow request with `@dedalus`:
   ```
   @dedalus Create a workflow that sends Slack notifications for critical Jira issues
   ```
3. Watch as Dedalus AI (GPT-4) generates your workflow
4. The workflow appears on the canvas automatically

### Example Prompts

**Simple:**
```
@dedalus Create a workflow to send daily email reports
```

**Complex:**
```
@dedalus Build an incident response workflow:
1. Monitor for critical alerts
2. Create Jira ticket
3. Page on-call engineer
4. Start Slack war room
5. Send status updates every 30 minutes
```

**Multi-Integration:**
```
@dedalus When a GitHub PR is merged:
- Update Jira ticket status
- Send Teams notification
- Create calendar event for release
- Update SharePoint tracking sheet
```

## 🔄 How It Works

```
User types: "@dedalus Create a workflow..."
           ↓
Frontend detects @dedalus mention
           ↓
Sends to: POST /api/workflows/generate
           ↓
Backend checks for @dedalus in prompt
           ↓
Routes to DedalusClient.generateWorkflow()
           ↓
Dedalus AI (GPT-4) generates JSON workflow
           ↓
Returns: { nodes, edges, explanation, generatedBy: 'dedalus' }
           ↓
Frontend renders workflow on canvas
```

## 📊 Comparison

| Feature | Gemini (Default) | Dedalus (@dedalus) |
|---------|------------------|-------------------|
| **Trigger** | No mention | `@dedalus` mention |
| **Model** | Gemini Pro | GPT-4 Turbo |
| **Speed** | ⚡ Fast | 🔄 Medium |
| **Quality** | ✅ Good | ⭐ Excellent |
| **Complex Logic** | Basic | Advanced |
| **Tool Support** | None | Full |
| **Best For** | Quick workflows | Enterprise workflows |

## 🧪 Testing

### Test Dedalus Connection
```bash
# Start the API server
npm run dev:api

# In another terminal
curl http://localhost:3001/api/integrations/dedalus/test
```

**Expected Response:**
```json
{
  "success": true,
  "service": "Dedalus AI",
  "status": "connected"
}
```

### Test Workflow Generation
```bash
curl -X POST http://localhost:3001/api/workflows/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "@dedalus Create a simple test workflow"}'
```

## 📝 API Reference

### generateWorkflow()
```typescript
const dedalus = getDedalusClient();

const workflow = await dedalus.generateWorkflow({
  prompt: "Create a workflow...",
  model: "gpt-4-turbo",      // optional
  temperature: 0.7,           // optional
  max_tokens: 2000            // optional
});
```

### generateWorkflowWithTools()
```typescript
const workflow = await dedalus.generateWorkflowWithTools(
  "Create a complex workflow...",
  ['slack', 'jira', 'github', 'teams']
);
```

### chat()
```typescript
const response = await dedalus.chat([
  { role: 'user', content: 'How should I design this workflow?' }
], 'gpt-4-turbo');
```

### testConnection()
```typescript
const isConnected = await dedalus.testConnection();
// Returns: boolean
```

## 🔧 Configuration

### Environment Variables

Required:
- `DEDALUS_API_KEY` - Your Dedalus API key
- `DEDALUS_API_URL` - API endpoint (default: https://api.dedaluslabs.ai)

Optional:
- Model selection (in code, default: gpt-4-turbo)
- Temperature (default: 0.7)
- Max tokens (default: 2000)

### Getting Production API Key

1. Go to https://dedaluslabs.ai
2. Sign up / Log in
3. Navigate to Settings → API Keys
4. Create new API key
5. Replace test key in `.env`

## 🎯 Use Cases

### When to Use @dedalus

✅ **Use Dedalus For:**
- Multi-step enterprise workflows
- Complex conditional logic
- Integrations between 3+ services
- Critical business processes
- When you need detailed explanations
- Production workflows
- Workflows requiring optimization

### When to Use Default (Gemini)

✅ **Use Gemini For:**
- Simple 2-step workflows
- Quick prototypes
- Learning/testing
- Single integration flows
- Development/staging
- Free tier usage

## 🐛 Troubleshooting

### "Dedalus API Error: Unauthorized"

**Cause:** Invalid API key

**Fix:**
1. Check `.env` has `DEDALUS_API_KEY`
2. Verify key starts with `dsk_`
3. Get fresh key from dedaluslabs.ai

### "Failed to parse workflow JSON"

**Cause:** AI returned invalid JSON

**Fix:**
- System handles automatically with fallback
- Try more specific prompt
- Check API server logs for details

### "Connection timeout"

**Cause:** API not responding

**Fix:**
```bash
# Check if API server is running
curl http://localhost:3001/api/integrations/dedalus/test

# Restart API server
npm run dev:api
```

## 📚 Documentation

- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **API Setup**: [docs/API_SETUP_GUIDE.md](./docs/API_SETUP_GUIDE.md)
- **Dedalus Deep Dive**: [docs/DEDALUS_INTEGRATION.md](./docs/DEDALUS_INTEGRATION.md)
- **MCP Integration**: [docs/MCP_ENTERPRISE_INTEGRATION.md](./docs/MCP_ENTERPRISE_INTEGRATION.md)
- **Dedalus Docs**: https://docs.dedaluslabs.ai

## ✨ Examples in Action

### Example 1: DevOps Automation
```
@dedalus Create a CI/CD workflow:
- Trigger on GitHub push to main
- Run tests via Jenkins
- If pass: deploy to staging
- Send status to Slack
- Update Jira ticket
```

### Example 2: Customer Support
```
@dedalus Design a support ticket workflow:
- New ticket in Zendesk
- Create Jira issue
- Assign to on-call engineer
- Send Teams notification with urgency
- Add to SharePoint tracking sheet
```

### Example 3: Sales Pipeline
```
@dedalus Build a sales workflow:
- Deal stage changed in Salesforce
- Send personalized email via Outlook
- Schedule follow-up in Calendar
- Notify sales manager in Slack
- Update Excel dashboard in OneDrive
```

## 🎉 You're Ready!

Everything is set up and ready to use. Just run:

```bash
npm run dev:all
```

Navigate to http://localhost:3000/workflows, click "AI Assistant", and try:

```
@dedalus Create a workflow to automate my team's standup notifications
```

Enjoy the power of GPT-4 for your enterprise workflows! 🚀
