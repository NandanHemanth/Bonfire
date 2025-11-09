import { useState, useCallback, useRef, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  NodeChange,
  EdgeChange,
  Connection,
  MiniMap,
  Viewport,
} from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Workflow,
  Plus,
  Sparkles,
  Save,
  Play,
  Trash2,
} from 'lucide-react';

import WorkflowNode from './WorkflowNode';
import GeminiChat from './GeminiChat';
import NodeLibrary from './NodeLibrary';
import WorkflowSidebar from './WorkflowSidebar';
import NodeConfigPanel from './NodeConfigPanel';

const nodeTypes = {
  workflowNode: WorkflowNode,
};

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  active: boolean;
}

export default function CanvasWorkflowBuilder() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [workflows, setWorkflows] = useState<WorkflowData[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowData | null>(null);
  const [showChat, setShowChat] = useState(false);
  const [showNodeLibrary, setShowNodeLibrary] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showNodeConfig, setShowNodeConfig] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [workflowDescription, setWorkflowDescription] = useState('');
  const [workflowRole, setWorkflowRole] = useState<string>('developer');
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  // Fixed viewport - canvas stays in place
  const defaultViewport: Viewport = { x: 0, y: 0, zoom: 1 };

  useEffect(() => {
    fetchWorkflows();
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

  const onNodesChange = useCallback(
    (changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)),
    []
  );

  const onNodeClick = useCallback((_event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
    setShowNodeConfig(true);
  }, []);

  const onNodeConfigSave = useCallback((config: any) => {
    if (!selectedNode) return;

    setNodes((nds) =>
      nds.map((node) =>
        node.id === selectedNode.id
          ? {
              ...node,
              data: {
                ...node.data,
                label: config.name || node.data.label,
                config,
              },
            }
          : node
      )
    );
  }, [selectedNode]);

  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  );

  const onConnect = useCallback(
    (connection: Connection) => setEdges((eds) => addEdge(connection, eds)),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const label = event.dataTransfer.getData('label');
      const icon = event.dataTransfer.getData('icon');
      const nodeColor = event.dataTransfer.getData('color');

      if (!type) {
        return;
      }

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect();
      if (!reactFlowBounds) return;

      const position = {
        x: event.clientX - reactFlowBounds.left - 75,
        y: event.clientY - reactFlowBounds.top - 40,
      };

      const newNode: Node = {
        id: `${type}-${Date.now()}`,
        type: 'workflowNode',
        position,
        data: {
          label,
          icon,
          color: nodeColor,
          nodeType: type,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    []
  );

  const saveWorkflow = async () => {
    if (!selectedWorkflow) {
      // Show save dialog for new workflow
      setShowSaveDialog(true);
      return;
    } else {
      // Update existing workflow
      try {
        const response = await fetch(
          `http://localhost:3001/api/workflows/${selectedWorkflow.id}`,
          {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ...selectedWorkflow,
              nodes,
              edges,
            }),
          }
        );

        if (response.ok) {
          alert('Workflow saved successfully!');
          fetchWorkflows();
        }
      } catch (error) {
        console.error('Failed to save workflow:', error);
        alert('Failed to save workflow');
      }
    }
  };

  const loadWorkflow = (workflow: WorkflowData) => {
    setSelectedWorkflow(workflow);
    setNodes(workflow.nodes || []);
    setEdges(workflow.edges || []);
  };

  const createNewWorkflow = () => {
    setSelectedWorkflow(null);
    setNodes([]);
    setEdges([]);
    setWorkflowName('');
    setWorkflowDescription('');
    setWorkflowRole('developer');
  };

  const handleCreateWorkflow = async () => {
    if (!workflowName.trim()) {
      alert('Please enter a workflow name');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/workflows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: workflowName,
          description: workflowDescription,
          role: workflowRole,
          nodes,
          edges,
        }),
      });

      if (response.ok) {
        const workflow = await response.json();
        setWorkflows([...workflows, workflow]);
        setSelectedWorkflow(workflow);
        setShowSaveDialog(false);
        alert('Workflow created successfully!');
      }
    } catch (error) {
      console.error('Failed to create workflow:', error);
      alert('Failed to create workflow');
    }
  };

  const deleteNode = useCallback(() => {
    setNodes((nds) => nds.filter((node) => !node.selected));
    setEdges((eds) =>
      eds.filter((edge) => {
        const sourceNode = nodes.find((n) => n.id === edge.source);
        const targetNode = nodes.find((n) => n.id === edge.target);
        return sourceNode && targetNode && !sourceNode.selected && !targetNode.selected;
      })
    );
  }, [nodes]);

  const runWorkflow = async () => {
    if (!selectedWorkflow) {
      alert('Please save the workflow first');
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:3001/api/workflows/${selectedWorkflow.id}/execute`,
        {
          method: 'POST',
        }
      );

      if (response.ok) {
        const result = await response.json();
        alert('Workflow executed successfully!');
        console.log('Execution result:', result);
      }
    } catch (error) {
      console.error('Failed to run workflow:', error);
      alert('Failed to run workflow');
    }
  };

  return (
    <div className="flex h-full text-white overflow-hidden">
      {/* Workflow Sidebar */}
      <WorkflowSidebar
        workflows={workflows}
        selectedWorkflow={selectedWorkflow}
        onSelectWorkflow={loadWorkflow}
        onCreateNew={createNewWorkflow}
      />

      {/* Main Canvas Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Toolbar */}
        <div className="bg-black bg-opacity-40 backdrop-blur-lg border-b border-white border-opacity-10 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold flex items-center gap-2">
              <Workflow className="w-6 h-6 text-orange-500" />
              {selectedWorkflow ? selectedWorkflow.name : 'New Workflow'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={saveWorkflow}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/50 hover:scale-105"
            >
              <Save className="w-4 h-4" />
              Save
            </button>
            <button
              onClick={runWorkflow}
              disabled={!selectedWorkflow}
              className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-green-500/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              <Play className="w-4 h-4" />
              Run
            </button>
            <button
              onClick={deleteNode}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-red-500/50 hover:scale-105"
            >
              <Trash2 className="w-4 h-4" />
              Delete Selected
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-all shadow-lg ${
                showChat
                  ? 'bg-purple-600 hover:bg-purple-700 shadow-purple-600/50'
                  : 'bg-purple-500 hover:bg-purple-600 shadow-purple-500/50 hover:scale-105'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
          </div>
        </div>

        {/* Canvas and Chat Container */}
        <div className="flex-1 flex relative overflow-hidden">
          {/* ReactFlow Canvas - White Background */}
          <div ref={reactFlowWrapper} className="flex-1 relative">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              defaultViewport={defaultViewport}
              minZoom={0.5}
              maxZoom={2}
              fitView={false}
              panOnDrag={true}
              zoomOnScroll={true}
              className="bg-white"
            >
              <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#d1d5db" />
              <Controls className="bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg" />
              <MiniMap
                className="bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg shadow-lg"
                nodeColor={(node) => {
                  return node.data.color || '#6366f1';
                }}
              />
            </ReactFlow>

            {/* Node Library (Floating) */}
            {showNodeLibrary && (
              <div className="absolute top-4 left-4 z-10">
                <NodeLibrary onToggle={() => setShowNodeLibrary(false)} />
              </div>
            )}

            {!showNodeLibrary && (
              <button
                onClick={() => setShowNodeLibrary(true)}
                className="absolute top-4 left-4 z-10 p-3 bg-white bg-opacity-90 backdrop-blur-sm border border-gray-300 rounded-lg hover:bg-opacity-100 transition shadow-lg"
              >
                <Plus className="w-5 h-5 text-gray-700" />
              </button>
            )}
          </div>

          {/* Gemini Chat Panel */}
          {showChat && (
            <div className="w-96 border-l border-white border-opacity-10 bg-black bg-opacity-40 backdrop-blur-xl">
              <GeminiChat
                onClose={() => setShowChat(false)}
                onWorkflowGenerated={(generatedNodes, generatedEdges) => {
                  setNodes(generatedNodes);
                  setEdges(generatedEdges);
                }}
              />
            </div>
          )}

          {/* Node Configuration Panel */}
          {showNodeConfig && selectedNode && (
            <NodeConfigPanel
              node={selectedNode}
              onClose={() => setShowNodeConfig(false)}
              onSave={onNodeConfigSave}
            />
          )}
        </div>
      </div>

      {/* Save Workflow Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-black bg-opacity-80 backdrop-blur-xl rounded-2xl p-6 w-[500px] border border-white border-opacity-20 shadow-2xl">
            <h3 className="text-xl font-semibold mb-4 text-white">Save Workflow</h3>

            <div className="space-y-4">
              {/* Workflow Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Workflow Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={workflowName}
                  onChange={(e) => setWorkflowName(e.target.value)}
                  placeholder="e.g., Jira to Slack Notification"
                  className="w-full px-3 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-opacity-20"
                  autoFocus
                />
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Role/Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={workflowRole}
                  onChange={(e) => setWorkflowRole(e.target.value)}
                  className="w-full px-3 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white focus:outline-none focus:border-orange-500 focus:bg-opacity-20"
                >
                  <option value="developer">Developer</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                  <option value="pm">Project Manager</option>
                  <option value="devops">DevOps</option>
                </select>
                <p className="text-xs text-gray-400 mt-1">
                  Select the primary team or role that will use this workflow
                </p>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={workflowDescription}
                  onChange={(e) => setWorkflowDescription(e.target.value)}
                  placeholder="Brief description of what this workflow does..."
                  rows={3}
                  className="w-full px-3 py-2 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-opacity-20"
                />
              </div>

              {/* Workflow Stats */}
              <div className="bg-white bg-opacity-10 backdrop-blur-sm rounded-lg p-3 text-sm border border-white border-opacity-10">
                <div className="flex justify-between mb-1">
                  <span className="text-gray-400">Nodes:</span>
                  <span className="text-white font-medium">{nodes.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Connections:</span>
                  <span className="text-white font-medium">{edges.length}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowSaveDialog(false)}
                className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-lg transition border border-white border-opacity-20"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateWorkflow}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-lg transition shadow-lg shadow-orange-500/50 hover:scale-105"
              >
                Save Workflow
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
