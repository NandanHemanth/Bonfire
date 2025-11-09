# About BonFire 🔥

**Enterprise intelligence, beautifully visualized.**

---

## Inspiration

The spark for BonFire ignited from a frustration every enterprise developer knows too well: **waiting**.

Picture this: You've just finished coding a critical feature. The pull request is ready. But before deployment, you need budget approval from Finance, capacity confirmation from HR, security clearance, and DevOps coordination. What should take minutes stretches into days of Slack threads, calendar invites, and email chains.

**Why?** Because each team operates in its own silo. Finance sees spreadsheets. Developers see code. HR sees org charts. Nobody sees the complete picture.

We asked ourselves: **What if we could break down these walls?** What if code, data, teams, and workflows existed in one unified, interactive 3D space where anyone—regardless of their role—could instantly understand what's happening?

That question became BonFire: a platform that transforms invisible enterprise complexity into tangible, explorable 3D visualization. No more information silos. No more waiting. Just clarity.

---

## What it does

BonFire is an **enterprise code and data intelligence platform** that provides five superpowers:

### 🌐 **3D Repository Visualization**
Transform any GitHub repository into an interactive 3D world. Files become glowing nodes, functions orbit around them like planets, and API calls appear as flowing connections. Click any file to open it instantly in VS Code. Navigate thousands of files as intuitively as exploring a virtual landscape.

### 👥 **Role-Based Intelligence Views**
Five specialized views tailored for different teams:
- **Developer View:** Functions, API calls, code dependencies with syntax-aware coloring
- **Finance View:** Cost heatmaps showing development and maintenance expenses per file
- **HR View:** Team ownership visualization with contributor analytics
- **PM View:** Issue tracking with high/medium/low impact indicators on affected files
- **DevOps View:** Test coverage and CI/CD pipeline status with multi-LLM validation

Same codebase, five completely different perspectives.

### 🤖 **AI-Powered Data Analysis**
Upload CSV files and watch Gemini AI automatically:
- Detect column types and statistical patterns
- Identify correlations and dependencies
- Generate visual charts (scatter plots, bar charts, relationship graphs)
- Create actionable insights with recommendations
- Auto-download a comprehensive PDF report

No manual pivot tables. No hours of spreadsheet work. Just instant intelligence.

### 🔗 **MCP-Powered Workflow Automation**
Four Model Context Protocol (MCP) servers connect Claude AI to your enterprise tools:
- **Finance MCP:** Budget checks, cost estimation, approval workflows
- **HR MCP:** Team capacity, code ownership, on-call schedules
- **CI/CD MCP:** Automated deployments, pipeline status, rollbacks
- **Security MCP:** Compliance checks, vulnerability scans, audit trails

Trigger complex cross-team workflows with a single click. Claude orchestrates the entire process.

### ⚡ **Visual Workflow Builder**
Drag-and-drop canvas for creating custom automation workflows:
- 50+ pre-built integration nodes (Slack, Jira, GitHub, databases, APIs)
- Gemini-powered workflow generation from natural language
- Real-time execution with live status updates
- Role-based workflow templates for common scenarios

Build what used to require custom code in minutes, not days.

---

## How we built it

### **Tech Stack**

**Frontend**
- **React 18 + TypeScript** - Type-safe component architecture
- **Three.js + React Three Fiber** - WebGL-powered 3D rendering at 60fps
- **Tailwind CSS** - Responsive, modern UI design
- **ReactFlow** - Visual workflow canvas with node-based editing
- **Vanta.js** - Animated background effects

**Backend**
- **Node.js + Express** - RESTful API server
- **TypeScript** - End-to-end type safety
- **PostgreSQL** - Persistent metadata storage
- **Redis** - Distributed caching and locking
- **Docker** - Containerized deployment

**AI & Analysis**
- **Google Gemini Pro** - Data analysis, repository insights, workflow generation
- **Anthropic Claude** - Code understanding via MCP servers
- **MCP SDK** - Custom tool integrations for Finance, HR, CI/CD, Security
- **Tree-sitter** - Multi-language AST parsing (JavaScript, Python, Go, Rust, TypeScript)

**Integration**
- **Octokit** - GitHub API for repository access
- **Papa Parse** - High-performance CSV parsing
- **jsPDF** - Automated PDF report generation
- **Winston** - Structured logging

### **Development Journey**

**Week 1-2: Foundation**
Built the core 3D visualization engine. Started with basic Three.js scene setup, added GitHub API integration to fetch repository structures, implemented raycasting for hover/click interactions. Used React refs to bridge imperative Three.js code with declarative React components.

**Week 2-3: AI Integration**
Integrated Gemini for intelligent code analysis. Built chunked analysis system to handle repositories with 5000+ files within token limits. Created data analyzer with CSV parsing, statistical analysis, and automatic PDF generation.

**Week 3-4: Multi-Perspective Views**
Designed five role-based views with unique color coding and data overlays. Finance view shows cost heatmaps, HR view displays team ownership, PM view highlights issues, DevOps view tracks test results. Same 3D visualization, five different lenses.

**Week 4-5: MCP Servers**
Learned Anthropic's Model Context Protocol from scratch. Built four custom MCP servers (Finance, HR, CI/CD, Security) that let Claude interact with enterprise tools. Each server exposes tools for budget checks, deployments, team queries, and security scans.

**Week 5-6: Workflow Automation**
Implemented visual workflow builder using ReactFlow. Created node library with 50+ integrations. Added Gemini-powered workflow generation—describe what you want in plain English, get a working workflow.

**Week 6-7: Polish & Production**
Added Vanta.js animated backgrounds, refined UI/UX with modern dark theme, implemented Redis caching for sub-second load times, set up Docker Compose for one-command deployment, wrote comprehensive documentation.

### **Architectural Decisions**

**Monorepo Structure:** Used NPM workspaces to share TypeScript types and utilities across apps (web, API, VS Code extension) and packages (MCP servers, shared libraries). This eliminated version drift and enabled atomic refactoring.

**Instanced Meshes:** Rendering 2000+ objects required using `THREE.InstancedMesh` instead of individual meshes. Improved performance from 25fps to 60fps.

**Parallel Processing:** Generate role-specific data (Finance, HR, PM, DevOps) in parallel using `Promise.all`, reducing analysis time from 45s to 12s.

**Redis Distributed Locks:** Prevent race conditions when multiple users sync the same repository simultaneously.

---

## Challenges we ran into

### **1. 3D Performance at Scale**
**Problem:** Rendering 500+ files with functions and API connections (2000+ total objects) dropped frame rates to 25fps.

**Solution:** Switched to `THREE.InstancedMesh` for repeated geometries. Instead of creating 2000 individual meshes, we create one instanced mesh and update transformation matrices. Result: smooth 60fps even with complex repositories.

### **2. AI Token Limits**
**Problem:** Large repositories (1000+ files) exceeded Gemini's 30k token context window.

**Solution:** Implemented directory-based chunking. Analyze each top-level directory separately, then synthesize results in a final pass. Successfully analyzed repositories with 5000+ files.

### **3. Race Conditions in Sync Operations**
**Problem:** Multiple users clicking "Sync" on the same repository caused duplicate analysis jobs and data corruption.

**Solution:** Implemented Redis distributed locks with automatic expiration. Only one sync operation can run per repository at a time. Eliminated race conditions entirely.

### **4. Cross-Origin VS Code Integration**
**Problem:** Web app couldn't open files in local VS Code due to CORS and same-origin policies.

**Solution:** Created backend API endpoint that invokes VS Code CLI (`code <filepath>`). Web app sends file path to server, server executes local command. Seamless click-to-open functionality.

### **5. Expensive Role Data Generation**
**Problem:** Generating Finance, HR, PM, and DevOps data for every file added 45 seconds to analysis.

**Solution:** Generate all role data in parallel using `Promise.all`, cache results in Redis with 1-hour TTL. Analysis time reduced to 12s, view switching is instant.

### **6. Complex PDF Chart Generation**
**Problem:** jsPDF doesn't natively support rendering React components or HTML canvas.

**Solution:** Render Recharts as SVG, convert to image using canvas, embed in PDF. Produces high-quality, scalable charts in generated reports.

---

## Accomplishments that we're proud of

✅ **Built a full-stack monorepo** with 3 production apps, 5 NPM packages, and 100% TypeScript coverage

✅ **Achieved 60fps 3D rendering** for repositories with 2000+ visualized objects using advanced Three.js optimization

✅ **Integrated multiple AI models** (Gemini + Claude) working together via the Model Context Protocol

✅ **Created 5 specialized role views** from a single data source—same codebase serves Developer, Finance, HR, PM, and DevOps teams

✅ **Automated data analysis end-to-end**—upload CSV, get AI insights + PDF report in under 10 seconds

✅ **Built 4 custom MCP servers** enabling Claude to autonomously check budgets, trigger deployments, query team capacity, and run security scans

✅ **Designed a visual workflow builder** with 50+ integration nodes and AI-powered workflow generation

✅ **Handled enterprise-scale repositories**—successfully visualized 5000+ file codebases with complex dependency graphs

✅ **Reduced analysis time by 73%** (45s → 12s) through parallel processing and intelligent caching

✅ **Made it production-ready** with Docker deployment, Redis caching, distributed locking, and comprehensive error handling

Most importantly: **We made enterprise complexity beautiful.** Code isn't just text anymore—it's a living, explorable 3D landscape.

---

## What we learned

### **Technical Mastery**

**3D Graphics Are Deceptively Hard**
Three.js has a steep learning curve, but React Three Fiber bridges the gap beautifully. We learned that raycasting is essential for 3D interactions, instanced meshes are critical for performance, and lighting makes or breaks visual appeal.

**AI Orchestration > Single Model**
Don't force one AI to do everything. Gemini excels at data analysis. Claude excels at code understanding. MCP lets them work together seamlessly. Use the right tool for each job.

**Role-Based Design Multiplies Value**
The same visualization serves five different teams when you design with flexibility from the start. Color coding, tooltips, and overlays can transform based on user role without duplicating infrastructure.

**Monorepo Architecture Pays Off**
NPM workspaces enable atomic refactoring across apps and packages. Shared TypeScript types prevent version drift. Consistent build scripts (`dev:all`, `build`, `test`) improve developer experience exponentially.

**Performance Requires Constant Vigilance**
Every mesh, every API call, every state update matters. Profile early, optimize often. We learned to use `Promise.all` for parallel operations, Redis for caching, and instanced meshes for rendering.

### **Product Insights**

**Users Want Instant Answers**
"How much does this service cost?" "Who owns this code?" "What breaks if I deploy?" These questions shouldn't require meetings, spreadsheets, or tribal knowledge. Visualization makes answers instant and obvious.

**Cross-Team Workflows Are the Future**
Finance, HR, DevOps, and Security shouldn't be separate worlds. MCP servers enable automated coordination that used to require days of human communication.

**AI Can Find Patterns Humans Miss**
Gemini identified correlations in CSV data we would have never spotted manually. AI doesn't just automate existing workflows—it reveals insights we didn't know existed.

**Good UX Beats Technical Complexity**
Vanta.js backgrounds, smooth animations, hover tooltips, click-to-open files—these "polish" details are what users remember. Technical excellence enables great UX, but UX is what users feel.

### **The Meta-Learning**

**Build for Real Problems**
Every feature in BonFire exists because someone said "I wish I could just..." Start with pain points, not cool technologies.

**Ship, Then Iterate**
Version 1 had basic boxes and spheres. Version 7 has glowing nodes, function orbits, role-based colors, and AI-powered workflows. Perfect is the enemy of shipped.

**Documentation Matters**
Clear README, comprehensive API docs, and inline code comments saved us countless hours. Write docs as you code, not after.

---

## What's next for Bonfire

### **Immediate Roadmap (Next 3 Months)**

**Real-Time Collaboration**
Enable multiple users to explore the same repository simultaneously. See cursors of other team members, share annotations, co-edit workflows in real-time using WebSockets.

**Enhanced Code Analysis**
Add security vulnerability detection powered by AI. Highlight potential bugs, code smells, and performance bottlenecks directly in 3D visualization. Integrate with existing linters and security scanners.

**Mobile App**
iOS and Android apps for monitoring deployments, viewing dashboards, and receiving alerts on the go. Push notifications for workflow completions, budget alerts, and critical issues.

**Custom Plugin System**
Let users create their own MCP servers and workflow nodes. Publish to a community marketplace. Build integrations for any internal tool or API.

### **Long-Term Vision (6-12 Months)**

**Multi-Cloud Cost Optimization**
Integrate with AWS, GCP, and Azure to track actual infrastructure costs in real-time. AI-powered recommendations for cost reduction (spot instances, reserved capacity, right-sizing).

**Advanced Analytics & Predictions**
Use machine learning to predict:
- Future costs based on development velocity
- Deployment success probability based on code changes
- Team capacity bottlenecks before they happen
- Security risks from code patterns

**Real-Time Repository Updates**
WebSocket integration with GitHub webhooks. See code changes reflected in 3D visualization instantly. Watch functions appear, connections form, and complexity grow in real-time as developers commit.

**Slack/Teams Integration**
Deploy directly from Slack commands. Get budget approvals via Teams messages. BonFire becomes the invisible layer connecting all your tools.

**Offline Mode**
Service worker support for analyzing local repositories without internet. Perfect for secure environments or air-gapped networks.

**Advanced Workflow Features**
- Conditional logic and branching
- Error handling and retry mechanisms
- Scheduled workflows (cron-like)
- Workflow versioning and rollback
- A/B testing for workflow optimization

### **Technical Evolution**

**WebAssembly Performance**
Port heavy computation (3D rendering, data analysis, file parsing) to Rust compiled to WebAssembly. 10x performance gains for large repositories.

**GraphQL API**
Replace REST with GraphQL for more efficient data fetching. Reduce over-fetching, enable client-specified queries, improve performance.

**Kubernetes Native**
Helm charts for one-command Kubernetes deployment. Auto-scaling based on analysis workload. Support for enterprise Kubernetes environments.

**Self-Hosted Enterprise Edition**
On-premise deployment for companies with strict data residency requirements. LDAP/SAML authentication. Audit logging and compliance features.

---

## The BonFire Vision

We believe the future of enterprise software isn't about more dashboards, more spreadsheets, or more meetings. It's about **unified intelligence** that adapts to how you work.

Developers shouldn't think about budgets. Finance shouldn't wade through code. HR shouldn't guess at team capacity. Everyone should have the information they need, in the format they understand, exactly when they need it.

BonFire is our answer: **One platform. Five perspectives. Infinite clarity.**

The fire is just getting started. 🔥

---

**Built by developers who were tired of waiting for approvals**

*Tech Stack: React, Three.js, Node.js, TypeScript, Gemini AI, Claude, MCP, PostgreSQL, Redis, Docker*

*Open Source • MIT License • [GitHub](https://github.com/your-org/bonfire)*
