import { Octokit } from '@octokit/rest';
import Parser from 'tree-sitter';
import JavaScript from 'tree-sitter-javascript';
import TypeScript from 'tree-sitter-typescript';
import Python from 'tree-sitter-python';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

interface FunctionCall {
  name: string;
  line: number;
  file: string;
  type: 'function' | 'method' | 'constructor';
}

interface FileConnection {
  source: string;
  target: string;
  type: 'import' | 'require' | 'api_call' | 'export';
  line?: number;
}

interface APIEndpoint {
  method: string;
  path: string;
  file: string;
  line: number;
  type: 'rest' | 'graphql' | 'websocket';
}

interface FileHierarchy {
  path: string;
  type: 'file' | 'directory';
  children?: FileHierarchy[];
  depth: number;
  parent?: string;
}

interface CodeAnalysisResult {
  functions: FunctionCall[];
  connections: FileConnection[];
  apis: APIEndpoint[];
  hierarchy: FileHierarchy[];
  imports: Map<string, string[]>;
  exports: Map<string, string[]>;
}

export async function analyzeRepository(owner: string, repo: string, branch: string = 'main'): Promise<CodeAnalysisResult> {
  try {
    // Fetch repository tree
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1'
    });

    const result: CodeAnalysisResult = {
      functions: [],
      connections: [],
      apis: [],
      hierarchy: [],
      imports: new Map(),
      exports: new Map()
    };

    // Build hierarchy
    result.hierarchy = buildFileHierarchy(tree.tree);

    // Analyze code files (limit to avoid rate limits)
    const codeFiles = tree.tree
      .filter(item => item.type === 'blob' && isCodeFile(item.path || ''))
      .slice(0, 50); // Limit analysis

    for (const file of codeFiles) {
      try {
        const content = await fetchFileContent(owner, repo, file.path || '', branch);
        if (content) {
          const fileAnalysis = analyzeFileContent(file.path || '', content);

          result.functions.push(...fileAnalysis.functions);
          result.connections.push(...fileAnalysis.connections);
          result.apis.push(...fileAnalysis.apis);

          if (fileAnalysis.imports.length > 0) {
            result.imports.set(file.path || '', fileAnalysis.imports);
          }
          if (fileAnalysis.exports.length > 0) {
            result.exports.set(file.path || '', fileAnalysis.exports);
          }
        }
      } catch (error) {
        console.error(`Failed to analyze ${file.path}:`, error);
      }
    }

    // Build connection graph from imports/exports
    buildConnectionGraph(result);

    return result;
  } catch (error: any) {
    throw new Error(`Failed to analyze repository: ${error.message}`);
  }
}

function buildFileHierarchy(tree: any[]): FileHierarchy[] {
  const hierarchy: FileHierarchy[] = [];
  const pathMap = new Map<string, FileHierarchy>();

  // Sort by path depth
  const sorted = tree
    .filter(item => item.path)
    .sort((a, b) => a.path.split('/').length - b.path.split('/').length);

  for (const item of sorted) {
    const parts = item.path.split('/');
    const depth = parts.length - 1;
    const parent = parts.slice(0, -1).join('/');

    const node: FileHierarchy = {
      path: item.path,
      type: item.type === 'blob' ? 'file' : 'directory',
      depth,
      parent: parent || undefined,
      children: []
    };

    pathMap.set(item.path, node);

    if (parent && pathMap.has(parent)) {
      const parentNode = pathMap.get(parent)!;
      if (!parentNode.children) parentNode.children = [];
      parentNode.children.push(node);
    } else if (depth === 0) {
      hierarchy.push(node);
    }
  }

  return hierarchy;
}

function isCodeFile(path: string): boolean {
  const codeExtensions = ['.js', '.ts', '.tsx', '.jsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.rb'];
  return codeExtensions.some(ext => path.endsWith(ext));
}

async function fetchFileContent(owner: string, repo: string, path: string, branch: string): Promise<string | null> {
  try {
    const { data } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    if ('content' in data && data.content) {
      return Buffer.from(data.content, 'base64').toString('utf-8');
    }
    return null;
  } catch (error) {
    return null;
  }
}

function analyzeFileContent(filePath: string, content: string): {
  functions: FunctionCall[];
  connections: FileConnection[];
  apis: APIEndpoint[];
  imports: string[];
  exports: string[];
} {
  const result = {
    functions: [] as FunctionCall[],
    connections: [] as FileConnection[],
    apis: [] as APIEndpoint[],
    imports: [] as string[],
    exports: [] as string[]
  };

  // Regex-based analysis (fast, works for most cases)
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Detect JavaScript/TypeScript imports
    const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
    if (importMatch) {
      result.imports.push(importMatch[1]);
      result.connections.push({
        source: filePath,
        target: importMatch[1],
        type: 'import',
        line: lineNumber
      });
    }

    // Detect requires
    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch) {
      result.imports.push(requireMatch[1]);
      result.connections.push({
        source: filePath,
        target: requireMatch[1],
        type: 'require',
        line: lineNumber
      });
    }

    // Detect Python imports: from X import Y
    const pythonFromImport = line.match(/from\s+([a-zA-Z0-9_.]+)\s+import/);
    if (pythonFromImport) {
      result.imports.push(pythonFromImport[1]);
      result.connections.push({
        source: filePath,
        target: pythonFromImport[1],
        type: 'import',
        line: lineNumber
      });
    }

    // Detect Python imports: import X, import X as Y
    const pythonImport = line.match(/^import\s+([a-zA-Z0-9_.]+)/);
    if (pythonImport && !line.includes('from')) {
      result.imports.push(pythonImport[1]);
      result.connections.push({
        source: filePath,
        target: pythonImport[1],
        type: 'import',
        line: lineNumber
      });
    }

    // Detect exports
    if (line.includes('export ')) {
      const exportMatch = line.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/);
      if (exportMatch) {
        result.exports.push(exportMatch[1]);
      }
    }

    // Detect function declarations
    const funcMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:async\s*)?\(|(?:async\s+)?function\s+(\w+)\s*\(/);
    if (funcMatch) {
      result.functions.push({
        name: funcMatch[1] || funcMatch[2],
        line: lineNumber,
        file: filePath,
        type: 'function'
      });
    }

    // Detect API endpoints (Express style)
    const apiMatch = line.match(/(?:router|app)\.(get|post|put|delete|patch)\(['"]([^'"]+)['"]/);
    if (apiMatch) {
      result.apis.push({
        method: apiMatch[1].toUpperCase(),
        path: apiMatch[2],
        file: filePath,
        line: lineNumber,
        type: 'rest'
      });
    }

    // Detect fetch/axios calls
    const fetchMatch = line.match(/(?:fetch|axios)\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (fetchMatch) {
      result.apis.push({
        method: 'GET',
        path: fetchMatch[1],
        file: filePath,
        line: lineNumber,
        type: 'rest'
      });
    }
  }

  return result;
}

function buildConnectionGraph(result: CodeAnalysisResult): void {
  // Build import resolution map - map all files in the repo
  const fileMap = new Map<string, string>();
  const allFilePaths = new Set<string>();

  result.hierarchy.forEach(node => {
    if (node.type === 'file') {
      allFilePaths.add(node.path);
      const baseName = node.path.split('/').pop()?.replace(/\.\w+$/, '') || '';
      fileMap.set(baseName, node.path);
      // Also add the full path
      fileMap.set(node.path, node.path);
    }
  });

  // Resolve relative imports to actual file paths
  result.connections.forEach(conn => {
    if (conn.target.startsWith('./') || conn.target.startsWith('../')) {
      // Resolve relative path
      const sourcePath = conn.source.split('/').slice(0, -1).join('/');
      const targetParts = conn.target.split('/');
      const resolved = resolvePath(sourcePath, targetParts);

      if (fileMap.has(resolved)) {
        conn.target = fileMap.get(resolved)!;
      }
    } else if (!conn.target.includes('/')) {
      // Could be a local module
      if (fileMap.has(conn.target)) {
        conn.target = fileMap.get(conn.target)!;
      }
    }
  });

  // Filter out external library imports - only keep connections where both source and target are in the repo
  result.connections = result.connections.filter(conn => {
    const sourceExists = allFilePaths.has(conn.source);
    const targetExists = allFilePaths.has(conn.target);
    return sourceExists && targetExists;
  });
}

function resolvePath(basePath: string, targetParts: string[]): string {
  const parts = basePath.split('/');

  for (const part of targetParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }

  return parts.join('/').replace(/\.\w+$/, '');
}

export async function detectIntegrations(owner: string, repo: string, branch: string = 'main'): Promise<{
  slack: boolean;
  jira: boolean;
  database: string[];
  apis: string[];
  mcp: string[];
}> {
  try {
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1'
    });

    const integrations = {
      slack: false,
      jira: false,
      database: [] as string[],
      apis: [] as string[],
      mcp: [] as string[]
    };

    // Check package.json for dependencies
    const packageJson = tree.tree.find(item => item.path === 'package.json');
    if (packageJson) {
      const content = await fetchFileContent(owner, repo, 'package.json', branch);
      if (content) {
        const pkg = JSON.parse(content);
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps['@slack/bolt'] || deps['@slack/web-api']) integrations.slack = true;
        if (deps['jira-client'] || deps['jira.js']) integrations.jira = true;

        if (deps['pg'] || deps['postgres']) integrations.database.push('PostgreSQL');
        if (deps['mysql'] || deps['mysql2']) integrations.database.push('MySQL');
        if (deps['mongodb'] || deps['mongoose']) integrations.database.push('MongoDB');
        if (deps['redis']) integrations.database.push('Redis');

        if (deps['axios'] || deps['node-fetch']) integrations.apis.push('HTTP Client');
        if (deps['graphql']) integrations.apis.push('GraphQL');
        if (deps['@anthropic-ai/sdk']) integrations.mcp.push('Anthropic Claude');
        if (deps['openai']) integrations.mcp.push('OpenAI');
      }
    }

    return integrations;
  } catch (error: any) {
    throw new Error(`Failed to detect integrations: ${error.message}`);
  }
}
