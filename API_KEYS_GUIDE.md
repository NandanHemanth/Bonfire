# 🔑 API Keys Setup Guide

This guide will help you obtain all the necessary API keys for BonFire.

---

## Required API Keys

### 1. 🤖 Anthropic Claude API Key (REQUIRED)

**What it's for:** Powers AI features, data analysis, and MCP orchestration

**How to get it:**

1. **Sign up for Anthropic:**
   - Go to https://console.anthropic.com/
   - Click "Sign Up" or "Get Started"
   - Create an account with your email

2. **Get API Key:**
   - Once logged in, go to https://console.anthropic.com/settings/keys
   - Click "Create Key"
   - Give it a name (e.g., "BonFire Development")
   - Copy the key (starts with `sk-ant-`)
   - **⚠️ IMPORTANT:** Save it immediately - you can't see it again!

3. **Add to .env:**
   ```bash
   ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx
   ```

**Pricing:**
- Free tier: Limited credits for testing
- Pay-as-you-go: ~$3-15 per million tokens
- See: https://www.anthropic.com/pricing

---

### 2. 🐙 GitHub Personal Access Token (REQUIRED)

**What it's for:** Fetch repository structure, read code, access GitHub API

**How to get it:**

1. **Go to GitHub Settings:**
   - Visit https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - **Note:** "BonFire Development Token"
   - **Expiration:** Choose 90 days or No expiration (for dev)

3. **Select Scopes:**
   - ✅ `repo` (Full control of private repositories)
     - This includes: `repo:status`, `repo_deployment`, `public_repo`, `repo:invite`
   - ✅ `read:user` (Read user profile data)
   - ✅ `user:email` (Access user email addresses)

4. **Generate and Copy:**
   - Click "Generate token" at bottom
   - Copy the token (starts with `ghp_`)
   - **⚠️ IMPORTANT:** Save it - you can't see it again!

5. **Add to .env:**
   ```bash
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```

**No cost** - Free for public and private repos

---

### 3. 🗄️ PostgreSQL Database URL (REQUIRED for production)

**What it's for:** Store repository metadata, user data, analysis results

**Option A: Local Development (Docker - EASIEST)**

Already configured in `docker-compose.yml`:
```bash
DATABASE_URL=postgresql://postgres:password@localhost:5432/bonfire
```

Just run:
```bash
docker-compose up -d postgres
```

**Option B: Free Hosted Database**

**Using Supabase (Recommended):**

1. Go to https://supabase.com/
2. Click "Start your project"
3. Create account / Sign in
4. Click "New Project"
5. Fill in:
   - **Name:** bonfire
   - **Database Password:** (choose a strong password)
   - **Region:** Choose closest to you
6. Wait ~2 minutes for setup
7. Go to **Settings** → **Database**
8. Copy the **Connection String** (URI format)
9. Add to .env:
   ```bash
   DATABASE_URL=postgresql://postgres.[project-id]:[password]@[region].pooler.supabase.com:6543/postgres
   ```

**Using Railway:**

1. Go to https://railway.app/
2. Sign up with GitHub
3. Click "New Project" → "Provision PostgreSQL"
4. Click on the PostgreSQL service
5. Go to "Connect" tab
6. Copy the **Postgres Connection URL**
7. Add to .env

**Free Tiers:**
- Supabase: 500MB database, 2GB bandwidth/month
- Railway: $5 credit/month (enough for development)

---

## Optional API Keys

### 4. 🔔 Slack Webhook (Optional)

**What it's for:** Send notifications about deployments, approvals, alerts

**How to get it:**

1. Go to https://api.slack.com/apps
2. Click "Create New App" → "From scratch"
3. **App Name:** "BonFire Notifications"
4. **Workspace:** Select your workspace
5. Click "Create App"
6. In sidebar, click "Incoming Webhooks"
7. Toggle "Activate Incoming Webhooks" to **On**
8. Click "Add New Webhook to Workspace"
9. Choose a channel (e.g., #bonfire or #general)
10. Click "Allow"
11. Copy the **Webhook URL** (starts with `https://hooks.slack.com/`)
12. Add to .env:
    ```bash
    SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
    ```

**No cost** - Free with Slack workspace

---

### 5. 📋 Jira API Token (Optional)

**What it's for:** Integrate with Jira for project management features

**How to get it:**

1. Go to https://id.atlassian.com/manage-profile/security/api-tokens
2. Click "Create API token"
3. **Label:** "BonFire Integration"
4. Click "Create"
5. Copy the token
6. Add to .env:
   ```bash
   JIRA_API_TOKEN=your_jira_api_token_here
   JIRA_BASE_URL=https://your-company.atlassian.net
   ```

**No cost** - Included with Jira subscription

---

### 6. 🔐 GitHub OAuth App (Optional)

**What it's for:** Allow users to sign in with GitHub

**How to get it:**

1. Go to https://github.com/settings/developers
2. Click "OAuth Apps" → "New OAuth App"
3. Fill in:
   - **Application name:** BonFire
   - **Homepage URL:** http://localhost:3000
   - **Authorization callback URL:** http://localhost:3000/auth/github/callback
4. Click "Register application"
5. Copy **Client ID**
6. Click "Generate a new client secret"
7. Copy **Client Secret**
8. Add to .env:
   ```bash
   GITHUB_CLIENT_ID=your_client_id_here
   GITHUB_CLIENT_SECRET=your_client_secret_here
   ```

**No cost** - Free for all users

---

## Security Configuration

### 7. 🔒 JWT & Session Secrets (REQUIRED for production)

**What it's for:** Secure user sessions and API authentication

**How to generate:**

```bash
# Generate random secrets (Linux/Mac)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Or use OpenSSL
openssl rand -hex 64

# On Windows (PowerShell)
[Convert]::ToBase64String((1..64 | ForEach-Object { Get-Random -Maximum 256 }))
```

**Add to .env:**
```bash
JWT_SECRET=your_generated_secret_here_64_characters_minimum
SESSION_SECRET=your_generated_secret_here_64_characters_minimum
```

**Use different secrets for JWT and SESSION!**

---

## Quick Setup Checklist

### Minimal Setup (to get started)
- [ ] ✅ Anthropic API Key
- [ ] ✅ GitHub Token
- [ ] ✅ Database URL (use Docker)

### Full Setup (all features)
- [ ] ✅ Anthropic API Key
- [ ] ✅ GitHub Token
- [ ] ✅ Database URL
- [ ] ✅ JWT Secret
- [ ] ✅ Session Secret
- [ ] Slack Webhook (optional)
- [ ] Jira Token (optional)
- [ ] GitHub OAuth (optional)

---

## Complete .env File Example

```bash
# Environment Configuration
NODE_ENV=development

# API URLs
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000

# Database (choose one)
# Local Docker:
DATABASE_URL=postgresql://postgres:password@localhost:5432/bonfire
# Or Supabase:
# DATABASE_URL=postgresql://postgres.[project]:[password]@[region].pooler.supabase.com:6543/postgres

# GitHub Integration (REQUIRED)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
GITHUB_CLIENT_ID=your_client_id_here
GITHUB_CLIENT_SECRET=your_client_secret_here

# Anthropic Claude API (REQUIRED)
ANTHROPIC_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxxx

# External Integrations (Optional)
SLACK_WEBHOOK=https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX
JIRA_API_TOKEN=your_jira_api_token
JIRA_BASE_URL=https://your-company.atlassian.net

# Security (REQUIRED for production)
JWT_SECRET=your_generated_64_character_secret_here
SESSION_SECRET=your_different_64_character_secret_here

# MCP Configuration
MCP_FINANCE_ENABLED=true
MCP_HR_ENABLED=true
MCP_CICD_ENABLED=true
MCP_SECURITY_ENABLED=true

# Logging
LOG_LEVEL=info

# Feature Flags
ENABLE_3D_VISUALIZATION=true
ENABLE_AI_ANALYSIS=true
ENABLE_AUTO_DEPLOYMENT=false
```

---

## Cost Estimates

### Monthly Costs (typical development usage)

| Service | Free Tier | Light Usage | Heavy Usage |
|---------|-----------|-------------|-------------|
| **Anthropic Claude** | Limited credits | $10-50 | $100-500 |
| **GitHub** | ✅ Free | ✅ Free | ✅ Free |
| **Supabase DB** | ✅ Free (500MB) | ✅ Free | $25/mo |
| **Slack** | ✅ Free | ✅ Free | ✅ Free |
| **Jira** | $0 (if you have it) | $0 | $0 |
| **Total** | **~$0** | **$10-50** | **$125-525** |

### For Development:
You can start with **$0/month** using:
- Anthropic free credits
- GitHub free tier
- Docker PostgreSQL locally
- Free Slack workspace

---

## Testing Your API Keys

### Test Anthropic API:
```bash
curl https://api.anthropic.com/v1/messages \
  -H "x-api-key: $ANTHROPIC_API_KEY" \
  -H "anthropic-version: 2023-06-01" \
  -H "content-type: application/json" \
  -d '{"model":"claude-3-5-sonnet-20241022","max_tokens":1024,"messages":[{"role":"user","content":"Hello!"}]}'
```

### Test GitHub Token:
```bash
curl -H "Authorization: token $GITHUB_TOKEN" https://api.github.com/user
```

### Test Database Connection:
```bash
# Install PostgreSQL client
# Then:
psql "$DATABASE_URL" -c "SELECT version();"
```

---

## Troubleshooting

### "Invalid API Key" Error
- Check for extra spaces or quotes
- Verify key starts with correct prefix (sk-ant-, ghp_, etc.)
- Regenerate if needed

### "Rate Limited" Error
- GitHub: Wait 1 hour or upgrade to paid tier
- Anthropic: Check usage at https://console.anthropic.com/

### "Database Connection Failed"
- Verify DATABASE_URL format
- Check PostgreSQL is running (`docker-compose ps`)
- Test with `psql` command above

### "Permission Denied"
- GitHub: Check token has required scopes
- Regenerate with correct permissions

---

## Security Best Practices

1. **Never commit .env file** (already in .gitignore ✅)
2. **Use different secrets** for development and production
3. **Rotate keys** every 90 days
4. **Limit token scopes** to minimum required
5. **Use environment-specific keys** (dev vs. prod)
6. **Monitor usage** to detect unauthorized access
7. **Revoke unused keys** immediately

---

## Next Steps

Once you have your API keys:

1. **Copy them to .env:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual keys
   ```

2. **Start the application:**
   ```bash
   npm install
   npm run dev:all
   ```

3. **Verify everything works:**
   - Visit http://localhost:3000
   - Check API health: http://localhost:3001/health
   - Test GitHub integration: Try loading a repo
   - Test Claude: Try data analysis feature

---

## Support

- **Anthropic Console:** https://console.anthropic.com/
- **GitHub Settings:** https://github.com/settings/tokens
- **Supabase Dashboard:** https://supabase.com/dashboard

Need help? Check the main [README.md](README.md) or [docs/](docs/) folder.

🔥 **Ready to build with BonFire!**
