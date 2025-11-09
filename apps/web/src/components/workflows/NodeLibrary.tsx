import { X } from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  icon: string;
  color: string;
  category: string;
}

const nodeTypes: NodeType[] = [
  // Communication
  { type: 'slack', label: 'Slack', icon: 'slack', color: '#4A154B', category: 'Communication' },
  { type: 'email', label: 'Email', icon: 'email', color: '#EA4335', category: 'Communication' },
  { type: 'teams', label: 'MS Teams', icon: 'slack', color: '#6264A7', category: 'Communication' },

  // Project Management
  { type: 'jira', label: 'Jira', icon: 'jira', color: '#0052CC', category: 'Project Management' },
  { type: 'asana', label: 'Asana', icon: 'jira', color: '#F06A6A', category: 'Project Management' },
  { type: 'trello', label: 'Trello', icon: 'jira', color: '#0079BF', category: 'Project Management' },

  // Microsoft Suite
  { type: 'outlook', label: 'Outlook', icon: 'email', color: '#0078D4', category: 'Microsoft 365' },
  {
    type: 'calendar',
    label: 'Calendar',
    icon: 'calendar',
    color: '#0078D4',
    category: 'Microsoft 365',
  },
  {
    type: 'onedrive',
    label: 'OneDrive',
    icon: 'cloud',
    color: '#0078D4',
    category: 'Microsoft 365',
  },
  { type: 'excel', label: 'Excel', icon: 'file', color: '#217346', category: 'Microsoft 365' },
  {
    type: 'sharepoint',
    label: 'SharePoint',
    icon: 'file',
    color: '#038387',
    category: 'Microsoft 365',
  },

  // Development
  { type: 'github', label: 'GitHub', icon: 'code', color: '#181717', category: 'Development' },
  { type: 'gitlab', label: 'GitLab', icon: 'code', color: '#FC6D26', category: 'Development' },
  { type: 'jenkins', label: 'Jenkins', icon: 'settings', color: '#D24939', category: 'Development' },

  // Data & Storage
  {
    type: 'database',
    label: 'Database',
    icon: 'database',
    color: '#336791',
    category: 'Data & Storage',
  },
  {
    type: 'aws-s3',
    label: 'AWS S3',
    icon: 'cloud',
    color: '#FF9900',
    category: 'Data & Storage',
  },
  {
    type: 'google-drive',
    label: 'Google Drive',
    icon: 'cloud',
    color: '#4285F4',
    category: 'Data & Storage',
  },

  // Actions
  { type: 'webhook', label: 'Webhook', icon: 'webhook', color: '#6366F1', category: 'Actions' },
  { type: 'api-call', label: 'API Call', icon: 'action', color: '#8B5CF6', category: 'Actions' },
  { type: 'condition', label: 'Condition', icon: 'branch', color: '#F59E0B', category: 'Actions' },
  { type: 'code', label: 'Run Code', icon: 'code', color: '#10B981', category: 'Actions' },

  // Roles
  { type: 'developer', label: 'Developer', icon: 'user', color: '#3B82F6', category: 'Roles' },
  { type: 'pm', label: 'PM', icon: 'user', color: '#8B5CF6', category: 'Roles' },
  { type: 'finance', label: 'Finance', icon: 'user', color: '#10B981', category: 'Roles' },
  { type: 'hr', label: 'HR', icon: 'user', color: '#F59E0B', category: 'Roles' },
  { type: 'devops', label: 'DevOps', icon: 'user', color: '#EF4444', category: 'Roles' },
];

interface Props {
  onToggle: () => void;
}

export default function NodeLibrary({ onToggle }: Props) {
  const onDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType.type);
    event.dataTransfer.setData('label', nodeType.label);
    event.dataTransfer.setData('icon', nodeType.icon);
    event.dataTransfer.setData('color', nodeType.color);
    event.dataTransfer.effectAllowed = 'move';
  };

  const categories = Array.from(new Set(nodeTypes.map((n) => n.category)));

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-80 max-h-[600px] overflow-hidden flex flex-col">
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <h3 className="font-semibold text-white">Node Library</h3>
        <button
          onClick={onToggle}
          className="p-1 hover:bg-gray-700 rounded transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {categories.map((category) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-gray-400 uppercase mb-2">{category}</h4>
            <div className="grid grid-cols-2 gap-2">
              {nodeTypes
                .filter((n) => n.category === category)
                .map((nodeType) => (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={(e) => onDragStart(e, nodeType)}
                    className="px-3 py-2 rounded border border-gray-600 cursor-move hover:border-orange-500 transition text-center"
                    style={{
                      backgroundColor: nodeType.color + '20',
                      borderLeftWidth: '3px',
                      borderLeftColor: nodeType.color,
                    }}
                  >
                    <div className="text-xs font-medium text-white">{nodeType.label}</div>
                  </div>
                ))}
            </div>
          </div>
        ))}
      </div>

      <div className="px-4 py-3 border-t border-gray-700 bg-gray-850">
        <p className="text-xs text-gray-400">Drag nodes to the canvas to build your workflow</p>
      </div>
    </div>
  );
}
