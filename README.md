# 🔥 BonFire: Enterprise Code & Data Intelligence Platform

> Transform how enterprise teams understand code, data, and cross-functional workflows through 3D visualization and AI-powered automation.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.0-61dafb.svg)](https://reactjs.org/)
[![Claude](https://img.shields.io/badge/Powered%20by-Claude%20%2B%20MCP-orange.svg)](https://www.anthropic.com/)

## 🚀 Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/bonfire.git
cd bonfire

# 2. Run setup script
chmod +x scripts/setup.sh
./scripts/setup.sh

# 3. Configure environment
cp .env.example .env
# Edit .env with your API keys

# 4. Start all services
npm run dev:all
```

Visit:
- **Web App:** http://localhost:3000
- **API:** http://localhost:3001
- **Health Check:** http://localhost:3001/health

## 📋 What is BonFire?

BonFire solves the enterprise software development crisis by providing:

1. **3D Code Visualization** - Explore any GitHub repository in interactive 3D
2. **AI-Powered Data Analysis** - Upload CSV for Gemini AI analysis with auto-generated PDF reports
3. **Cross-Functional Automation** - MCP servers connect Finance, HR, CI/CD, Security
4. **Role-Based Views** - Tailored experiences for developers, finance, HR, PMs, DevOps

### The Problem We Solve

**Before BonFire:**
- 2-5 days for deployment approvals
- Hours of manual data analysis
- Weeks to understand codebase
- Email/Slack chaos for cross-team coordination

**With BonFire:**
- 2 minutes automated deployment workflows
- Instant AI-powered insights
- Interactive 3D code exploration
- Centralized intelligence hub

## 🏗️ Project Structure

```
bonfire/
├── apps/
│   ├── web/                    # React web application
│   ├── api/                    # Express API server
│   └── vscode-extension/       # VS Code extension
│
├── packages/
│   ├── mcp-servers/            # MCP server implementations
│   │   ├── finance/            # Budget & cost tracking
│   │   ├── hr/                 # Team ownership & capacity
│   │   ├── cicd/               # Deployment automation
│   │   └── security/           # Security & compliance
│   └── shared/                 # Shared types & utilities
│
├── scripts/                    # Development scripts
├── docs/                       # Documentation
└── docker-compose.yml          # Docker configuration
```

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript + Three.js |
| **Backend** | Node.js + Express |
| **3D Engine** | React Three Fiber |
| **AI** | Claude + MCP Protocol |
| **Database** | PostgreSQL |
| **Deployment** | Docker + Kubernetes |

## ✨ Key Features

### 1. 3D Repository Visualization
- Interactive exploration of code structure
- Smart connections showing API calls and dependencies
- Real-time updates on git push
- Level-of-detail switching (architecture → functions)

### 2. Role-Based Views
- **Developer:** Code-first with function calls
- **Finance:** Cost analysis and budget alerts
- **HR:** Team ownership and capacity planning
- **PM:** Project timelines and dependencies
- **DevOps:** Infrastructure and system health

### 3. Intelligent Data Analysis
- Auto-detection of column types
- Statistical analysis and correlations
- Dependency identification
- AI recommendations

### 4. MCP-Powered Automation
- Finance: Budget checks and approvals
- HR: Team capacity and on-call schedules
- CI/CD: Automated deployments
- Security: Compliance and vulnerability scans

## 📦 Installation

### Prerequisites

```bash
node >= 18.0.0
npm >= 9.0.0
git >= 2.30.0
docker >= 20.10.0 (optional)
```

### Development Setup

```bash
# Install all dependencies
npm install

# Start development servers
npm run dev:all

# Or start individually
npm run dev:web       # Frontend only
npm run dev:api       # Backend only
```

### Docker Setup

```bash
# Start all services with Docker
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file:

```bash
# API Configuration
API_URL=http://localhost:3001
WEB_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/bonfire

# GitHub Integration
GITHUB_TOKEN=your_github_token_here

# Claude AI
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Feature Flags
ENABLE_3D_VISUALIZATION=true
ENABLE_AI_ANALYSIS=true
```

## 📚 Documentation

- [API Documentation](docs/API.md) - REST API endpoints and examples
- [MCP Guide](docs/MCP_GUIDE.md) - MCP server setup and development
- [Deployment Guide](docs/DEPLOYMENT.md) - Production deployment instructions
- [VS Code Fork Guide](docs/VSCODE_FORK_GUIDE.md) - Fork VS Code with 3D visualization
- [VS Code Quick Start](VSCODE_QUICK_START.md) - Get 3D VS Code running in minutes
- [Blueprint](BLUEPRINT.md) - Detailed project blueprint

## 🎨 VS Code with 3D Visualization

Want to run your own version of VS Code with built-in 3D repository visualization?

```bash
# Quick setup
./scripts/setup-vscode-fork.sh

# Follow the guide
See VSCODE_QUICK_START.md
```

This will:
- Fork and build VS Code
- Add BonFire 3D icon to Activity Bar
- Enable 3D visualization of any GitHub repo
- Integrate with BonFire backend

## 🎯 Usage Examples

### Visualize a Repository

```typescript
// In the web app
import { RepoVisualizer } from '@/components/3d/RepoVisualizer';

<RepoVisualizer
  owner="facebook"
  repo="react"
  branch="main"
/>
```

### Analyze Data

```bash
# Upload CSV for analysis
curl -X POST http://localhost:3001/api/data/analyze \
  -F "file=@sales_data.csv"
```

### Trigger Deployment via MCP

```typescript
// Automated deployment workflow
const result = await mcpClient.callTool('cicd', 'trigger_deployment', {
  service: 'payment-api',
  environment: 'production',
  version: 'v2.1.0'
});
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run E2E tests
npm run test:e2e
```

## 📦 Building for Production

```bash
# Build all packages
npm run build

# Build specific apps
npm run build:web
npm run build:api
npm run build:extension
```

## 🚢 Deployment

### Docker Deployment

```bash
# Build production images
docker build -t bonfire-web ./apps/web
docker build -t bonfire-api ./apps/api

# Run in production mode
docker-compose -f docker-compose.prod.yml up -d
```

### Kubernetes Deployment

See [Deployment Guide](docs/DEPLOYMENT.md) for detailed Kubernetes instructions.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -m "feat: add amazing feature"`
6. Push: `git push origin feature/amazing-feature`
7. Create a Pull Request

### Commit Convention

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes
- `refactor:` Code refactoring
- `test:` Adding tests
- `chore:` Build/tooling changes

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

Built with amazing open-source projects:
- [VS Code (Code-OSS)](https://github.com/microsoft/vscode)
- [Three.js](https://github.com/mrdoob/three.js)
- [React Three Fiber](https://github.com/pmndrs/react-three-fiber)
- [MCP SDK](https://github.com/anthropics/mcp)
- [Tree-sitter](https://github.com/tree-sitter/tree-sitter)

## 📞 Support

- **Documentation:** [docs/](docs/)
- **Issues:** [GitHub Issues](https://github.com/your-org/bonfire/issues)
- **Discussions:** [GitHub Discussions](https://github.com/your-org/bonfire/discussions)

## 🗺️ Roadmap

- [ ] Support for additional programming languages
- [ ] Real-time collaboration features
- [ ] Advanced cost prediction models
- [ ] Integration with more project management tools
- [ ] Mobile app for monitoring
- [ ] Custom plugin system

---

**Built with 🔥 by the BonFire Team**