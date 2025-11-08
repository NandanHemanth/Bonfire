import { memo } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import {
  MessageSquare,
  CheckSquare,
  Mail,
  Calendar,
  FileText,
  Database,
  Cloud,
  Zap,
  Code,
  GitBranch,
  Webhook,
  Settings,
} from 'lucide-react';

const iconMap: Record<string, any> = {
  slack: MessageSquare,
  jira: CheckSquare,
  email: Mail,
  calendar: Calendar,
  file: FileText,
  database: Database,
  cloud: Cloud,
  action: Zap,
  code: Code,
  branch: GitBranch,
  webhook: Webhook,
  settings: Settings,
};

const WorkflowNode = ({ data, selected }: NodeProps) => {
  const Icon = iconMap[data.icon] || Settings;
  const bgColor = data.color || 'bg-indigo-600';

  return (
    <div
      className={`px-4 py-3 rounded-lg border-2 min-w-[150px] transition-all ${
        selected ? 'border-orange-500 shadow-lg' : 'border-gray-600'
      }`}
      style={{
        backgroundColor: data.color || '#4f46e5',
      }}
    >
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-400" />

      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5 text-white" />
        <div className="text-white font-medium text-sm">{data.label}</div>
      </div>

      {data.description && (
        <div className="text-xs text-gray-200 mt-1">{data.description}</div>
      )}

      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-400" />
    </div>
  );
};

export default memo(WorkflowNode);
