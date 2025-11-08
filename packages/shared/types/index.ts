// Core repository types
export interface Repository {
  owner: string;
  name: string;
  branch: string;
  structure: FileNode[];
  metadata: RepoMetadata;
}

export interface FileNode {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  children?: FileNode[];
  metadata?: FileMetadata;
}

export interface RepoMetadata {
  stars: number;
  forks: number;
  language: string;
  lastUpdated: string;
  contributors: number;
}

export interface FileMetadata {
  language: string;
  loc: number;
  complexity: number;
  dependencies: string[];
  exports: string[];
  owner?: string;
  team?: string;
}

// 3D Visualization types
export interface Node3D {
  id: string;
  position: [number, number, number];
  size: number;
  color: string;
  label: string;
  type: 'file' | 'directory' | 'function' | 'service';
  metadata?: any;
}

export interface Connection3D {
  source: string;
  target: string;
  type: 'import' | 'call' | 'api' | 'data-flow';
  strength: number;
  color: string;
}

export interface Visualization {
  nodes: Node3D[];
  connections: Connection3D[];
  metadata: {
    totalNodes: number;
    totalConnections: number;
    complexity: number;
  };
}

// Role-based view types
export type UserRole = 'developer' | 'finance' | 'hr' | 'pm' | 'devops';

export interface ViewConfig {
  role: UserRole;
  colorScheme: 'cost' | 'team' | 'complexity' | 'health';
  showConnections: boolean;
  filters: ViewFilters;
}

export interface ViewFilters {
  minComplexity?: number;
  maxCost?: number;
  teams?: string[];
  languages?: string[];
}

// Data analysis types
export interface DataAnalysis {
  columns: ColumnInfo[];
  statistics: Statistics;
  correlations: Correlation[];
  insights: Insight[];
  recommendations: string[];
}

export interface ColumnInfo {
  name: string;
  type: 'numeric' | 'categorical' | 'datetime' | 'text';
  role: 'independent' | 'dependent' | 'identifier';
  uniqueValues: number;
  nullCount: number;
}

export interface Statistics {
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  mode?: any;
}

export interface Correlation {
  variable1: string;
  variable2: string;
  coefficient: number;
  strength: 'weak' | 'moderate' | 'strong';
  direction: 'positive' | 'negative';
}

export interface Insight {
  type: 'correlation' | 'outlier' | 'trend' | 'pattern';
  message: string;
  confidence: number;
  actionable: boolean;
}

// MCP types
export interface MCPAction {
  server: 'finance' | 'hr' | 'cicd' | 'security';
  action: string;
  params: Record<string, any>;
}

export interface MCPResult {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
}

// Cost analysis types
export interface CostAnalysis {
  service: string;
  breakdown: CostBreakdown;
  total: number;
  trend: 'increasing' | 'stable' | 'decreasing';
  budget: BudgetInfo;
}

export interface CostBreakdown {
  compute: number;
  storage: number;
  network: number;
  database: number;
  other: number;
}

export interface BudgetInfo {
  monthly: number;
  current: number;
  remaining: number;
  percentUsed: number;
}

// Team and ownership types
export interface TeamInfo {
  name: string;
  members: TeamMember[];
  capacity: number;
  currentLoad: number;
  services: string[];
}

export interface TeamMember {
  name: string;
  email: string;
  role: string;
  capacity: number;
  currentAssignments: number;
}

// Deployment types
export interface Deployment {
  id: string;
  service: string;
  environment: 'development' | 'staging' | 'production';
  version: string;
  status: 'pending' | 'in_progress' | 'success' | 'failed';
  startedAt: string;
  completedAt?: string;
  triggeredBy: string;
}
