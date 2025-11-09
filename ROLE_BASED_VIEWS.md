# Role-Based Repository Visualization Guide

## Overview

BonFire now supports **role-based views** of the same codebase, providing different perspectives tailored to each team member's role. The same 3D repository visualization adapts its display based on whether you're viewing as a Developer, Finance Manager, HR Lead, Project Manager, or DevOps Engineer.

## Running the Application

```bash
npm run dev:all
```

This starts:
- **Web app**: http://localhost:3000
- **API server**: http://localhost:3001
- **MCP servers**: Background services

## Available Roles

### 1. 👨‍💻 Developer Role

**View Focus**: Code structure, file status, functions, and API connections

**File Color Coding**:
- 🟢 **Green**: New files (added in latest commit)
- 🔴 **Red**: Deleted files (removed in latest commit)
- 🟠 **Orange**: Modified files (changed in latest commit)
- 🔵 **Blue**: Unchanged files

**Hover Tooltip Shows**:
- File status (new/modified/deleted/unchanged)
- Programming language
- Number of functions
- Lines of code
- API calls count
- Function list (top 3)

**Visual Elements**:
- **Yellow spheres**: Functions in each file
- **Orange spheres**: API endpoints
- **Black arrows**: Directional connections between files
- **Light blue translucent boxes**: Directories/folders

---

### 2. 💰 Finance Role

**View Focus**: Budget allocation and development costs

**File Color Coding**:
- 🔴 **Red**: Expensive files (>$3000 total cost)
- 🟠 **Orange**: Moderate cost files ($1500-$3000)
- 🟢 **Green**: Low cost files (<$1500)

**Top-Left Display**: **Budget Allocation Pie Chart**
- Shows 5 project areas:
  - Frontend Development
  - Backend Development
  - DevOps & Infrastructure
  - Testing & QA
  - Documentation
- Visual breakdown of allocated vs. used budget
- Overall usage percentage in center

**Hover Tooltip Shows**:
- Programming language
- Lines of code
- **Development Cost**: Initial implementation cost
- **Maintenance Cost**: Ongoing maintenance cost
- **Resource Hours**: Estimated hours spent

**Data Source**:
- Budget data: `analysis.financeData.budgetAllocation`
- File costs: `analysis.financeData.fileCosts`

---

### 3. 👥 HR Role

**View Focus**: Team collaboration and contributor information

**File Color Coding**:
- ⚫ **Gray**: No contributors assigned
- 🔵 **Blue**: Single contributor
- 🟠 **Orange**: Two contributors
- 🟢 **Green**: Highly collaborative (3+ contributors)

**Hover Tooltip Shows**:
- Programming language
- Lines of code
- **Contributors list**:
  - Contributor name
  - Role (e.g., Software Developer, Tech Lead, SCRUM Master)
  - Top 3 contributors per file

**Team Members**:
- Pulled from GitHub contributors API
- Includes role assignments:
  - Tech Lead
  - Senior Developer
  - Software Developer
  - DevOps Engineer
  - QA Engineer
  - **Claude** (SCRUM Master)

**Data Source**:
- Real GitHub contributors
- Synthetic role assignments
- `analysis.hrData.fileContributors`
- `analysis.hrData.teamMembers`

---

### 4. 📊 PM (Project Manager) Role

**View Focus**: Issues, pull requests, and sprint progress

**File Color Coding**:
- 🔴 **Red**: Files with high-impact issues
- 🟠 **Orange**: Files with medium-impact issues
- 🟡 **Yellow**: Files with low-impact issues
- 🔵 **Blue**: No issues

**Top-Right Display**: **SCRUM Sprint Chart**
- Current sprint progress bar (completed/in-progress/todo)
- Burndown chart with ideal vs. actual progress
- Days remaining in sprint
- Sprint velocity stats
- Historical sprint performance (last 3 sprints)

**Hover Tooltip Shows**:
- Programming language
- Lines of code
- **Issues affecting this file**:
  - Issue priority (critical/high/medium/low)
  - Issue impact level
  - Issue title
  - Issue status

**Data Includes**:
- Active issues with impact levels
- Pull requests (from GitHub API)
- Sprint data (current + historical)
- Issue assignment and status

**Data Source**:
- Real pull requests from GitHub
- Synthetic issues with impact analysis
- Sprint tracking data
- `analysis.pmData.issues`
- `analysis.pmData.pullRequests`
- `analysis.pmData.currentSprint`

---

### 5. 🔧 DevOps Role

**View Focus**: Test coverage and CI/CD status

**File Color Coding**:
- 🟢 **Green**: All LLM tests passed
- 🟠 **Orange**: Some LLM tests passed
- 🔴 **Red**: All LLM tests failed
- ⚫ **Gray**: No tests available

**Hover Tooltip Shows**:
- Programming language
- Lines of code
- **Test Results from 3 LLMs**:
  - **Gemini**: Pass/fail count, coverage %
  - **Claude**: Pass/fail count, coverage %
  - **XAI**: Pass/fail count, coverage %

**Each test result includes**:
- Total tests vs. passed tests
- Code coverage percentage
- Execution time
- Pass/fail status

**CI/CD Status** (in analysis):
- Build & Test pipeline
- Security Scan pipeline
- Deploy to Staging
- Performance Tests

**Data Source**:
- Synthetic test results from multiple AI models
- File-level test coverage data
- `analysis.devOpsData.testResults`
- `analysis.devOpsData.cicdStatus`

---

## How to Switch Roles

The role is determined by the `role` prop passed to the `EnhancedRepo3DViewer` component:

```tsx
<EnhancedRepo3DViewer
  owner="facebook"
  repo="react"
  role="finance"  // or "developer", "hr", "pm", "devops"
/>
```

## Data Generation

When you click **"🔄 Sync Repository"**, the system:

1. **Fetches repository structure** from GitHub
2. **Analyzes code files** with Gemini AI (with regex fallback)
3. **Generates role-specific data**:
   - Finance: Budget allocation + file costs
   - HR: GitHub contributors + assigned roles
   - PM: Pull requests + issues + sprints
   - DevOps: Test results from Gemini, Claude, XAI
4. **Saves complete analysis** to JSON file
5. **Updates 3D visualization** with role-appropriate colors and data

## Architecture

### Backend Services

**Main Analyzer**: `apps/api/src/services/gemini-repo-analyzer.ts`
- Analyzes code structure with AI
- Calls role data generator
- Saves combined analysis

**Role Data Generator**: `apps/api/src/services/role-data-generator.ts`
- `generateFinanceData()`: Budget and cost calculations
- `generateHRData()`: GitHub contributors + roles
- `generatePMData()`: Issues, PRs, sprints
- `generateDevOpsData()`: Multi-LLM test results

### Frontend Components

**Main Viewer**: `apps/web/src/components/visualization/EnhancedRepo3DViewer.tsx`
- Renders 3D visualization with Three.js
- Adapts colors and tooltips based on role
- Displays role-specific charts

**Charts**:
- `apps/web/src/components/charts/FinancePieChart.tsx`
- `apps/web/src/components/charts/ScrumChart.tsx`

### Shared Types

**Type Definitions**: `packages/shared/types/analysis.ts`
- `FinanceData`
- `HRData`
- `PMData`
- `DevOpsData`
- `RoleBasedAnalysis` (extends `RepositoryAnalysis`)

## API Endpoints

### Sync Repository
```http
POST /api/repos/:owner/:repo/sync
Content-Type: application/json

{
  "branch": "main"
}
```

### Get Analysis (with role data)
```http
GET /api/repos/:owner/:repo/analysis
```

Response includes all role-specific data:
```json
{
  "owner": "facebook",
  "repo": "react",
  "files": [...],
  "connections": [...],
  "financeData": {...},
  "hrData": {...},
  "pmData": {...},
  "devOpsData": {...}
}
```

## Example Usage

```typescript
// Developer view - focus on code
<EnhancedRepo3DViewer owner="facebook" repo="react" role="developer" />

// Finance view - focus on costs
<EnhancedRepo3DViewer owner="facebook" repo="react" role="finance" />

// HR view - focus on team collaboration
<EnhancedRepo3DViewer owner="facebook" repo="react" role="hr" />

// PM view - focus on project management
<EnhancedRepo3DViewer owner="facebook" repo="react" role="pm" />

// DevOps view - focus on testing & deployment
<EnhancedRepo3DViewer owner="facebook" repo="react" role="devops" />
```

## Stored Data

All analysis results (including role data) are saved in:
```
data/analysis/
  ├── {owner}_{repo}_latest.json
  └── {owner}_{repo}_{timestamp}.json
```

Each JSON file contains:
- Repository structure
- File analysis
- Function and API data
- **Finance data** (budgets, costs)
- **HR data** (contributors, roles)
- **PM data** (issues, PRs, sprints)
- **DevOps data** (test results, CI/CD)

## Next Steps

### Potential Enhancements

1. **Real-time data integration**:
   - Connect to actual CI/CD pipelines
   - Real test execution via LLMs
   - Live issue tracking from Jira/GitHub Issues

2. **Role customization**:
   - User-defined roles
   - Custom color schemes per role
   - Configurable metrics and KPIs

3. **Collaboration features**:
   - Role-specific annotations
   - Team comments on files
   - Cross-role insights

4. **Advanced visualizations**:
   - Time-series cost tracking
   - Team velocity trends
   - Test coverage heatmaps

---

**Generated with Claude Code** 🔥
