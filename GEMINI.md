# 🔥 BonFire: Enterprise Code & Data Intelligence Platform

## Project Overview

BonFire is a comprehensive enterprise intelligence platform designed to provide insights into code, data, and cross-functional workflows. It consists of a monorepo containing a React-based web application, a Node.js/Express backend API, a VS Code extension, and several "Model Context Protocol" (MCP) servers for automating tasks across different business domains.

The platform's core features include:

*   **3D Code Visualization:** An interactive 3D representation of GitHub repositories, allowing developers to explore code structure and dependencies.
*   **AI-Powered Data Analysis:** Upload CSV files to receive comprehensive Gemini AI-powered analysis with automatic chart recommendations, statistical insights, and auto-generated PDF reports.
*   **Cross-Functional Automation:** A suite of MCP servers that connect to and automate workflows for Finance, HR, CI/CD, and Security.
*   **Role-Based Views:** Tailored user interfaces and experiences for different roles within an organization, such as developers, finance professionals, HR, project managers, and DevOps engineers.

## Building and Running

The project uses `npm` workspaces to manage its multiple packages. The following commands are essential for development:

*   **Install Dependencies:**
    ```bash
    npm install
    ```

*   **Run All Services (Web, API, and MCP servers):**
    ```bash
    npm run dev:all
    ```

*   **Run Individual Services:**
    *   **Web App:** `npm run dev:web` (http://localhost:3000)
    *   **API:** `npm run dev:api` (http://localhost:3001)
    *   **MCP Servers:** `npm run dev:mcp`

*   **Build for Production:**
    ```bash
    npm run build
    ```

*   **Run Tests:**
    ```bash
    npm test
    ```

## Development Conventions

*   **Code Style:** The project uses ESLint and Prettier for code linting and formatting.
*   **Commit Messages:** The project follows the Conventional Commits specification for commit messages.
*   **Branching:** The `README.md` suggests a feature-branching workflow.
*   **Testing:** The project uses a combination of unit tests and end-to-end tests.

## Key Files

*   `README.md`: The main entry point for understanding the project.
*   `package.json`: Defines the project's dependencies and scripts.
*   `apps/api/src/server.ts`: The main entry point for the backend API.
*   `apps/web/src/App.tsx`: The main entry point for the React web application.
*   `apps/vscode-extension/src/extension.ts`: The main entry point for the VS Code extension.
*   `packages/mcp-servers/`: Contains the implementations of the various MCP servers.
*   `docs/`: Contains detailed documentation for the project.


## Data Analysis Feature

### Overview
The Data Analysis page allows users to upload CSV files and receive comprehensive AI-powered analysis using Google's Gemini AI. The system automatically:

1. Parses CSV data
2. Calculates statistical metrics
3. Generates insights using Gemini AI
4. Recommends appropriate visualizations
5. Creates and auto-downloads a professional PDF report

### Implementation Details

**Frontend Component:** `apps/web/src/components/data/DataAnalyzer.tsx`
- Handles file upload (drag & drop or click)
- Parses CSV using PapaParse
- Sends data to backend API
- Displays analysis results
- Triggers PDF download

**Backend Routes:** `apps/api/src/routes/data.ts`
- `POST /api/data/analyze` - Analyzes CSV data
- `POST /api/data/generate-pdf` - Generates PDF report

**Gemini Service:** `apps/api/src/services/gemini-data-analyzer.ts`
- Calculates statistics (mean, median, min, max)
- Identifies numeric vs categorical columns
- Sends structured prompt to Gemini AI
- Parses AI response into structured format
- Generates chart data

**PDF Generator:** `apps/api/src/services/pdf-generator.ts`
- Creates multi-page PDF report
- Includes summary, insights, charts, statistics
- Professional formatting with headers/footers

### Usage

1. Navigate to Data Analysis page
2. Upload CSV file
3. Click "Analyze with Gemini AI"
4. View results and download PDF

### API Response Format

```json
{
  "summary": "Brief overview of the dataset",
  "insights": [
    "Key insight 1",
    "Key insight 2"
  ],
  "charts": [
    {
      "type": "bar",
      "title": "Revenue by Region",
      "xKey": "region",
      "yKey": "revenue",
      "data": [...]
    }
  ],
  "statistics": {
    "revenue": {
      "type": "numeric",
      "mean": 2250.5,
      "median": 2200,
      "min": 1500,
      "max": 3200
    }
  }
}
```

### Dependencies

- `@google/generative-ai` - Gemini AI SDK
- `papaparse` - CSV parsing
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF tables

### Documentation

- [Setup Guide](./docs/DATA_ANALYSIS_SETUP.md)
- [User Guide](./docs/DATA_ANALYSIS_USER_GUIDE.md)
- [Sample CSV](./sample_data.csv)
