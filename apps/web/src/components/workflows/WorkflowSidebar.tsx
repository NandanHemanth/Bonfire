import { Plus, Workflow as WorkflowIcon, Play, Pause } from 'lucide-react';

interface WorkflowData {
  id: string;
  name: string;
  description?: string;
  nodes: any[];
  edges: any[];
  active: boolean;
}

interface Props {
  workflows: WorkflowData[];
  selectedWorkflow: WorkflowData | null;
  onSelectWorkflow: (workflow: WorkflowData) => void;
  onCreateNew: () => void;
}

export default function WorkflowSidebar({
  workflows,
  selectedWorkflow,
  onSelectWorkflow,
  onCreateNew,
}: Props) {
  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      <div className="px-4 py-4 border-b border-gray-700">
        <button
          onClick={onCreateNew}
          className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded flex items-center justify-center gap-2 transition font-medium"
        >
          <Plus className="w-4 h-4" />
          New Workflow
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <h3 className="text-xs font-semibold text-gray-400 uppercase mb-3">
          Your Workflows ({workflows.length})
        </h3>

        {workflows.length === 0 ? (
          <div className="text-center text-gray-500 py-8 text-sm">
            <WorkflowIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>No workflows yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                onClick={() => onSelectWorkflow(workflow)}
                className={`p-3 rounded-lg cursor-pointer transition border ${
                  selectedWorkflow?.id === workflow.id
                    ? 'bg-orange-600 border-orange-500'
                    : 'bg-gray-700 border-gray-600 hover:border-gray-500'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{workflow.name}</div>
                    {workflow.description && (
                      <div className="text-xs text-gray-300 mt-1 line-clamp-2">
                        {workflow.description}
                      </div>
                    )}
                  </div>
                  {workflow.active ? (
                    <Play className="w-4 h-4 text-green-400 flex-shrink-0 ml-2" />
                  ) : (
                    <Pause className="w-4 h-4 text-gray-400 flex-shrink-0 ml-2" />
                  )}
                </div>

                <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                  <span>{workflow.nodes?.length || 0} nodes</span>
                  <span>{workflow.edges?.length || 0} connections</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
