# 🔥 BonFire: Enterprise Code & Data Intelligence Platform

## Project Overview

BonFire is a comprehensive enterprise intelligence platform designed to provide insights into code, data, and cross-functional workflows. It consists of a monorepo containing a React-based web application, a Node.js/Express backend API, a VS Code extension, and several "Model Context Protocol" (MCP) servers for automating tasks across different business domains.

The platform's core features include:

*   **3D Code Visualization:** An interactive 3D representation of GitHub repositories, allowing developers to explore code structure and dependencies.
*   **AI-Powered Data Analysis:** The ability to upload CSV/Excel files and receive instant data analysis and insights.
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
