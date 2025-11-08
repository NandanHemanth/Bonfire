# API Integration Setup Guide

This guide will help you obtain API keys and set up integrations for the BonFire workflow builder.

## 1. Slack API Setup

### Getting Slack API Credentials

1. **Create a Slack App**
   - Go to [https://api.slack.com/apps](https://api.slack.com/apps)
   - Click "Create New App"
   - Choose "From scratch"
   - Name your app (e.g., "BonFire Workflows")
   - Select your workspace

2. **Enable Incoming Webhooks**
   - In your app settings, go to "Incoming Webhooks"
   - Toggle "Activate Incoming Webhooks" to ON
   - Click "Add New Webhook to Workspace"
   - Select a channel and click "Allow"
   - Copy the webhook URL (starts with `https://hooks.slack.com/services/...`)
   - Add to `.env` as `SLACK_WEBHOOK_URL`

3. **Get Bot Token (Optional - for advanced features)**
   - Go to "OAuth & Permissions"
   - Add Bot Token Scopes:
     - `chat:write`
     - `channels:read`
     - `users:read`
   - Click "Install to Workspace"
   - Copy the "Bot User OAuth Token" (starts with `xoxb-`)
   - Add to `.env` as `SLACK_BOT_TOKEN`

## 2. Jira API Setup

### Getting Jira API Credentials

1. **Find Your Jira URL**
   - Your Jira base URL is typically: `https://YOUR-COMPANY.atlassian.net`
   - Add this to `.env` as `JIRA_BASE_URL`

2. **Create API Token**
   - Go to [https://id.atlassian.com/manage-profile/security/api-tokens](https://id.atlassian.com/manage-profile/security/api-tokens)
   - Click "Create API token"
   - Give it a label (e.g., "BonFire Integration")
   - Copy the token (you won't see it again!)
   - Add to `.env` as `JIRA_API_TOKEN`

3. **Add Your Email**
   - Add your Atlassian account email to `.env` as `JIRA_EMAIL`

### Jira API Documentation
- REST API: [https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/](https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/)

## 3. Microsoft Graph API Setup (Microsoft 365 Suite)

### Getting Microsoft Graph API Credentials

1. **Register an Azure AD Application**
   - Go to [Azure Portal](https://portal.azure.com)
   - Navigate to "Azure Active Directory" > "App registrations"
   - Click "New registration"
   - Name: "BonFire Workflows"
   - Supported account types: "Accounts in this organizational directory only"
   - Click "Register"

2. **Get Application (Client) ID**
   - Copy the "Application (client) ID"
   - Add to `.env` as `MICROSOFT_CLIENT_ID`

3. **Get Directory (Tenant) ID**
   - Copy the "Directory (tenant) ID"
   - Add to `.env` as `MICROSOFT_TENANT_ID`

4. **Create Client Secret**
   - Go to "Certificates & secrets"
   - Click "New client secret"
   - Description: "BonFire API Access"
   - Expires: Choose duration (recommended: 24 months)
   - Click "Add"
   - Copy the secret VALUE (not the ID)
   - Add to `.env` as `MICROSOFT_CLIENT_SECRET`

5. **Configure API Permissions**
   - Go to "API permissions"
   - Click "Add a permission"
   - Select "Microsoft Graph"
   - Choose "Application permissions" for server-to-server
   - Add these permissions:
     - `Mail.Read` (read emails)
     - `Mail.Send` (send emails)
     - `Calendars.Read` (read calendars)
     - `Calendars.ReadWrite` (manage calendars)
     - `Files.Read.All` (read OneDrive files)
     - `User.Read.All` (read user profiles)
   - Click "Grant admin consent" (requires admin)

### What You Can Do with Microsoft Graph
- Send emails via Outlook
- Create calendar events
- Access OneDrive files
- Read user information
- Access Teams messages
- And much more!

### Microsoft Graph Documentation
- API Reference: [https://learn.microsoft.com/en-us/graph/overview](https://learn.microsoft.com/en-us/graph/overview)
- Graph Explorer (testing): [https://developer.microsoft.com/en-us/graph/graph-explorer](https://developer.microsoft.com/en-us/graph/graph-explorer)

## 4. Google Gemini API Setup

### Getting Gemini API Key

1. **Go to Google AI Studio**
   - Visit [https://makersuite.google.com/app/apikey](https://makersuite.google.com/app/apikey)
   - Sign in with your Google account

2. **Create API Key**
   - Click "Create API Key"
   - Select "Create API key in new project" or choose existing project
   - Copy the API key
   - Add to `.env` as `GEMINI_API_KEY`

3. **Free Tier Limits**
   - 60 requests per minute
   - 1,500 requests per day
   - Free for testing and development

### Gemini Documentation
- API Docs: [https://ai.google.dev/docs](https://ai.google.dev/docs)

## 5. Additional Enterprise Tools (Optional)

### GitHub API
Already configured in your `.env.example`. Get a Personal Access Token from:
- [https://github.com/settings/tokens](https://github.com/settings/tokens)

### Other Common Integrations

#### Notion API
1. Go to [https://www.notion.so/my-integrations](https://www.notion.so/my-integrations)
2. Create new integration
3. Copy the "Internal Integration Token"

#### Asana API
1. Go to [https://app.asana.com/0/my-apps](https://app.asana.com/0/my-apps)
2. Create new Personal Access Token
3. Copy the token

#### Trello API
1. Go to [https://trello.com/power-ups/admin](https://trello.com/power-ups/admin)
2. Create new Power-Up
3. Get API Key and Token

## Environment File Setup

After getting all your API keys, create a `.env` file in the root directory by copying `.env.example`:

```bash
cp .env.example .env
```

Then fill in your actual API keys in the `.env` file. **Never commit the `.env` file to version control!**

## Testing Your Integrations

Once you've added your API keys to the `.env` file:

1. Start the API server:
   ```bash
   npm run dev:api
   ```

2. Start the web app:
   ```bash
   npm run dev:web
   ```

3. Go to the Workflows page in the web app
4. Click "Add Integration" for each service
5. Click "Test Connection" to verify it works

## Security Best Practices

1. **Never commit API keys to Git**
   - The `.env` file is in `.gitignore`
   - Only commit `.env.example` with placeholder values

2. **Use environment-specific keys**
   - Development keys for local development
   - Production keys for deployed environments

3. **Rotate keys regularly**
   - Change API keys every 3-6 months
   - Immediately rotate if compromised

4. **Limit permissions**
   - Only grant the minimum required API permissions
   - Use read-only access when possible

5. **Monitor usage**
   - Check API dashboards for unusual activity
   - Set up usage alerts

## Need Help?

- Check the official documentation links provided above
- Review the API provider's troubleshooting guides
- Ensure your `.env` file is properly formatted
- Verify that all required permissions are granted

## Quick Reference

| Service | Dashboard URL | Documentation |
|---------|--------------|---------------|
| Slack | https://api.slack.com/apps | https://api.slack.com/docs |
| Jira | https://id.atlassian.com/manage-profile/security/api-tokens | https://developer.atlassian.com/cloud/jira/ |
| Microsoft | https://portal.azure.com | https://learn.microsoft.com/en-us/graph/ |
| Gemini | https://makersuite.google.com/app/apikey | https://ai.google.dev/docs |
| GitHub | https://github.com/settings/tokens | https://docs.github.com/en/rest |
