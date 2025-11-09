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
