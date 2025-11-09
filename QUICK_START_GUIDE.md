# BonFire Quick Start Guide

## 🚀 Running the Application

```bash
npm run dev:all
```

**Services:**
- **Web App**: http://localhost:3000
- **API Server**: http://localhost:3001
- **MCP Servers**: Running in background

## 🎯 Using Role-Based Visualization

### Step 1: Select Your Role

When you open http://localhost:3000, you'll see 5 role buttons:

| Role | Icon | What You'll See |
|------|------|----------------|
| **DEVELOPER** | 💻 | Code structure, functions, API connections |
| **FINANCE** | 💰 | Budget allocation, development costs |
| **HR** | 👥 | Team contributors, collaboration levels |
| **PM** | 📊 | Issues, pull requests, sprint progress |
| **DEVOPS** | 🔧 | Test results from 3 LLMs, CI/CD status |

### Step 2: Enter Repository

Enter a GitHub repository in one of these formats:
- `facebook/react`
- `https://github.com/facebook/react`

Or click one of the quick examples (facebook/react, microsoft/vscode, vercel/next.js)

### Step 3: Click "🔥 Visualize Repository"

The 3D visualization will load with your selected role's perspective.

### Step 4: Sync for Latest Data

Click **"🔄 Sync Repository"** in the top-right to:
- Fetch latest repository structure from GitHub
- Analyze code with Gemini AI
- Generate role-specific data
- Update visualization with fresh data

**Wait 30-60 seconds** for analysis to complete.

### Step 5: Switch Roles Anytime

While viewing the visualization, you can **switch roles instantly** using the emoji buttons in the top-right corner. The same codebase will be re-colored and show different information based on your selected role!

## 🎨 What Each Role Sees

### 💻 Developer Role
**File Colors:**
- 🟢 Green = New files (added in latest commit)
- 🔴 Red = Deleted files
- 🟠 Orange = Modified files
- 🔵 Blue = Unchanged files

**Visual Elements:**
- Yellow spheres = Functions
- Orange spheres = API endpoints
- Black arrows = Connections between files

**Hover Shows:**
- File status, language, lines of code
- Functions list (top 3)
- API calls

**Click File:** Opens in VSCode

---

### 💰 Finance Role
**File Colors:**
- 🔴 Red = Expensive files (>$3000 total cost)
- 🟠 Orange = Moderate cost ($1500-$3000)
- 🟢 Green = Low cost (<$1500)

**Special Display:**
- **Top Left**: Budget allocation pie chart
  - Shows 5 project budgets
  - Allocated vs. used amounts
  - Overall usage percentage

**Hover Shows:**
- Development cost
- Maintenance cost
- Resource hours

---

### 👥 HR Role
**File Colors:**
- ⚫ Gray = No contributors
- 🔵 Blue = Single contributor
- 🟠 Orange = Two contributors
- 🟢 Green = Highly collaborative (3+ contributors)

**Hover Shows:**
- Contributors list with roles
- Team member information
- Collaboration statistics

**Special:** Claude appears as SCRUM Master

---

### 📊 PM (Project Manager) Role
**File Colors:**
- 🔴 Red = High-impact issues
- 🟠 Orange = Medium-impact issues
- 🟡 Yellow = Low-impact issues
- 🔵 Blue = No issues

**Special Display:**
- **Top Right**: SCRUM sprint chart
  - Current sprint progress
  - Burndown chart (ideal vs. actual)
  - Sprint velocity stats
  - Days remaining

**Hover Shows:**
- Issues affecting the file
- Issue priority and impact
- Issue status

---

### 🔧 DevOps Role
**File Colors:**
- 🟢 Green = All LLM tests passed
- 🟠 Orange = Some tests passed
- 🔴 Red = All tests failed
- ⚫ Gray = No tests

**Hover Shows:**
- **Test results from 3 LLMs:**
  - Gemini: Pass/fail count, coverage %
  - Claude: Pass/fail count, coverage %
  - XAI: Pass/fail count, coverage %

**Each test shows:**
- Total tests vs. passed
- Code coverage percentage
- Execution time

---

## 🎮 Controls

- **🖱️ Drag**: Pan/move camera
- **🖱️ Scroll**: Zoom in/out
- **🖱️ Hover**: View file details
- **🖱️ Click file**: Open in VSCode (Developer role)
- **🔄 Sync Button**: Update with latest data
- **Role Buttons**: Switch perspective instantly

## 📁 Data Storage

All analysis results are saved in:
```
data/analysis/
  ├── {owner}_{repo}_latest.json
  └── {owner}_{repo}_{timestamp}.json
```

Each file contains:
- Code structure analysis
- Role-specific data (finance, HR, PM, DevOps)
- GitHub integration data

## 🔍 Tips

1. **First Time**: Always click "Sync Repository" for fresh data
2. **Switch Roles**: Try different roles to see the same codebase from different perspectives
3. **Hover Everything**: Tooltips show different info based on your role
4. **Check Charts**: Finance shows budget pie chart (top left), PM shows sprint chart (top right)
5. **Color Meanings**: File colors change based on role - check the legend in bottom-left

## 📊 Example Workflow

### For Finance Manager:
1. Select **FINANCE** role
2. Enter repo: `facebook/react`
3. Click **Visualize**
4. Click **Sync** (wait for analysis)
5. View budget pie chart (top left)
6. Hover files to see development & maintenance costs
7. Red files = expensive, Green = cheap

### For DevOps Engineer:
1. Select **DEVOPS** role
2. Enter repo: `microsoft/vscode`
3. Click **Visualize**
4. Click **Sync** (wait for analysis)
5. Hover files to see test results from Gemini, Claude, XAI
6. Green files = all tests passed, Red = failed

### For Project Manager:
1. Select **PM** role
2. Enter repo: `vercel/next.js`
3. Click **Visualize**
4. Click **Sync** (wait for analysis)
5. View SCRUM sprint chart (top right)
6. Hover files to see issues and pull requests
7. Red files = high-impact issues

---

## 🆘 Troubleshooting

**Problem**: Seeing "No analysis found"
- **Solution**: Click "Sync Repository" button

**Problem**: Files are all the same color
- **Solution**: Make sure you synced after selecting your role

**Problem**: Charts not showing
- **Solution**:
  - Finance chart (top left) only shows for Finance role
  - Sprint chart (top right) only shows for PM role
  - Make sure you synced the repository

**Problem**: Can't see role-specific data on hover
- **Solution**: Ensure you clicked "Sync Repository" after selecting your role

---

**Generated with Claude Code** 🔥
