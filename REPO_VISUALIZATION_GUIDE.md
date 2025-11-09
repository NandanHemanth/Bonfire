# Repository Visualization & Analysis Guide

## Overview

The BonFire platform now includes advanced GitHub repository visualization and analysis features specifically for the **Developer role**. This guide covers all the new features.

## Features

### 🔄 Real-time Repository Sync
- **Sync Button**: Click "Sync Repository" to fetch the latest changes
- **Status Monitoring**: Real-time progress updates during sync
- **Gemini AI Analysis**: Automatically analyzes code structure, functions, and API connections
- **JSON Storage**: All analysis results are saved locally for quick access

### 🎨 Color-Coded Visualization

Files are color-coded based on their status from the last commit:

- **🟢 Green**: New files (added in latest commit)
- **🔴 Red**: Deleted files (removed in latest commit)
- **🟠 Orange**: Modified files (changed in latest commit)
- **🔵 Blue**: Unchanged files (thin rectangular shape)
- **💠 Translucent Light Blue**: Folders/directories

### 📊 3D Visualization Elements

1. **Central Sphere (Orange)**: Repository root
2. **Large Translucent Boxes (Light Blue)**: Directories/folders
3. **Small Rectangles (Color-coded)**: Individual files
4. **Gray Lines**: File-to-directory connections
5. **Green Lines**: Import/export connections between files

### 🔍 Hover Functionality

Hover over any file to see:
- File name and full path
- Status (new, modified, deleted, unchanged)
- Programming language
- Number of functions
- Lines of code
- API calls count
- List of functions (first 3)
- List of API endpoints (first 2)

### 🔗 Connection Visualization

The 3D view shows:
- **File Connections**: Import/export relationships between files
- **API Connections**: External API calls detected in the code
- **Directory Structure**: Clear hierarchical organization

## API Endpoints

### Sync Repository
```bash
POST /api/repos/:owner/:repo/sync
Content-Type: application/json

{
  "branch": "main"
}
```

### Get Sync Status
```bash
GET /api/repos/:owner/:repo/sync-status
```

Response:
```json
{
  "status": "complete",
  "progress": 100,
  "message": "Sync complete",
  "lastSync": "2025-11-08T10:30:00Z"
}
```

### Get Analysis Results
```bash
GET /api/repos/:owner/:repo/analysis
```

Response includes:
- All files with functions, imports, exports
- File connections and dependencies
- API endpoints detected
- Statistics (total files, functions, connections, APIs)

## How It Works

### 1. Analysis Process

When you click "Sync Repository":

1. **GitHub Fetch**: Retrieves repository structure and commit history
2. **Change Detection**: Compares latest commit with previous to identify new/modified/deleted files
3. **Gemini AI Analysis**: Each code file is analyzed to extract:
   - Function definitions with parameters
   - Import/export statements
   - API calls (fetch, axios, etc.)
   - Code structure and relationships
4. **JSON Storage**: Results saved to `data/analysis/{owner}_{repo}_latest.json`
5. **Visualization Update**: 3D view updates with color-coded files and connections

### 2. File Analysis

The Gemini AI analyzer extracts:

```typescript
{
  path: "src/components/App.tsx",
  functions: [
    { name: "App", line: 10, params: ["props"], description: "Main app component" }
  ],
  imports: ["./Header", "./Footer"],
  exports: ["App"],
  apiCalls: [
    { method: "GET", endpoint: "/api/users", line: 25, type: "rest" }
  ],
  linesOfCode: 150,
  language: "TypeScript",
  status: "modified"
}
```

### 3. Connection Mapping

The system builds a connection graph showing:
- Which files import from which
- Internal vs external dependencies
- API endpoint locations

## Usage Example

### Basic Workflow

1. **Navigate to Developer View**
   - Click on "Developer" in the navigation menu
   - Only visible when role is set to "developer"

2. **Enter Repository**
   - Enter GitHub URL: `https://github.com/facebook/react`
   - Or shorthand: `facebook/react`
   - Click "Visualize Repository"

3. **Sync for Latest Data**
   - Click "🔄 Sync Repository" button (top right)
   - Wait for analysis to complete (usually 30-60 seconds)
   - View updates automatically when done

4. **Explore Visualization**
   - **Rotate**: Left click + drag
   - **Pan**: Right click + drag
   - **Zoom**: Scroll wheel
   - **Hover**: Move mouse over files to see details

## Stored Data

Analysis results are saved in:
```
data/analysis/
  ├── facebook_react_latest.json
  ├── facebook_react_1699456789123.json
  └── microsoft_vscode_latest.json
```

Each JSON file contains complete analysis data that can be:
- Reloaded without re-analyzing
- Shared with team members
- Used for further processing

## Role-Based Access

**IMPORTANT**: This visualization is **ONLY available for the Developer role**.

Other roles will see:
```
"This view is only available for Developer role"
```

To enable for a user, ensure their role is set to `"developer"` in the application.

## Performance Notes

- **Analysis Limit**: Up to 100 code files per repository
- **Sync Time**: 30-60 seconds for average repos
- **File Size**: Large files (>5000 chars) are truncated for AI analysis
- **Cache**: Analysis results are cached in JSON files

## Visual Legend

The visualization includes a legend showing:
- Color meanings for file statuses
- Connection types
- Repository statistics
- Current file counts

## Troubleshooting

### "No analysis found"
- Click "Sync Repository" to perform initial analysis
- Check that GitHub token is valid in `.env`
- Verify Gemini API key is set

### Sync fails
- Check internet connection
- Verify repository is public or GitHub token has access
- Check API rate limits

### Files not showing
- Some files may be filtered (only code files analyzed)
- Large repositories are limited to 100 files
- Binary files are excluded

## Technical Stack

- **Frontend**: React + Three.js for 3D rendering
- **Backend**: Express.js with TypeScript
- **AI**: Google Gemini Pro for code analysis
- **GitHub**: Octokit for repository access
- **Storage**: JSON files in local filesystem

## Next Steps

Future enhancements could include:
- Database storage for multi-user environments
- Historical analysis comparison
- Custom color schemes
- Export to various formats (PDF, SVG)
- Team collaboration features
- Integration with CI/CD pipelines

---

**Generated with Claude Code** 🔥
