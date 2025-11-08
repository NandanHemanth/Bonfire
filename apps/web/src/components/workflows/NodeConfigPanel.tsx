import { X } from 'lucide-react';
import { useState, useEffect } from 'react';

interface NodeConfig {
  [key: string]: any;
}

interface Props {
  node: any;
  onClose: () => void;
  onSave: (config: NodeConfig) => void;
}

export default function NodeConfigPanel({ node, onClose, onSave }: Props) {
  const [config, setConfig] = useState<NodeConfig>(node?.data?.config || {});

  useEffect(() => {
    setConfig(node?.data?.config || {});
  }, [node]);

  const handleSave = () => {
    onSave(config);
    onClose();
  };

  const renderConfigFields = () => {
    const nodeType = node?.data?.nodeType;

    switch (nodeType) {
      case 'slack':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Channel</label>
              <input
                type="text"
                value={config.channel || ''}
                onChange={(e) => setConfig({ ...config, channel: e.target.value })}
                placeholder="#general"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Message</label>
              <textarea
                value={config.message || ''}
                onChange={(e) => setConfig({ ...config, message: e.target.value })}
                placeholder="Enter message..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </>
        );

      case 'jira':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Project Key</label>
              <input
                type="text"
                value={config.projectKey || ''}
                onChange={(e) => setConfig({ ...config, projectKey: e.target.value })}
                placeholder="PROJ"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Issue Type</label>
              <select
                value={config.issueType || 'Task'}
                onChange={(e) => setConfig({ ...config, issueType: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option>Task</option>
                <option>Bug</option>
                <option>Story</option>
                <option>Epic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Summary</label>
              <input
                type="text"
                value={config.summary || ''}
                onChange={(e) => setConfig({ ...config, summary: e.target.value })}
                placeholder="Issue summary"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <textarea
                value={config.description || ''}
                onChange={(e) => setConfig({ ...config, description: e.target.value })}
                placeholder="Issue description"
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </>
        );

      case 'email':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">To</label>
              <input
                type="email"
                value={config.to || ''}
                onChange={(e) => setConfig({ ...config, to: e.target.value })}
                placeholder="recipient@example.com"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Subject</label>
              <input
                type="text"
                value={config.subject || ''}
                onChange={(e) => setConfig({ ...config, subject: e.target.value })}
                placeholder="Email subject"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Body</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                placeholder="Email body"
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </>
        );

      case 'webhook':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Event Source</label>
              <select
                value={config.source || 'custom'}
                onChange={(e) => setConfig({ ...config, source: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="custom">Custom Event</option>
                <option value="jira">Jira Webhook</option>
                <option value="github">GitHub Webhook</option>
                <option value="slack">Slack Event</option>
                <option value="email">Email Received</option>
                <option value="schedule">Scheduled (Cron)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Trigger Event</label>
              <input
                type="text"
                value={config.event || ''}
                onChange={(e) => setConfig({ ...config, event: e.target.value })}
                placeholder="e.g., issue_created, pr_merged, message_posted"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Event name that triggers this workflow
              </p>
            </div>
            {config.source === 'schedule' && (
              <div>
                <label className="block text-sm font-medium mb-2">Schedule (Cron)</label>
                <input
                  type="text"
                  value={config.schedule || ''}
                  onChange={(e) => setConfig({ ...config, schedule: e.target.value })}
                  placeholder="0 9 * * * (every day at 9 AM)"
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2">Webhook URL (optional)</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://your-webhook-url.com"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
          </>
        );

      case 'condition':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Condition Type</label>
              <select
                value={config.type || 'if'}
                onChange={(e) => setConfig({ ...config, type: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="if">If (simple condition)</option>
                <option value="switch">Switch (multiple branches)</option>
                <option value="exists">Check if exists</option>
                <option value="regex">Regex match</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Field to Check</label>
              <input
                type="text"
                value={config.field || ''}
                onChange={(e) => setConfig({ ...config, field: e.target.value })}
                placeholder="e.g., priority, status, assignee"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
              <p className="text-xs text-gray-400 mt-1">
                Use dot notation for nested fields: data.issue.priority
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Operator</label>
              <select
                value={config.operator || 'equals'}
                onChange={(e) => setConfig({ ...config, operator: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="equals">Equals (==)</option>
                <option value="not_equals">Not Equals (!=)</option>
                <option value="contains">Contains</option>
                <option value="not_contains">Does Not Contain</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="greater_than">Greater Than (&gt;)</option>
                <option value="less_than">Less Than (&lt;)</option>
                <option value="greater_or_equal">Greater or Equal (&gt;=)</option>
                <option value="less_or_equal">Less or Equal (&lt;=)</option>
                <option value="in_array">In Array</option>
                <option value="is_empty">Is Empty</option>
                <option value="is_not_empty">Is Not Empty</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Value to Compare</label>
              <input
                type="text"
                value={config.value || ''}
                onChange={(e) => setConfig({ ...config, value: e.target.value })}
                placeholder="e.g., Critical, High, 10"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div className="bg-blue-900/30 border border-blue-700 rounded p-3 text-xs">
              <div className="font-semibold text-blue-300 mb-1">Condition Logic</div>
              <div className="text-gray-300">
                True path: Connect to nodes that run when condition is TRUE
                <br />
                False path: Connect to nodes that run when condition is FALSE
              </div>
            </div>
          </>
        );

      case 'api-call':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Method</label>
              <select
                value={config.method || 'GET'}
                onChange={(e) => setConfig({ ...config, method: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option>GET</option>
                <option>POST</option>
                <option>PUT</option>
                <option>DELETE</option>
                <option>PATCH</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">URL</label>
              <input
                type="url"
                value={config.url || ''}
                onChange={(e) => setConfig({ ...config, url: e.target.value })}
                placeholder="https://api.example.com/endpoint"
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Body (JSON)</label>
              <textarea
                value={config.body || ''}
                onChange={(e) => setConfig({ ...config, body: e.target.value })}
                placeholder='{"key": "value"}'
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
              />
            </div>
          </>
        );

      case 'code':
        return (
          <>
            <div>
              <label className="block text-sm font-medium mb-2">Language</label>
              <select
                value={config.language || 'javascript'}
                onChange={(e) => setConfig({ ...config, language: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
              >
                <option value="javascript">JavaScript</option>
                <option value="python">Python</option>
                <option value="bash">Bash</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Code</label>
              <textarea
                value={config.code || ''}
                onChange={(e) => setConfig({ ...config, code: e.target.value })}
                placeholder="// Your code here"
                rows={6}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
              />
            </div>
          </>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium mb-2">Configuration</label>
            <textarea
              value={JSON.stringify(config, null, 2)}
              onChange={(e) => {
                try {
                  setConfig(JSON.parse(e.target.value));
                } catch {}
              }}
              rows={6}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white font-mono text-sm"
            />
          </div>
        );
    }
  };

  if (!node) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-gray-800 border-l border-gray-700 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-white">{node.data.label}</h3>
          <p className="text-xs text-gray-400 mt-1">Node Configuration</p>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-700 rounded transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Config Fields */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Node Name */}
        <div>
          <label className="block text-sm font-medium mb-2">Node Name</label>
          <input
            type="text"
            value={config.name || node.data.label}
            onChange={(e) => setConfig({ ...config, name: e.target.value })}
            placeholder="Node name"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>

        {/* Type-specific fields */}
        {renderConfigFields()}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium mb-2">Notes</label>
          <textarea
            value={config.notes || ''}
            onChange={(e) => setConfig({ ...config, notes: e.target.value })}
            placeholder="Optional notes about this node..."
            rows={2}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-700 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded transition"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 rounded transition"
        >
          Save
        </button>
      </div>
    </div>
  );
}
