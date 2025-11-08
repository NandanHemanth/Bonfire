# Workflow Builder - New Features Update

## ✨ What's New

### 1. **Role-Based Workflow Organization**
When saving a workflow, you now select a role/department:
- Developer
- Finance
- HR
- Project Manager
- DevOps

This helps organize workflows by team and makes them easier to find and manage.

### 2. **Clean White Canvas**
The workflow canvas now has a clean white background with light gray grid dots for better visibility and a professional appearance.

### 3. **Enhanced Event Triggers (Webhook Node)**
Webhook/trigger nodes now support multiple event sources:
- **Custom Event** - Your own custom triggers
- **Jira Webhook** - Jira issue events
- **GitHub Webhook** - PR, issue, commit events
- **Slack Event** - Message, reaction events
- **Email Received** - Incoming email triggers
- **Scheduled (Cron)** - Time-based triggers

**Example Configuration:**
```
Event Source: Jira Webhook
Trigger Event: issue_created
```

For scheduled workflows:
```
Event Source: Scheduled (Cron)
Schedule: 0 9 * * * (Every day at 9 AM)
```

### 4. **Advanced Condition Logic**
Condition nodes now have comprehensive operators:

**Condition Types:**
- If (simple condition)
- Switch (multiple branches)
- Check if exists
- Regex match

**Operators:**
- `Equals (==)` - Exact match
- `Not Equals (!=)` - Not equal
- `Contains` - Text contains substring
- `Does Not Contain` - Text doesn't contain
- `Starts With` - Begins with text
- `Ends With` - Ends with text
- `Greater Than (>)` - Numeric comparison
- `Less Than (<)` - Numeric comparison
- `Greater or Equal (>=)` - Numeric comparison
- `Less or Equal (<=)` - Numeric comparison
- `In Array` - Value exists in list
- `Is Empty` - Field is empty/null
- `Is Not Empty` - Field has value

**Example:**
```
Field: data.issue.priority
Operator: Equals
Value: Critical
```

Connect different nodes for TRUE and FALSE paths!

## 🎯 How to Use

### Creating a Workflow with Role

1. **Build your workflow** (drag nodes, connect them)
2. **Click "Save"** button
3. **Fill in the dialog:**
   - Workflow Name (required)
   - Role/Department (required) - Select who will use this
   - Description (optional)
4. **See workflow stats** (nodes & connections)
5. **Click "Save Workflow"**

### Setting Up Event Triggers

1. **Drag "Webhook" node** to canvas
2. **Click the node** to configure
3. **Select Event Source:**
   - For Jira: Select "Jira Webhook", enter "issue_created"
   - For scheduled: Select "Scheduled (Cron)", enter cron expression
   - For custom: Enter your event name
4. **Save configuration**

### Creating Conditional Workflows

1. **Drag "Condition" node** to canvas
2. **Click to configure:**
   ```
   Field: priority
   Operator: Equals
   Value: Critical
   ```
3. **Connect TWO paths:**
   - Connect to "Urgent Slack" node (TRUE path)
   - Connect to "Normal Slack" node (FALSE path)

## 📋 Example Workflows

### Example 1: Jira Critical Issue Alert

**Nodes:**
1. Webhook
   - Event Source: Jira Webhook
   - Event: issue_created

2. Condition
   - Field: priority
   - Operator: Equals
   - Value: Critical

3. Slack (Urgent)
   - Channel: #urgent
   - Message: 🚨 Critical issue!

4. Slack (Normal)
   - Channel: #general
   - Message: New issue created

**Connections:**
- Webhook → Condition
- Condition → Slack Urgent (TRUE)
- Condition → Slack Normal (FALSE)

**Role:** Developer

### Example 2: Daily Standup Reminder

**Nodes:**
1. Webhook
   - Event Source: Scheduled (Cron)
   - Schedule: 0 9 * * 1-5 (weekdays at 9 AM)

2. Teams
   - Message: Time for daily standup!

**Connections:**
- Webhook → Teams

**Role:** Project Manager

### Example 3: PR Review Workflow

**Nodes:**
1. Webhook
   - Event Source: GitHub Webhook
   - Event: pull_request_opened

2. Condition
   - Field: files_changed
   - Operator: Greater Than
   - Value: 50

3. Jira (Large PR)
   - Create review ticket

4. Slack (Small PR)
   - Quick review notification

**Connections:**
- Webhook → Condition
- Condition → Jira (TRUE - large PR)
- Condition → Slack (FALSE - small PR)

**Role:** Developer

## 🎨 Visual Improvements

### White Canvas
- Clean, professional appearance
- Better contrast for colored nodes
- Easier on the eyes for long workflow sessions
- Light gray grid dots for alignment

### Role Badges
Workflows are now tagged with their role, making it easy to filter and find relevant workflows for your team.

## 💡 Pro Tips

### 1. Use Descriptive Event Names
Good: `jira_critical_bug_created`
Better: `jira_p0_incident_reported`

### 2. Leverage Dot Notation
Access nested data in conditions:
```
data.issue.fields.priority.name
payload.pullRequest.changed_files
```

### 3. Combine Multiple Conditions
Create a workflow with multiple condition nodes for complex logic:
```
Trigger → Check Priority → Check Assignee → Take Action
```

### 4. Schedule Regular Reports
Use cron expressions for recurring workflows:
- `0 9 * * 1` - Every Monday at 9 AM
- `0 17 * * 5` - Every Friday at 5 PM
- `0 0 1 * *` - First day of each month
- `*/15 * * * *` - Every 15 minutes

### 5. Role-Based Organization
Assign roles strategically:
- **Developer**: Code reviews, deployments, bug alerts
- **Finance**: Invoice processing, expense approvals
- **HR**: Onboarding, time-off requests
- **PM**: Sprint planning, status updates
- **DevOps**: Infrastructure monitoring, deployments

## 🔧 Technical Details

### Workflow Data Structure
```typescript
{
  name: string,
  description: string,
  role: 'developer' | 'finance' | 'hr' | 'pm' | 'devops',
  nodes: Node[],
  edges: Edge[]
}
```

### Condition Node Config
```typescript
{
  type: 'if' | 'switch' | 'exists' | 'regex',
  field: string,
  operator: string,
  value: string
}
```

### Webhook Node Config
```typescript
{
  source: 'custom' | 'jira' | 'github' | 'slack' | 'email' | 'schedule',
  event: string,
  schedule?: string, // cron expression
  url?: string
}
```

## 📚 Additional Resources

- **Main Usage Guide**: [WORKFLOW_USAGE_GUIDE.md](./WORKFLOW_USAGE_GUIDE.md)
- **Quick Start**: [QUICKSTART.md](./QUICKSTART.md)
- **API Setup**: [docs/API_SETUP_GUIDE.md](./docs/API_SETUP_GUIDE.md)
- **Dedalus AI**: [DEDALUS_README.md](./DEDALUS_README.md)

## 🎉 Ready to Build!

Everything is running at:
- **Web App**: http://localhost:3000/workflows
- **API Server**: http://localhost:3001

Try creating a workflow with:
1. Role selection
2. Event triggers
3. Conditional logic
4. Multiple paths

Your workflows are now more powerful and organized! 🚀
