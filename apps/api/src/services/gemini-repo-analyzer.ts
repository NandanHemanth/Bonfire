import { GoogleGenerativeAI } from '@google/generative-ai';
import { Octokit } from '@octokit/rest';
import fs from 'fs/promises';
import path from 'path';
import dotenv from 'dotenv';
import { generateAllRoleData } from './role-data-generator.js';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

interface FileAnalysis {
  path: string;
  functions: Array<{
    name: string;
    line: number;
    params?: string[];
    description?: string;
  }>;
  imports: string[];
  exports: string[];
  apiCalls: Array<{
    method: string;
    endpoint: string;
    line: number;
    type: string;
  }>;
  linesOfCode: number;
  language: string;
  status: 'new' | 'modified' | 'deleted' | 'unchanged';
}

interface FileConnection {
  source: string;
  target: string;
  type: 'import' | 'export' | 'api_call';
  line?: number;
}

interface RepositoryAnalysis {
  owner: string;
  repo: string;
  branch: string;
  files: FileAnalysis[];
  connections: FileConnection[];
  apiEndpoints: Array<{
    method: string;
    endpoint: string;
    file: string;
    line: number;
    type: string;
  }>;
  timestamp: string;
  commitSha: string;
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalConnections: number;
    totalAPIs: number;
    languages: Record<string, number>;
  };
}

export async function analyzeRepositoryWithGemini(
  owner: string,
  repo: string,
  branch: string = 'main'
): Promise<RepositoryAnalysis> {
  try {
    console.log(`Starting Gemini analysis for ${owner}/${repo}...`);

    // Get repository info and latest commit
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: commits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: 1
    });
    const latestCommit = commits[0];

    // Get repository tree
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1'
    });

    // Get previous commit to detect changes
    const { data: previousCommits } = await octokit.repos.listCommits({
      owner,
      repo,
      sha: branch,
      per_page: 2
    });
    const previousCommit = previousCommits.length > 1 ? previousCommits[1] : null;

    // Get changed files between commits
    const changedFiles = await getChangedFiles(owner, repo, latestCommit.sha, previousCommit?.sha);

    const analysis: RepositoryAnalysis = {
      owner,
      repo,
      branch,
      files: [],
      connections: [],
      apiEndpoints: [],
      timestamp: new Date().toISOString(),
      commitSha: latestCommit.sha,
      stats: {
        totalFiles: 0,
        totalFunctions: 0,
        totalConnections: 0,
        totalAPIs: 0,
        languages: {}
      }
    };

    // Analyze code files (limit to avoid API limits)
    const codeFiles = tree.tree
      .filter(item => item.type === 'blob' && isCodeFile(item.path || ''))
      .slice(0, 100); // Analyze up to 100 files

    console.log(`Analyzing ${codeFiles.length} files...`);

    for (const file of codeFiles) {
      try {
        const filePath = file.path || '';
        const content = await fetchFileContent(owner, repo, filePath, branch);

        if (content) {
          // Determine file status
          const fileStatus = getFileStatus(filePath, changedFiles);

          // Analyze file with Gemini
          const fileAnalysis = await analyzeFileWithGemini(filePath, content, fileStatus);
          analysis.files.push(fileAnalysis);

          // Collect connections
          fileAnalysis.imports.forEach(imp => {
            analysis.connections.push({
              source: filePath,
              target: imp,
              type: 'import'
            });
          });

          // Collect API endpoints
          analysis.apiEndpoints.push(...fileAnalysis.apiCalls.map(api => ({
            ...api,
            file: filePath
          })));

          // Update stats
          analysis.stats.totalFiles++;
          analysis.stats.totalFunctions += fileAnalysis.functions.length;
          analysis.stats.totalAPIs += fileAnalysis.apiCalls.length;

          const lang = fileAnalysis.language;
          analysis.stats.languages[lang] = (analysis.stats.languages[lang] || 0) + 1;
        }
      } catch (error) {
        console.error(`Failed to analyze ${file.path}:`, error);
      }
    }

    analysis.stats.totalConnections = analysis.connections.length;

    // Generate role-based data
    console.log('Generating role-based data...');
    const filePaths = analysis.files.map(f => f.path);
    const roleData = await generateAllRoleData(owner, repo, filePaths);

    // Save analysis as JSON with role data
    const fullAnalysis = {
      ...analysis,
      ...roleData
    };
    await saveAnalysisJSON(owner, repo, fullAnalysis);

    console.log(`Analysis complete for ${owner}/${repo}`);
    return fullAnalysis;
  } catch (error: any) {
    console.error('Gemini analysis error:', error);
    throw new Error(`Failed to analyze repository with Gemini: ${error.message}`);
  }
}

async function analyzeFileWithGemini(
  filePath: string,
  content: string,
  status: 'new' | 'modified' | 'deleted' | 'unchanged'
): Promise<FileAnalysis> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this code file and extract structured information.

File: ${filePath}
Code:
\`\`\`
${content.slice(0, 5000)} ${content.length > 5000 ? '...(truncated)' : ''}
\`\`\`

Extract and return ONLY a valid JSON object with this structure:
{
  "functions": [{"name": "functionName", "line": 1, "params": ["param1"], "description": "brief description"}],
  "imports": ["module1", "module2"],
  "exports": ["export1", "export2"],
  "apiCalls": [{"method": "GET", "endpoint": "/api/path", "line": 10, "type": "rest"}],
  "language": "JavaScript|TypeScript|Python|etc"
}

Rules:
- Only include internal file imports (relative paths like ./file or ../dir/file)
- For apiCalls, only include explicit HTTP calls (fetch, axios, requests, etc.)
- Return valid JSON only, no markdown or explanation`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (Gemini sometimes wraps it in markdown)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/, '').replace(/\n?```$/, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/, '').replace(/\n?```$/, '');
    }

    const parsed = JSON.parse(jsonText);

    return {
      path: filePath,
      functions: parsed.functions || [],
      imports: parsed.imports || [],
      exports: parsed.exports || [],
      apiCalls: parsed.apiCalls || [],
      linesOfCode: content.split('\n').length,
      language: parsed.language || detectLanguage(filePath),
      status
    };
  } catch (error) {
    console.error(`Gemini analysis failed for ${filePath}, using regex fallback:`, error);
    // Fallback to regex-based analysis
    return analyzeFileWithRegex(filePath, content, status);
  }
}

function analyzeFileWithRegex(
  filePath: string,
  content: string,
  status: 'new' | 'modified' | 'deleted' | 'unchanged'
): FileAnalysis {
  const lines = content.split('\n');
  const functions: any[] = [];
  const imports: string[] = [];
  const exports: string[] = [];
  const apiCalls: any[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lineNumber = i + 1;

    // Detect imports
    const importMatch = line.match(/import\s+.*from\s+['"]([^'"]+)['"]/);
    if (importMatch && (importMatch[1].startsWith('./') || importMatch[1].startsWith('../'))) {
      imports.push(importMatch[1]);
    }

    const requireMatch = line.match(/require\(['"]([^'"]+)['"]\)/);
    if (requireMatch && (requireMatch[1].startsWith('./') || requireMatch[1].startsWith('../'))) {
      imports.push(requireMatch[1]);
    }

    // Detect exports
    const exportMatch = line.match(/export\s+(?:default\s+)?(?:function|class|const|let|var)\s+(\w+)/);
    if (exportMatch) {
      exports.push(exportMatch[1]);
    }

    // Detect functions
    const funcMatch = line.match(/(?:function|const|let|var)\s+(\w+)\s*=?\s*(?:async\s*)?\(/);
    if (funcMatch) {
      functions.push({
        name: funcMatch[1],
        line: lineNumber,
        params: []
      });
    }

    // Detect API calls
    const fetchMatch = line.match(/(?:fetch|axios\.(?:get|post|put|delete))\s*\(\s*['"`]([^'"`]+)['"`]/);
    if (fetchMatch) {
      apiCalls.push({
        method: 'GET',
        endpoint: fetchMatch[1],
        line: lineNumber,
        type: 'rest'
      });
    }
  }

  return {
    path: filePath,
    functions,
    imports,
    exports,
    apiCalls,
    linesOfCode: lines.length,
    language: detectLanguage(filePath),
    status
  };
}

async function getChangedFiles(
  owner: string,
  repo: string,
  currentSha: string,
  previousSha?: string | null
): Promise<Map<string, 'new' | 'modified' | 'deleted'>> {
  const changedFiles = new Map<string, 'new' | 'modified' | 'deleted'>();

  if (!previousSha) {
    return changedFiles; // All files are "unchanged" if no previous commit
  }

  try {
    const { data: comparison } = await octokit.repos.compareCommits({
      owner,
      repo,
      base: previousSha,
      head: currentSha
    });

    comparison.files?.forEach(file => {
      if (file.status === 'added') {
        changedFiles.set(file.filename, 'new');
      } else if (file.status === 'modified') {
        changedFiles.set(file.filename, 'modified');
      } else if (file.status === 'removed') {
        changedFiles.set(file.filename, 'deleted');
      }
    });
  } catch (error) {
    console.error('Failed to get changed files:', error);
  }

  return changedFiles;
}

function getFileStatus(
  filePath: string,
  changedFiles: Map<string, 'new' | 'modified' | 'deleted'>
): 'new' | 'modified' | 'deleted' | 'unchanged' {
  return changedFiles.get(filePath) || 'unchanged';
}

async function fetchFileContent(
  owner: string,
  repo: string,
  path: string,
  branch: string
): Promise<string | null> {
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

function isCodeFile(path: string): boolean {
  const codeExtensions = [
    '.js', '.ts', '.tsx', '.jsx',
    '.py', '.java', '.go', '.rs',
    '.cpp', '.c', '.rb', '.php',
    '.cs', '.swift', '.kt'
  ];
  return codeExtensions.some(ext => path.endsWith(ext));
}

function detectLanguage(filePath: string): string {
  const ext = filePath.split('.').pop()?.toLowerCase();
  const langMap: Record<string, string> = {
    js: 'JavaScript',
    ts: 'TypeScript',
    tsx: 'TypeScript',
    jsx: 'JavaScript',
    py: 'Python',
    java: 'Java',
    go: 'Go',
    rs: 'Rust',
    cpp: 'C++',
    c: 'C',
    rb: 'Ruby',
    php: 'PHP',
    cs: 'C#',
    swift: 'Swift',
    kt: 'Kotlin'
  };
  return langMap[ext || ''] || 'Unknown';
}

async function saveAnalysisJSON(
  owner: string,
  repo: string,
  analysis: RepositoryAnalysis
): Promise<void> {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'analysis');
    await fs.mkdir(dataDir, { recursive: true });

    const filename = `${owner}_${repo}_${Date.now()}.json`;
    const filepath = path.join(dataDir, filename);

    await fs.writeFile(filepath, JSON.stringify(analysis, null, 2), 'utf-8');
    console.log(`Analysis saved to ${filepath}`);

    // Also save as "latest"
    const latestPath = path.join(dataDir, `${owner}_${repo}_latest.json`);
    await fs.writeFile(latestPath, JSON.stringify(analysis, null, 2), 'utf-8');
  } catch (error) {
    console.error('Failed to save analysis JSON:', error);
  }
}

export async function loadLatestAnalysis(
  owner: string,
  repo: string
): Promise<RepositoryAnalysis | null> {
  try {
    const dataDir = path.join(process.cwd(), 'data', 'analysis');
    const latestPath = path.join(dataDir, `${owner}_${repo}_latest.json`);

    const content = await fs.readFile(latestPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}
