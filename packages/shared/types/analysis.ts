// Shared types for code analysis

export interface FileStatus {
  path: string;
  status: 'new' | 'modified' | 'deleted' | 'unchanged';
  lastModified?: string;
  size?: number;
}

export interface FunctionInfo {
  name: string;
  line: number;
  endLine?: number;
  params?: string[];
  returnType?: string;
  async?: boolean;
}

export interface APIConnection {
  method: string;
  endpoint: string;
  file: string;
  line: number;
  type: 'internal' | 'external' | 'graphql' | 'rest' | 'websocket';
  description?: string;
}

export interface FileConnection {
  source: string;
  target: string;
  type: 'import' | 'export' | 'requires' | 'api_call';
  line?: number;
}

export interface FileAnalysis {
  path: string;
  functions: FunctionInfo[];
  imports: string[];
  exports: string[];
  apiCalls: APIConnection[];
  linesOfCode: number;
  language: string;
  status: 'new' | 'modified' | 'deleted' | 'unchanged';
}

export interface RepositoryAnalysis {
  owner: string;
  repo: string;
  branch: string;
  files: FileAnalysis[];
  connections: FileConnection[];
  apiEndpoints: APIConnection[];
  timestamp: string;
  commitSha?: string;
  stats: {
    totalFiles: number;
    totalFunctions: number;
    totalConnections: number;
    totalAPIs: number;
    languages: Record<string, number>;
  };
}

export interface SyncStatus {
  repoId: string;
  owner: string;
  repo: string;
  status: 'idle' | 'syncing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  lastSync?: string;
  error?: string;
}

// Role-specific data types

// Finance Role
export interface FinanceData {
  budgetAllocation: {
    projectName: string;
    allocated: number;
    used: number;
    currency: string;
  }[];
  fileCosts: Record<string, {
    developmentCost: number;
    maintenanceCost: number;
    resourceHours: number;
  }>;
}

// HR Role
export interface ContributorInfo {
  username: string;
  name: string;
  role: string;
  contributions: number;
  lastContribution?: string;
}

export interface HRData {
  fileContributors: Record<string, ContributorInfo[]>;
  teamMembers: ContributorInfo[];
}

// PM Role
export interface Issue {
  id: number;
  title: string;
  status: 'open' | 'in_progress' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high';
  affectedFiles: string[];
  assignee?: string;
}

export interface PullRequest {
  id: number;
  title: string;
  status: 'open' | 'merged' | 'closed';
  filesChanged: number;
  additions: number;
  deletions: number;
  author: string;
  createdAt: string;
}

export interface SprintData {
  name: string;
  startDate: string;
  endDate: string;
  totalPoints: number;
  completedPoints: number;
  inProgressPoints: number;
  todoPoints: number;
}

export interface PMData {
  issues: Issue[];
  pullRequests: PullRequest[];
  sprints: SprintData[];
  currentSprint?: SprintData;
}

// DevOps Role
export interface TestResult {
  llm: 'gemini' | 'claude' | 'xai';
  filePath: string;
  passed: boolean;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  coverage: number;
  executionTime: number;
  details?: string;
}

export interface DevOpsData {
  testResults: Record<string, TestResult[]>; // filePath -> test results from different LLMs
  cicdStatus: {
    pipeline: string;
    status: 'success' | 'failed' | 'running' | 'pending';
    lastRun: string;
  }[];
}

// Extended Repository Analysis with role-specific data
export interface RoleBasedAnalysis extends RepositoryAnalysis {
  financeData?: FinanceData;
  hrData?: HRData;
  pmData?: PMData;
  devOpsData?: DevOpsData;
}
