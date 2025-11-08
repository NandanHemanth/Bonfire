interface WorkflowNode {
  id: string;
  type: 'trigger' | 'action' | 'integration' | 'code' | 'api';
  name: string;
  config: Record<string, any>;
  position: { x: number; y: number; z: number };
  connections: string[]; // IDs of connected nodes
}

interface Integration {
  id: string;
  type: 'slack' | 'jira' | 'github' | 'database' | 'mcp' | 'custom_api';
  name: string;
  config: IntegrationConfig;
  status: 'connected' | 'disconnected' | 'error';
  credentials?: Record<string, string>;
}

interface IntegrationConfig {
  slack?: {
    webhookUrl?: string;
    token?: string;
    channel?: string;
  };
  jira?: {
    baseUrl?: string;
    email?: string;
    apiToken?: string;
    project?: string;
  };
  github?: {
    token?: string;
    owner?: string;
    repo?: string;
  };
  database?: {
    type: 'postgres' | 'mysql' | 'mongodb' | 'redis';
    host: string;
    port: number;
    database: string;
    username?: string;
    password?: string;
  };
  mcp?: {
    provider: 'anthropic' | 'openai' | 'gemini';
    apiKey: string;
    model?: string;
  };
  custom_api?: {
    baseUrl: string;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    headers?: Record<string, string>;
    auth?: {
      type: 'bearer' | 'basic' | 'api_key';
      token?: string;
      username?: string;
      password?: string;
    };
  };
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  integrations: Integration[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

// In-memory storage (replace with database in production)
const workflows = new Map<string, Workflow>();
const integrations = new Map<string, Integration>();

export function createWorkflow(name: string, description?: string): Workflow {
  const workflow: Workflow = {
    id: generateId(),
    name,
    description,
    nodes: [],
    integrations: [],
    active: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  workflows.set(workflow.id, workflow);
  return workflow;
}

export function addNodeToWorkflow(workflowId: string, node: Omit<WorkflowNode, 'id'>): WorkflowNode {
  const workflow = workflows.get(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const newNode: WorkflowNode = {
    ...node,
    id: generateId()
  };

  workflow.nodes.push(newNode);
  workflow.updatedAt = new Date().toISOString();

  return newNode;
}

export function connectNodes(workflowId: string, sourceNodeId: string, targetNodeId: string): void {
  const workflow = workflows.get(workflowId);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  const sourceNode = workflow.nodes.find(n => n.id === sourceNodeId);
  if (!sourceNode) {
    throw new Error('Source node not found');
  }

  if (!sourceNode.connections.includes(targetNodeId)) {
    sourceNode.connections.push(targetNodeId);
    workflow.updatedAt = new Date().toISOString();
  }
}

export function createIntegration(integration: Omit<Integration, 'id' | 'status'>): Integration {
  const newIntegration: Integration = {
    ...integration,
    id: generateId(),
    status: 'disconnected'
  };

  integrations.set(newIntegration.id, newIntegration);
  return newIntegration;
}

export async function testIntegration(integrationId: string): Promise<boolean> {
  const integration = integrations.get(integrationId);
  if (!integration) {
    throw new Error('Integration not found');
  }

  try {
    switch (integration.type) {
      case 'slack':
        return await testSlackIntegration(integration.config.slack);
      case 'jira':
        return await testJiraIntegration(integration.config.jira);
      case 'github':
        return await testGitHubIntegration(integration.config.github);
      case 'database':
        return await testDatabaseIntegration(integration.config.database);
      case 'mcp':
        return await testMCPIntegration(integration.config.mcp);
      case 'custom_api':
        return await testCustomAPIIntegration(integration.config.custom_api);
      default:
        return false;
    }
  } catch (error) {
    integration.status = 'error';
    return false;
  }
}

async function testSlackIntegration(config?: IntegrationConfig['slack']): Promise<boolean> {
  if (!config?.webhookUrl && !config?.token) {
    return false;
  }

  try {
    if (config.webhookUrl) {
      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'BonFire connection test' })
      });
      return response.ok;
    }
    return true;
  } catch {
    return false;
  }
}

async function testJiraIntegration(config?: IntegrationConfig['jira']): Promise<boolean> {
  if (!config?.baseUrl || !config?.email || !config?.apiToken) {
    return false;
  }

  try {
    const auth = Buffer.from(`${config.email}:${config.apiToken}`).toString('base64');
    const response = await fetch(`${config.baseUrl}/rest/api/3/myself`, {
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testGitHubIntegration(config?: IntegrationConfig['github']): Promise<boolean> {
  if (!config?.token) {
    return false;
  }

  try {
    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `token ${config.token}`,
        'User-Agent': 'BonFire'
      }
    });
    return response.ok;
  } catch {
    return false;
  }
}

async function testDatabaseIntegration(config?: IntegrationConfig['database']): Promise<boolean> {
  // Placeholder - actual implementation would use database drivers
  return config !== undefined;
}

async function testMCPIntegration(config?: IntegrationConfig['mcp']): Promise<boolean> {
  if (!config?.apiKey) {
    return false;
  }

  // Placeholder for MCP testing
  return true;
}

async function testCustomAPIIntegration(config?: IntegrationConfig['custom_api']): Promise<boolean> {
  if (!config?.baseUrl) {
    return false;
  }

  try {
    const headers: Record<string, string> = {
      ...config.headers
    };

    if (config.auth?.type === 'bearer' && config.auth.token) {
      headers['Authorization'] = `Bearer ${config.auth.token}`;
    } else if (config.auth?.type === 'api_key' && config.auth.token) {
      headers['X-API-Key'] = config.auth.token;
    }

    const response = await fetch(config.baseUrl, {
      method: config.method || 'GET',
      headers
    });

    return response.ok;
  } catch {
    return false;
  }
}

export function getWorkflow(id: string): Workflow | undefined {
  return workflows.get(id);
}

export function getAllWorkflows(): Workflow[] {
  return Array.from(workflows.values());
}

export function getIntegration(id: string): Integration | undefined {
  return integrations.get(id);
}

export function getAllIntegrations(): Integration[] {
  return Array.from(integrations.values());
}

export function deleteWorkflow(id: string): boolean {
  return workflows.delete(id);
}

export function deleteIntegration(id: string): boolean {
  return integrations.delete(id);
}

export function updateWorkflow(id: string, updates: Partial<Workflow>): Workflow | undefined {
  const workflow = workflows.get(id);
  if (!workflow) {
    return undefined;
  }

  const updated = {
    ...workflow,
    ...updates,
    id: workflow.id, // Preserve ID
    updatedAt: new Date().toISOString()
  };

  workflows.set(id, updated);
  return updated;
}

export async function executeWorkflow(id: string): Promise<any> {
  const workflow = workflows.get(id);
  if (!workflow) {
    throw new Error('Workflow not found');
  }

  // Basic workflow execution logic
  // In a real implementation, this would process nodes in order
  const results: any[] = [];

  for (const node of workflow.nodes) {
    try {
      const result = await executeNode(node, workflow);
      results.push({
        nodeId: node.id,
        success: true,
        result
      });
    } catch (error: any) {
      results.push({
        nodeId: node.id,
        success: false,
        error: error.message
      });
      // Stop execution on error (you could make this configurable)
      break;
    }
  }

  return {
    workflowId: id,
    executedAt: new Date().toISOString(),
    results
  };
}

async function executeNode(node: WorkflowNode, workflow: Workflow): Promise<any> {
  // This is a simplified execution logic
  // In a real implementation, you'd have specific handlers for each node type

  switch (node.type) {
    case 'trigger':
      return { message: 'Workflow triggered' };

    case 'action':
      return { message: 'Action executed', config: node.config };

    case 'integration':
      // Find the integration config from workflow
      const integration = workflow.integrations.find(i => i.id === node.config.integrationId);
      if (!integration) {
        throw new Error(`Integration not found: ${node.config.integrationId}`);
      }
      return { message: 'Integration called', integration: integration.type };

    default:
      return { message: 'Node executed', type: node.type };
  }
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Preset integrations for quick setup
export const presetIntegrations = {
  slack: {
    name: 'Slack',
    type: 'slack' as const,
    description: 'Send messages and notifications to Slack channels',
    requiredFields: ['webhookUrl', 'channel']
  },
  jira: {
    name: 'Jira',
    type: 'jira' as const,
    description: 'Create and manage Jira issues',
    requiredFields: ['baseUrl', 'email', 'apiToken', 'project']
  },
  github: {
    name: 'GitHub',
    type: 'github' as const,
    description: 'Interact with GitHub repositories',
    requiredFields: ['token']
  },
  postgres: {
    name: 'PostgreSQL',
    type: 'database' as const,
    description: 'Connect to PostgreSQL database',
    requiredFields: ['host', 'port', 'database', 'username', 'password']
  },
  anthropic: {
    name: 'Anthropic Claude (MCP)',
    type: 'mcp' as const,
    description: 'AI-powered automation with Claude',
    requiredFields: ['apiKey']
  }
};
