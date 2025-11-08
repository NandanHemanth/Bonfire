import { useState, useEffect } from 'react';

interface Integration {
  id: string;
  type: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
}

interface WorkflowNode {
  id: string;
  type: string;
  name: string;
  position: { x: number; y: number; z: number };
  connections: string[];
}

interface Workflow {
  id: string;
  name: string;
  description?: string;
  nodes: WorkflowNode[];
  integrations: Integration[];
  active: boolean;
}

export default function WorkflowBuilder() {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showNewWorkflow, setShowNewWorkflow] = useState(false);
  const [showAddIntegration, setShowAddIntegration] = useState(false);
  const [presetIntegrations, setPresetIntegrations] = useState<any>(null);

  useEffect(() => {
    fetchWorkflows();
    fetchIntegrations();
    fetchPresetIntegrations();
  }, []);

  const fetchWorkflows = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/workflows');
      if (response.ok) {
        const data = await response.json();
        setWorkflows(data);
      }
    } catch (error) {
      console.error('Failed to fetch workflows:', error);
    }
  };

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/integrations');
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to fetch integrations:', error);
    }
  };

  const fetchPresetIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/integrations/presets');
      if (response.ok) {
        const data = await response.json();
        setPresetIntegrations(data);
      }
    } catch (error) {
      console.error('Failed to fetch preset integrations:', error);
    }
  };

  const createWorkflow = async (name: string, description: string) => {
    try {
      const response = await fetch('http://localhost:3001/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description })
      });

      if (response.ok) {
        const workflow = await response.json();
        setWorkflows([...workflows, workflow]);
        setShowNewWorkflow(false);
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
    }
  };

  const createIntegration = async (type: string, name: string, config: any) => {
    try {
      const response = await fetch('http://localhost:3001/api/integrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, config })
      });

      if (response.ok) {
        const integration = await response.json();
        setIntegrations([...integrations, integration]);
        setShowAddIntegration(false);
      }
    } catch (error) {
      console.error('Failed to create integration:', error);
    }
  };

  const testIntegration = async (integrationId: string) => {
    try {
      const response = await fetch(`http://localhost:3001/api/integrations/${integrationId}/test`, {
        method: 'POST'
      });

      if (response.ok) {
        const result = await response.json();
        alert(result.success ? 'Connection successful!' : 'Connection failed!');
        fetchIntegrations(); // Refresh
      }
    } catch (error) {
      console.error('Failed to test integration:', error);
    }
  };

  return (
    <div className="p-8 h-screen flex flex-col bg-gray-900 text-white">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Workflow Builder</h1>
        <p className="text-gray-400">Create n8n-style automation workflows</p>
      </div>

      <div className="grid grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Workflows Section */}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Workflows</h2>
            <button
              onClick={() => setShowNewWorkflow(true)}
              className="px-3 py-1 bg-orange-600 hover:bg-orange-700 rounded text-sm transition"
            >
              + New
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {workflows.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No workflows yet. Create one to get started!
              </div>
            ) : (
              workflows.map(workflow => (
                <div
                  key={workflow.id}
                  onClick={() => setSelectedWorkflow(workflow)}
                  className={`p-3 rounded cursor-pointer transition ${
                    selectedWorkflow?.id === workflow.id
                      ? 'bg-orange-600'
                      : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="font-semibold">{workflow.name}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {workflow.nodes.length} nodes
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Integrations Section */}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Integrations</h2>
            <button
              onClick={() => setShowAddIntegration(true)}
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded text-sm transition"
            >
              + Add
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {integrations.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No integrations configured
              </div>
            ) : (
              integrations.map(integration => (
                <div
                  key={integration.id}
                  className="p-3 rounded bg-gray-700"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold">{integration.name}</div>
                      <div className="text-xs text-gray-400 mt-1 capitalize">
                        {integration.type}
                      </div>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        integration.status === 'connected'
                          ? 'bg-green-600'
                          : integration.status === 'error'
                          ? 'bg-red-600'
                          : 'bg-gray-600'
                      }`}
                    >
                      {integration.status}
                    </span>
                  </div>
                  <button
                    onClick={() => testIntegration(integration.id)}
                    className="mt-2 text-xs text-blue-400 hover:text-blue-300"
                  >
                    Test Connection
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Preset Integrations */}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-4">Available Integrations</h2>

          <div className="flex-1 overflow-y-auto space-y-2">
            {presetIntegrations &&
              Object.entries(presetIntegrations).map(([key, preset]: [string, any]) => (
                <div key={key} className="p-3 rounded bg-gray-700">
                  <div className="font-semibold">{preset.name}</div>
                  <div className="text-xs text-gray-400 mt-1">{preset.description}</div>
                  <button className="mt-2 text-xs text-orange-400 hover:text-orange-300">
                    Configure
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* New Workflow Modal */}
      {showNewWorkflow && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-6 w-96">
            <h3 className="text-xl font-semibold mb-4">Create New Workflow</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createWorkflow(
                  formData.get('name') as string,
                  formData.get('description') as string
                );
              }}
            >
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Workflow Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                    placeholder="My Automation"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:outline-none focus:border-orange-500"
                    placeholder="What does this workflow do?"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowNewWorkflow(false)}
                  className="px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
