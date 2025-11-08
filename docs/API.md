# BonFire API Documentation

## Overview

The BonFire API provides endpoints for repository visualization, data analysis, and MCP orchestration.

**Base URL:** `http://localhost:3001/api`

## Authentication

Currently, the API uses API keys passed via headers:

```
Authorization: Bearer YOUR_API_KEY
```

## Endpoints

### Repository Endpoints

#### GET `/api/repos/:owner/:repo`

Fetch repository structure and metadata for 3D visualization.

**Parameters:**
- `owner` (path): Repository owner username
- `repo` (path): Repository name
- `branch` (query, optional): Branch name (default: `main`)

**Response:**
```json
{
  "owner": "microsoft",
  "name": "vscode",
  "branch": "main",
  "structure": [...],
  "metadata": {
    "stars": 150000,
    "forks": 25000,
    "language": "TypeScript",
    "lastUpdated": "2024-01-20T10:00:00Z",
    "contributors": 1500
  }
}
```

#### POST `/api/repos/:owner/:repo/analyze`

Analyze specific file or directory in repository.

**Request Body:**
```json
{
  "path": "src/vs/workbench",
  "branch": "main"
}
```

**Response:**
```json
{
  "path": "src/vs/workbench",
  "type": "directory",
  "files": 245,
  "loc": 125000,
  "complexity": "high",
  "dependencies": [...],
  "exports": [...]
}
```

### Data Analysis Endpoints

#### POST `/api/data/analyze`

Upload and analyze CSV/Excel data.

**Request:**
- Content-Type: `multipart/form-data`
- Field: `file` (CSV or Excel file)

**Response:**
```json
{
  "columns": [
    {
      "name": "revenue",
      "type": "numeric",
      "role": "dependent",
      "uniqueValues": 1200,
      "nullCount": 5
    }
  ],
  "statistics": {
    "mean": 50000,
    "median": 48000,
    "stdDev": 12000
  },
  "correlations": [
    {
      "variable1": "marketing_spend",
      "variable2": "revenue",
      "coefficient": 0.85,
      "strength": "strong",
      "direction": "positive"
    }
  ],
  "insights": [...],
  "recommendations": [
    "Increase marketing_spend by 10% to boost revenue by ~8.5%"
  ]
}
```

### MCP Endpoints

#### POST `/api/mcp/trigger`

Trigger an MCP action (finance, HR, CI/CD, security).

**Request Body:**
```json
{
  "server": "finance",
  "action": "check_budget",
  "params": {
    "service": "api-gateway",
    "estimatedCost": 2500
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "service": "api-gateway",
    "estimatedCost": 2500,
    "approved": true,
    "remainingBudget": 7500
  },
  "timestamp": "2024-01-20T10:30:00Z"
}
```

#### GET `/api/mcp/status`

Get status of all MCP servers.

**Response:**
```json
{
  "finance": true,
  "hr": true,
  "cicd": true,
  "security": false
}
```

## Error Responses

All errors follow this format:

```json
{
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND",
    "details": {}
  }
}
```

**Common Status Codes:**
- `200` - Success
- `400` - Bad Request
- `401` - Unauthorized
- `404` - Not Found
- `429` - Rate Limit Exceeded
- `500` - Internal Server Error

## Rate Limiting

- **Limit:** 100 requests per 15 minutes per IP
- **Headers:**
  - `X-RateLimit-Limit`: Maximum requests
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset timestamp

## Examples

### Fetch React Repository
```bash
curl http://localhost:3001/api/repos/facebook/react?branch=main
```

### Analyze Data File
```bash
curl -X POST http://localhost:3001/api/data/analyze \
  -F "file=@sales_data.csv"
```

### Check Budget with Finance MCP
```bash
curl -X POST http://localhost:3001/api/mcp/trigger \
  -H "Content-Type: application/json" \
  -d '{
    "server": "finance",
    "action": "check_budget",
    "params": {
      "service": "payment-api",
      "estimatedCost": 3000
    }
  }'
```
