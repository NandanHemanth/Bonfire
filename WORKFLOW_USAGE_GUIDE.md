# Workflow Builder - Usage Guide

## ✅ Setup Complete!

Both servers are now running:
- ✅ Web App: http://localhost:3000
- ✅ API Server: http://localhost:3001

## How to Create Workflows

### Method 1: Drag & Drop (Manual)

1. **Add Nodes**
   - Drag nodes from the left panel to the canvas
   - Available categories:
     - Communication (Slack, Email, Teams)
     - Project Management (Jira, Asana, Trello)
     - Microsoft 365 (Outlook, Calendar, OneDrive, Excel, SharePoint)
     - Development (GitHub, GitLab, Jenkins)
     - Actions (Webhooks, API calls, Conditions, Code)

2. **Configure Nodes**
   - Click on any node to open its configuration panel
   - Set node-specific settings:
     - **Slack**: Channel, Message
     - **Jira**: Project, Issue Type, Summary, Description
     - **Email**: To, Subject, Body
     - **Condition**: Field, Operator, Value
     - **API Call**: Method, URL, Body
     - **Webhook**: Event trigger
     - **Code**: Language, Code snippet

3. **Connect Nodes**
   - Click and drag from the bottom of one node
   - Drop on the top of another node
   - Creates an execution flow

4. **Save Workflow**
   - Click the "Save" button (top toolbar)
   - Enter a workflow name
   - Workflow appears in the right sidebar

### Method 2: AI-Powered (Recommended)

1. **Click "AI Assistant"** (purple button, top right)

2. **Use Default AI (Gemini)**
   ```
   Create a workflow that sends a Slack message when a Jira issue is created
   ```

3. **Use Advanced AI (Dedalus with GPT-4)**
   ```
   @dedalus Create a complex workflow that:
   - Monitors GitHub for new pull requests
   - Creates Jira tickets for each PR
   - Sends Teams notifications
   - Updates SharePoint tracking sheet
   ```

4. **Review & Save**
   - AI generates the workflow on canvas
   - Click nodes to configure details
   - Click "Save" to store

## Node Types & Configuration

### Trigger Nodes

#### Webhook (Event Trigger)
**Use for**: Starting workflows based on external events

**Configuration**:
- Event: Name of the triggering event (e.g., "issue_created")
- URL: Optional webhook URL to listen to

**Example**:
```
Event: jira_issue_created
```

### Action Nodes

#### Slack
**Use for**: Send messages to Slack channels

**Configuration**:
- Channel: #channel-name or @username
- Message: Text to send

**Example**:
```
Channel: #engineering
Message: New critical issue: {{issue.summary}}
```

#### Jira
**Use for**: Create or update Jira issues

**Configuration**:
- Project Key: PROJ
- Issue Type: Task, Bug, Story, Epic
- Summary: Issue title
- Description: Detailed description

**Example**:
```
Project: ENG
Type: Bug
Summary: Critical bug from production
Description: Details from GitHub issue #{{github.issue}}
```

#### Email (Outlook)
**Use for**: Send emails via Outlook

**Configuration**:
- To: recipient@example.com
- Subject: Email subject
- Body: Email content

**Example**:
```
To: team@company.com
Subject: Daily Report
Body: Here's the summary for {{date}}
```

#### Condition (If/Then)
**Use for**: Branching logic based on data

**Configuration**:
- Type: if (simple) or switch (multiple)
- Field: Field to check (e.g., "priority")
- Operator: equals, not_equals, contains, greater_than, less_than
- Value: Value to compare against

**Example**:
```
Field: priority
Operator: equals
Value: Critical
```

Connect different nodes to the condition outputs for true/false branches.

#### API Call
**Use for**: Call any REST API

**Configuration**:
- Method: GET, POST, PUT, DELETE, PATCH
- URL: API endpoint
- Body: JSON payload (for POST/PUT)

**Example**:
```
Method: POST
URL: https://api.example.com/notify
Body: {"message": "Workflow executed", "status": "success"}
```

#### Code Execution
**Use for**: Custom logic

**Configuration**:
- Language: JavaScript, Python, Bash
- Code: Your custom code

**Example**:
```javascript
// Transform data
const result = {
  timestamp: new Date().toISOString(),
  processed: inputData.map(item => item.toUpperCase())
};
return result;
```

### Integration Nodes

#### Microsoft Teams
**Use for**: Send messages to Teams channels

#### Calendar
**Use for**: Create calendar events

#### OneDrive
**Use for**: Upload/download files

#### GitHub
**Use for**: Create issues, PRs, trigger actions

#### Database
**Use for**: Query or update databases

## Workflow Examples

### Example 1: Simple Notification

**Nodes**:
1. Webhook (trigger: "deployment_complete")
2. Slack (channel: #engineering, message: "Deployment successful!")

**Connections**:
Webhook → Slack

### Example 2: Conditional Logic

**Nodes**:
1. Webhook (trigger: "jira_issue_created")
2. Condition (field: "priority", operator: "equals", value: "Critical")
3. Slack Critical (channel: #urgent)
4. Slack Normal (channel: #general)

**Connections**:
- Webhook → Condition
- Condition → Slack Critical (if true)
- Condition → Slack Normal (if false)

### Example 3: Multi-Step Automation

**Nodes**:
1. Webhook (trigger: "github_pr_merged")
2. Jira (create release ticket)
3. Email (notify stakeholders)
4. Teams (post in #releases)
5. Calendar (schedule release meeting)

**Connections**:
Webhook → Jira → Email → Teams → Calendar

### Example 4: API Integration

**Nodes**:
1. Webhook (trigger: "data_received")
2. Code (process and transform data)
3. API Call (send to external system)
4. Condition (check API response)
5. Slack Success (on success)
6. Slack Failure (on failure)

**Connections**:
- Webhook → Code → API Call → Condition
- Condition → Slack Success (if success)
- Condition → Slack Failure (if failure)

## Using Variables

Use `{{variable}}` syntax in your configurations to reference data from previous nodes:

```
Message: New issue {{jira.key}} created by {{jira.reporter}}
Subject: PR #{{github.pr_number}} - {{github.title}}
To: {{user.email}}
```

## Keyboard Shortcuts

- **Delete**: Delete selected nodes/edges
- **Ctrl/Cmd + C**: Copy selected nodes
- **Ctrl/Cmd + V**: Paste nodes
- **Ctrl/Cmd + Z**: Undo
- **Ctrl/Cmd + Shift + Z**: Redo
- **Mouse Wheel**: Zoom in/out
- **Click + Drag**: Pan canvas

## Tips & Best Practices

### 1. Start Simple
Begin with 2-3 nodes, test it works, then expand.

### 2. Use AI for Complex Workflows
Let `@dedalus` design complex multi-step workflows:
```
@dedalus Create a DevOps deployment workflow with approval gates
```

### 3. Configure Before Connecting
Set up each node's configuration before connecting them.

### 4. Test Incrementally
Save and test workflow after each major addition.

### 5. Use Descriptive Names
Rename nodes to describe what they do:
- "Check Priority" instead of "Condition 1"
- "Notify Team Lead" instead of "Slack 2"

### 6. Add Notes
Use the "Notes" field in node configuration to document logic.

### 7. Group Related Workflows
Create separate workflows for different processes:
- "Incident Response"
- "Daily Reporting"
- "Deployment Pipeline"

## Running Workflows

### Execute Manually
1. Select a workflow from the sidebar
2. Click "Run" button
3. Check console for execution results

### Execute via API
```bash
curl -X POST http://localhost:3001/api/workflows/:id/execute
```

### Execute via Trigger
Workflows with webhook triggers execute automatically when the event occurs.

## Troubleshooting

### Node Won't Connect
- Make sure you're dragging from bottom (output) to top (input)
- Check nodes aren't already connected

### Configuration Not Saving
- Click the "Save" button in the config panel
- Don't close panel without saving

### Workflow Won't Save
- Make sure API server is running (http://localhost:3001)
- Check browser console for errors
- Try giving workflow a unique name

### AI Not Generating
- Check API keys in `.env` file
- For Gemini: `GEMINI_API_KEY`
- For Dedalus: `DEDALUS_API_KEY` (already configured)
- Restart API server after changing `.env`

### Node Config Panel Won't Open
- Click directly on the node (not the connection)
- Try clicking the node's label text

## Next Steps

1. ✅ Create your first workflow manually
2. ✅ Try AI generation with simple prompt
3. ✅ Test `@dedalus` for complex workflow
4. ✅ Add real API keys for Slack/Jira/etc
5. ✅ Set up actual integrations
6. ✅ Deploy to production

## Need Help?

- Check [QUICKSTART.md](./QUICKSTART.md)
- Review [API_SETUP_GUIDE.md](./docs/API_SETUP_GUIDE.md)
- See [DEDALUS_README.md](./DEDALUS_README.md)

---

**You're ready to build! Start dragging nodes or click "AI Assistant" to begin! 🔥**
