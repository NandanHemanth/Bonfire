# 🔥 BonFire: Enterprise Code & Data Intelligence Platform

> Transform how enterprise teams understand code, data, and cross-functional workflows through 3D visualization and AI-powered automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![Claude](https://img.shields.io/badge/Powered%20by-Claude%20%2B%20MCP-orange.svg)](https://www.anthropic.com/)

---

## 📋 Table of Contents

- [The Problem](#-the-problem)
- [The Solution](#-the-solution)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Getting Started](#-getting-started)
- [VS Code OSS Extension](#-vs-code-oss-extension)
- [Role-Based Views](#-role-based-views)
- [MCP Integration](#-mcp-integration)
- [Development Guide](#-development-guide)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 The Problem

### Enterprise Software Development is Broken

**Information Silos**
- Engineers don't know budget constraints
- Finance team can't see what code changes cost
- HR doesn't understand technical dependencies
- Security finds issues too late in the development cycle

**Manual Cross-Team Workflows**
```
Developer wants to deploy → 
  Slack message to DevOps → 
    Email to Finance for approval → 
      Meeting with Security → 
        Jira ticket created → 
          2-5 days later: Finally deployed ❌
```

**Data Overload**
- Excel files with 100,000+ rows
- No one knows which metrics actually matter
- Manual analysis takes hours or days
- Insights buried in spreadsheets

**Lack of Code Understanding**
- New engineers take weeks to understand the codebase
- "Where does this API call go?"
- "Who owns this service?"
- "What breaks if I change this?"

---

## 💡 The Solution

**BonFire** is an enterprise intelligence platform that:

1. **Visualizes** any GitHub repository in interactive 3D
   - Files, folders, services as 3D objects
   - API calls and dependencies as glowing connections
   - Color-coded by cost, team ownership, or complexity

2. **Analyzes** data automatically using AI
   - Upload CSV/Excel → instant insights
   - Auto-detects correlations and dependencies
   - Identifies independent vs dependent variables
   - Visual charts and relationship graphs

3. **Connects** all departments via MCP (Model Context Protocol)
   - Finance: Budget approvals, cost tracking
   - HR: Team capacity, code ownership
   - CI/CD: Deployments, pipeline status
   - Security: Compliance checks, vulnerability scans

4. **Automates** cross-functional workflows
   - One-click deployments with automatic approvals
   - AI orchestrates cross-team coordination
   - Real-time notifications and updates

### Value Proposition

| Traditional Process | With BonFire |
|---------------------|--------------|
| 2-5 days for deployment approval | 2 minutes with automated workflows |
| Hours of manual data analysis | Instant AI-powered insights |
| Weeks to understand codebase | Interactive 3D exploration |
| Email/Slack chaos | Centralized intelligence hub |

---

## ✨ Key Features

### 1. 3D Repository Visualization
- **Interactive exploration** - Zoom, rotate, click to drill down
- **Smart connections** - See API calls, function dependencies, data flows
- **Level-of-detail switching** - High-level architecture → individual functions
- **Real-time updates** - Auto-refresh on git push

### 2. Role-Based Views
- **Developer Mode** - Code-first view with function calls and APIs
- **Finance View** - Cost analysis, budget alerts, resource utilization
- **HR View** - Team ownership, capacity planning, on-call schedules
- **PM View** - Project timelines, dependencies, bottlenecks
- **IT/DevOps View** - Infrastructure, deployments, system health

### 3. Intelligent Data Analysis
- **Auto-detection** - Numeric vs categorical columns
- **Statistical analysis** - Mean, median, std dev, correlations
- **Dependency identification** - Independent vs dependent variables
- **Visual insights** - Scatter plots, bar charts, relationship graphs
- **AI recommendations** - "Increasing X will improve Y by Z%"

### 4. MCP-Powered Automation
- **Finance MCP** - Budget checks, cost estimation, approval workflows
- **HR MCP** - Code ownership, team capacity, oncall schedules
- **CI/CD MCP** - Deployment triggers, pipeline status, rollbacks
- **Security MCP** - Compliance checks, vulnerability scans
- **Custom MCPs** - Build your own for internal tools

---

## 🛠️ Tech Stack

### Core Technologies

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | UI framework |
| **3D Engine** | Three.js + React Three Fiber | 3D visualization |
| **Styling** | Tailwind CSS | Responsive design |
| **Charts** | Recharts | Data visualization |
| **State** | React Hooks (useState, useContext) | State management |
| **Backend** | Node.js + Express | API server |
| **AI** | Claude + MCP Protocol | Intelligence layer |
| **Code Parsing** | Tree-sitter | AST parsing for any language |
| **Data** | Papa Parse + SheetJS | CSV/Excel processing |
| **Version Control** | GitHub API (Octokit) | Repository access |
| **Database** | PostgreSQL | Metadata storage |
| **Deployment** | Docker + Kubernetes | Container orchestration |

### Open-Source Tools Used

1. **VS Code (Code-OSS)** - Base IDE platform
   - Repo: `https://github.com/microsoft/vscode`
   - License: MIT
   - We extend this for custom enterprise views

2. **MCP SDK** - Claude integration protocol
   - Repo: `https://github.com/anthropics/mcp`
   - NPM: `@modelcontextprotocol/sdk`

3. **Tree-sitter** - Code parsing
   - Repo: `https://github.com/tree-sitter/tree-sitter`
   - Supports: Python, JavaScript, Go, Rust, Java, C++, etc.

4. **Three.js** - 3D graphics
   - Repo: `https://github.com/mrdoob/three.js`
   - WebGL-based rendering

5. **React Three Fiber** - React wrapper for Three.js
   - Repo: `https://github.com/pmndrs/react-three-fiber`

6. **Octokit** - GitHub API client
   - Repo: `https://github.com/octokit/octokit.js`

7. **Papa Parse** - CSV parsing
   - Repo: `https://github.com/mholt/PapaParse`

8. **Monaco Editor** - Code editor (from VS Code)
   - Repo: `https://github.com/microsoft/monaco-editor`

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        BonFire Platform                       │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│  VS Code OSS  │    │  Web App      │    │  CLI Tool     │
│  Extension    │    │  (React)      │    │  (Node.js)    │
└───────┬───────┘    └───────┬───────┘    └───────┬───────┘
        │                     │                     │
        └─────────────────────┼─────────────────────┘
                              │
                              ▼
                    ┌──────────────────┐
                    │   BonFire API    │
                    │   (Express)      │
                    └────────┬─────────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ GitHub API   │    │ Data Engine  │    │ MCP Servers  │
│ (Octokit)    │    │ (Analysis)   │    │ (Claude)     │
└──────┬───────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       │                   │                    │
       ▼                   ▼                    ▼
┌──────────────────────────────────────────────────────┐
│              External Systems & APIs                  │
│  • GitHub Repos    • Jira/Linear    • Slack/Teams   │
│  • AWS/GCP/Azure   • Databases      • Security Tools│
└──────────────────────────────────────────────────────┘
```

### Data Flow

```
1. Developer opens repo in BonFire
        ↓
2. GitHub API fetches file structure
        ↓
3. Tree-sitter parses code (functions, imports, APIs)
        ↓
4. 3D engine renders visualization
        ↓
5. User clicks "Deploy"
        ↓
6. Claude + MCP orchestrates:
   - Finance check: Budget approval
   - HR check: Team capacity
   - Security check: Compliance
   - CI/CD: Trigger deployment
        ↓
7. Real-time status updates
        ↓
8. Deployment complete with full audit trail
```

---

## 🚀 Getting Started

### Prerequisites

```bash
# Required software
node >= 18.0.0
npm >= 9.0.0
git >= 2.30.0
docker >= 20.10.0 (optional)
python >= 3.9.0 (for tree-sitter)

# Operating System
- macOS 12+
- Linux (Ubuntu 20.04+)
- Windows 10+ with WSL2
```

### Quick Start (5 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/your-org/bonfire.git
cd bonfire

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with your API keys:
# - GITHUB_TOKEN=your_github_personal_access_token
# - ANTHROPIC_API_KEY=your_claude_api_key
# - DATABASE_URL=postgresql://localhost:5432/bonfire

# 4. Start development servers
npm run dev:all

# This starts:
# - Frontend: http://localhost:3000
# - Backend API: http://localhost:3001
# - MCP Servers: stdio (auto-connected)
```

### Project Structure

```
bonfire/
├── README.md
├── package.json
├── tsconfig.json
├── docker-compose.yml
│
├── apps/
│   ├── web/                    # React web application
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── 3d/
│   │   │   │   │   ├── RepoVisualizer.tsx
│   │   │   │   │   ├── Scene.tsx
│   │   │   │   │   └── Node.tsx
│   │   │   │   ├── data/
│   │   │   │   │   ├── DataAnalyzer.tsx
│   │   │   │   │   └── CorrelationView.tsx
│   │   │   │   └── views/
│   │   │   │       ├── DeveloperView.tsx
│   │   │   │       ├── FinanceView.tsx
│   │   │   │       ├── HRView.tsx
│   │   │   │       └── PMView.tsx
│   │   │   ├── hooks/
│   │   │   ├── utils/
│   │   │   └── App.tsx
│   │   └── package.json
│   │
│   ├── api/                    # Backend API server
│   │   ├── src/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   │   ├── github-parser.ts
│   │   │   │   ├── code-analyzer.ts
│   │   │   │   └── data-analyzer.ts
│   │   │   ├── middleware/
│   │   │   └── server.ts
│   │   └── package.json
│   │
│   └── vscode-extension/       # VS Code OSS extension
│       ├── src/
│       │   ├── extension.ts
│       │   ├── views/
│       │   └── commands/
│       └── package.json
│
├── packages/
│   ├── mcp-servers/            # MCP server implementations
│   │   ├── finance/
│   │   │   └── index.ts
│   │   ├── hr/
│   │   │   └── index.ts
│   │   ├── cicd/
│   │   │   └── index.ts
│   │   └── security/
│   │       └── index.ts
│   │
│   └── shared/                 # Shared types and utilities
│       ├── types/
│       └── utils/
│
├── scripts/
│   ├── setup.sh
│   ├── clone-vscode.sh
│   └── build-extension.sh
│
└── docs/
    ├── API.md
    ├── MCP_GUIDE.md
    └── DEPLOYMENT.md
```

---

## 💻 VS Code OSS Extension

### Cloning and Building VS Code OSS

BonFire extends VS Code (Code-OSS) to provide an integrated development experience with 3D visualization built-in.

#### Step 1: Clone VS Code OSS

```bash
# Clone into a separate directory
cd ..
git clone https://github.com/microsoft/vscode.git vscode-oss
cd vscode-oss

# Checkout stable version
git checkout 1.85.0

# Install dependencies (this takes ~10 minutes)
yarn install

# Build VS Code
yarn watch
```

#### Step 2: Link BonFire Extension

```bash
# Create extension symlink
cd extensions
ln -s ../../bonfire/apps/vscode-extension bonfire

# VS Code will now include BonFire extension
```

#### Step 3: Launch Custom VS Code with BonFire

```bash
# From vscode-oss root
./scripts/code.sh
```

### Building the BonFire Extension

```bash
cd bonfire/apps/vscode-extension

# Install extension dependencies
npm install

# Build extension
npm run compile

# Package as .vsix (for distribution)
npm run package
```

### Extension Features

#### 1. BonFire View Panel
```typescript
// src/extension.ts
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  // Register 3D view panel
  const provider = new BonFireViewProvider(context.extensionUri);
  
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'bonfire.view',
      provider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('bonfire.visualize', () => {
      // Open 3D visualization of current workspace
    }),
    
    vscode.commands.registerCommand('bonfire.analyze', async () => {
      // Analyze current file/folder
    }),
    
    vscode.commands.registerCommand('bonfire.deploy', async () => {
      // Trigger MCP deployment workflow
    })
  );
}
```

#### 2. Webview Integration
```typescript
// src/views/BonFireViewProvider.ts
export class BonFireViewProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'visualize':
          await this.visualizeRepo(data.repoPath);
          break;
        case 'triggerMCP':
          await this.triggerMCPAction(data.action, data.params);
          break;
      }
    });
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    // Return HTML with Three.js 3D scene
    return `<!DOCTYPE html>
    <html>
      <head>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
      </head>
      <body>
        <div id="bonfire-3d-view"></div>
        <script>
          // Initialize 3D scene
          const scene = new THREE.Scene();
          // ... Three.js setup
        </script>
      </body>
    </html>`;
  }
}
```

#### 3. Tree View Providers
```typescript
// src/views/DependencyTreeProvider.ts
export class DependencyTreeProvider implements vscode.TreeDataProvider<Dependency> {
  getChildren(element?: Dependency): Dependency[] {
    if (!element) {
      // Return root dependencies
      return this.getRootDependencies();
    }
    // Return child dependencies
    return element.children;
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return {
      label: element.name,
      collapsibleState: element.children.length > 0 
        ? vscode.TreeItemCollapsibleState.Collapsed 
        : vscode.TreeItemCollapsibleState.None,
      command: {
        command: 'bonfire.showDependency',
        title: 'Show Dependency',
        arguments: [element]
      },
      iconPath: this.getIcon(element.type)
    };
  }
}
```

---

## 👥 Role-Based Views

BonFire provides customized views for different roles in your organization.

### 1. Developer View

**Focus**: Code understanding, debugging, and development workflow

**Features**:
- **Call Graph Visualization** - See function call chains in 3D
- **Import/Export Map** - Understand module dependencies
- **API Endpoint Tracing** - Follow API requests through services
- **Hot Paths** - See most-executed code paths highlighted
- **Git Blame Heatmap** - Color by last modified date/author

**View Controls**:
```
[Code] [Functions] [APIs] [Tests] [Coverage]
```

### 2. Finance View

**Focus**: Cost optimization, budget tracking, resource utilization

**Features**:
- **Cost Heatmap** - Services colored by monthly spend (red = expensive)
- **Budget Compliance** - Visual indicators for over/under budget
- **Cost Projections** - AI predicts next month's spending
- **ROI Calculator** - Compare development cost vs business value
- **Optimization Suggestions** - "Switch to spot instances to save 40%"

**3D Visualization**:
```
Size of node = Monthly cost
Color = Budget status
  Green: < 70% of budget
  Yellow: 70-90% of budget
  Red: > 90% or over budget
Pulsing: Cost trending up >20%
```

### 3. HR View

**Focus**: Team management, capacity planning, ownership

**Features**:
- **Ownership Map** - Color code by team ownership
- **Capacity Dashboard** - See which teams are overloaded
- **On-Call Schedule** - Visual calendar of on-call rotations
- **Knowledge Risk** - Highlight code only 1 person understands
- **Hiring Recommendations** - "Operations team needs 2 more engineers"

**Team Colors**:
```
payments-team     → Blue
platform-team     → Green
data-team         → Purple
frontend-team     → Orange
operations-team   → Red
```

### 4. Project Manager View

**Focus**: Project timelines, dependencies, bottlenecks

**Features**:
- **Dependency Chain** - See what blocks what
- **Progress Visualization** - Animated progress bars on services
- **Risk Indicators** - Flag high-risk changes
- **Timeline Gantt** - Project timeline overlaid on code
- **Impact Analysis** - "Changing this affects 3 other projects"

**Visual Indicators**:
```
Green glow    = On track
Yellow glow   = At risk
Red glow      = Blocked/delayed
Dashed lines  = Dependencies
```

### 5. IT/DevOps View

**Focus**: Infrastructure, deployments, system health

**Features**:
- **Infrastructure Map** - All services, DBs, queues in 3D
- **Health Monitoring** - Real-time status indicators
- **Deployment Pipeline** - Visualize CI/CD flow
- **Log Aggregation** - Click service → view logs
- **Auto-Scaling Viz** - Animate scaling events

**Status Colors**:
```
Green  = Healthy
Yellow = Degraded
Red    = Down
Gray   = Unknown
```

---

## 🤖 MCP Integration

### What is MCP?

**Model Context Protocol (MCP)** is Anthropic's open protocol that lets Claude connect to external tools and data sources. Think of it as "API calls for AI".

### MCP Architecture

```
┌──────────────┐
│    Claude    │ (AI Assistant)
└──────┬───────┘
       │ MCP Protocol (JSON-RPC over stdio)
       │
       ┌─────────────────┬─────────────────┐
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Finance MCP │   │   HR MCP    │   │  CI/CD MCP  │
│   Server    │   │   Server    │   │   Server    │
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
       │                 │                 │
       ▼                 ▼                 ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│  Jira API   │   │  HRIS API   │   │ GitHub      │
│  Slack API  │   │  PTO System │   │ Actions     │
└─────────────┘   └─────────────┘   └─────────────┘
```

### Installing MCP Servers

```bash
# Install MCP SDK
npm install @modelcontextprotocol/sdk

# Configure Claude Desktop to use BonFire MCPs
# Edit ~/.config/claude/claude_desktop_config.json
{
  "mcpServers": {
    "bonfire-finance": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/finance/dist/index.js"]
    },
    "bonfire-hr": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/hr/dist/index.js"]
    },
    "bonfire-cicd": {
      "command": "node",
      "args": ["/path/to/bonfire/packages/mcp-servers/cicd/dist/index.js"]
    }
  }
}
```

### Creating a Custom MCP Server

```typescript
// packages/mcp-servers/custom/index.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new Server(
  {
    name: "bonfire-custom",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
      resources: {}
    },
  }
);

// Define tools
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "my_custom_tool",
      description: "What this tool does",
      inputSchema: {
        type: "object",
        properties: {
          param1: { type: "string", description: "First parameter" },
          param2: { type: "number", description: "Second parameter" }
        },
        required: ["param1"]
      }
    }
  ]
}));

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;
  
  if (name === "my_custom_tool") {
    // Your business logic here
    const result = await doSomething(args.param1, args.param2);
    
    return {
      content: [
        {
          type: "text",
          text: JSON.stringify(result)
        }
      ]
    };
  }
  
  throw new Error(`Unknown tool: ${name}`);
});

// Start server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Custom MCP server running");
}

main();
```

---

## 🧑‍💻 Development Guide

### Setting Up Development Environment

```bash
# 1. Fork and clone
git clone https://github.com/your-username/bonfire.git
cd bonfire

# 2. Install dependencies
npm install

# 3. Set up database
docker-compose up -d postgres
npm run db:migrate

# 4. Start all services in development mode
npm run dev:all

# This runs:
# - Frontend dev server (Vite)
# - Backend API (nodemon)
# - MCP servers (ts-node)
```

### Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- repos

# Run with coverage
npm test -- --coverage

# E2E tests
npm run test:e2e
```

### Building for Production

```bash
# Build all packages
npm run build

# Build specific app
npm run build:web
npm run build:api
npm run build:extension

# Create Docker images
docker build -t bonfire-web ./apps/web
docker build -t bonfire-api ./apps/api
```

---

## 🚢 Deployment

### Docker Compose (Recommended for Development)

```yaml
# docker-compose.yml
version: '3.8'

services:
  web:
    build: ./apps/web
    ports:
      - "3000:3000"
    environment:
      - API_URL=http://api:3001
    depends_on:
      - api

  api:
    build: ./apps/api
    ports:
      - "3001:3001"
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/bonfire
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
    depends_on:
      - postgres

  postgres:
    image: postgres:15
    environment:
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=bonfire
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Environment Variables

```bash
# .env.production
NODE_ENV=production

# API URLs
API_URL=https://api.bonfire.dev
WEB_URL=https://bonfire.dev

# Database
DATABASE_URL=postgresql://user:pass@db.bonfire.dev:5432/bonfire

# External APIs
GITHUB_TOKEN=ghp_xxxxxxxxxxxx
ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxx
SLACK_WEBHOOK=https://hooks.slack.com/services/xxx/xxx/xxx

# Security
JWT_SECRET=your-secret-key
SESSION_SECRET=your-session-secret
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### Development Workflow

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Run tests**
   ```bash
   npm test
   npm run lint
   ```
5. **Commit with conventional commits**
   ```bash
   git commit -m "feat: add amazing feature"
   ```
6. **Push and create PR**
   ```bash
   git push origin feature/amazing-feature
   ```

### Commit Convention

```
feat: New feature
fix: Bug fix
docs: Documentation changes
style: Code style changes (formatting)
refactor: Code refactoring
test: Adding tests
chore: Build process or auxiliary tool changes
```

---

## 📚 Resources

### Documentation
- [MCP Protocol Spec](https://github.com/anthropics/mcp)
- [Three.js Documentation](https://threejs.org/docs/)
- [VS Code Extension API](https://code.visualstudio.com/api)
- [Tree-sitter Documentation](https://tree-sitter.github.io/tree-sitter/)

### Tutorials
- [Building 3D Visualizations with React Three Fiber](https://docs.pmnd.rs/react-three-fiber)
- [Creating VS Code Extensions](https://code.visualstudio.com/api/get-started/your-first-extension)
- [MCP Server Development Guide](https://github.com/anthropics/mcp/blob/main/docs/server.md)

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details
