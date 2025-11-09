import { useState } from 'react';
import EnhancedRepo3DViewer from '../visualization/EnhancedRepo3DViewer';

type Role = 'developer' | 'finance' | 'hr' | 'pm' | 'devops';

export default function DeveloperView() {
  const [repoUrl, setRepoUrl] = useState('');
  const [visualizing, setVisualizing] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role>('developer');

  const handleVisualize = () => {
    if (!repoUrl) return;

    // Parse owner/repo from URL or direct input
    let owner, repo;

    const urlMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (urlMatch) {
      [, owner, repo] = urlMatch;
    } else {
      const parts = repoUrl.split('/');
      if (parts.length === 2) {
        [owner, repo] = parts;
      } else {
        alert('Please enter a valid GitHub URL or owner/repo format');
        return;
      }
    }

    // Remove .git suffix if present
    repo = repo.replace(/\.git$/, '');

    setRepoInfo({ owner, repo });
    setVisualizing(true);
  };

  const handleQuickVisualize = (owner: string, repo: string) => {
    setRepoUrl(`${owner}/${repo}`);
    setRepoInfo({ owner, repo });
    setVisualizing(true);
  };

  const getRoleConfig = (role: Role) => {
    switch (role) {
      case 'developer':
        return {
          icon: '💻',
          title: 'Developer View',
          description: 'Code structure, functions, and API connections',
          features: [
            'Interactive 3D repository visualization',
            'Real-time sync with latest changes',
            'Color-coded files (🟢 new, 🔴 deleted, 🟠 modified, 🔵 unchanged)',
            'Gemini AI-powered code analysis',
            'File connections & API endpoint mapping',
            'Hover to see functions and API calls',
            'Click files to open in VSCode',
          ]
        };
      case 'finance':
        return {
          icon: '💰',
          title: 'Finance View',
          description: 'Budget allocation and development costs',
          features: [
            'Budget allocation pie chart (top left)',
            'Files colored by development cost',
            'Development & maintenance cost per file',
            'Resource hours estimation',
            'Project budget breakdown',
            'Cost tracking across codebase',
            '🔴 Red = Expensive, 🟠 Orange = Moderate, 🟢 Green = Low cost',
          ]
        };
      case 'hr':
        return {
          icon: '👥',
          title: 'HR View',
          description: 'Team collaboration and contributors',
          features: [
            'GitHub contributors per file',
            'Team member roles and assignments',
            'Files colored by collaboration level',
            'Contributor statistics',
            'Claude as SCRUM Master',
            '🟢 Green = Highly collaborative (3+ contributors)',
            '⚫ Gray = No contributors, 🔵 Blue = 1, 🟠 Orange = 2',
          ]
        };
      case 'pm':
        return {
          icon: '📊',
          title: 'Project Manager View',
          description: 'Issues, pull requests, and sprint progress',
          features: [
            'SCRUM sprint chart (top right)',
            'Issues impact on files',
            'Pull requests tracking',
            'Sprint burndown visualization',
            'Files colored by issue impact',
            '🔴 Red = High impact, 🟠 Orange = Medium, 🟡 Yellow = Low',
            'Sprint velocity and progress tracking',
          ]
        };
      case 'devops':
        return {
          icon: '🔧',
          title: 'DevOps View',
          description: 'Test coverage and CI/CD status',
          features: [
            'Multi-LLM test results (Gemini, Claude, XAI)',
            'Test pass/fail status per file',
            'Code coverage metrics',
            'CI/CD pipeline status',
            'Files colored by test results',
            '🟢 Green = All passed, 🟠 Orange = Some passed, 🔴 Red = Failed',
            '⚫ Gray = No tests available',
          ]
        };
    }
  };

  const roleConfig = getRoleConfig(selectedRole);

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{roleConfig.icon} {roleConfig.title}</h1>
        <p className="text-gray-400">{roleConfig.description}</p>
      </div>

      {!visualizing ? (
        <>
          <div className="card max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Repository Visualization</h2>

            <div className="space-y-4">
              {/* Role Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Select Your Role
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {(['developer', 'finance', 'hr', 'pm', 'devops'] as Role[]).map((role) => {
                    const config = getRoleConfig(role);
                    return (
                      <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`px-4 py-3 rounded-lg border-2 transition ${
                          selectedRole === role
                            ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                            : 'border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500'
                        }`}
                      >
                        <div className="text-2xl mb-1">{config.icon}</div>
                        <div className="text-xs font-semibold">{role.toUpperCase()}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GitHub Repository URL or owner/repo
                </label>
                <input
                  type="text"
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleVisualize()}
                  placeholder="https://github.com/facebook/react or facebook/react"
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <button
                onClick={handleVisualize}
                disabled={!repoUrl}
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                🔥 Visualize Repository
              </button>
            </div>

            <div className="mt-8 p-6 bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-4">{roleConfig.title} Features:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                {roleConfig.features.map((feature, idx) => (
                  <li key={idx}>✓ {feature}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className="card cursor-pointer hover:border-orange-500" onClick={() => handleQuickVisualize('facebook', 'react')}>
              <h3 className="font-semibold text-orange-400 mb-2">🎯 Popular</h3>
              <p className="text-sm text-gray-300">facebook/react</p>
            </div>
            <div className="card cursor-pointer hover:border-blue-500" onClick={() => handleQuickVisualize('microsoft', 'vscode')}>
              <h3 className="font-semibold text-blue-400 mb-2">⭐ Trending</h3>
              <p className="text-sm text-gray-300">microsoft/vscode</p>
            </div>
            <div className="card cursor-pointer hover:border-green-500" onClick={() => handleQuickVisualize('vercel', 'next.js')}>
              <h3 className="font-semibold text-green-400 mb-2">📚 Framework</h3>
              <p className="text-sm text-gray-300">vercel/next.js</p>
            </div>
          </div>
        </>
      ) : (
        <div className="flex-1 flex flex-col">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {repoInfo?.owner}/{repoInfo?.repo}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {roleConfig.icon} Viewing as: <span className="text-orange-400 font-semibold">{roleConfig.title}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Role switcher in visualization view */}
              <div className="flex items-center gap-2">
                {(['developer', 'finance', 'hr', 'pm', 'devops'] as Role[]).map((role) => {
                  const config = getRoleConfig(role);
                  return (
                    <button
                      key={role}
                      onClick={() => setSelectedRole(role)}
                      className={`px-3 py-2 rounded-lg border transition text-sm ${
                        selectedRole === role
                          ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white'
                          : 'border-gray-600 bg-gray-700 text-gray-400 hover:border-gray-500'
                      }`}
                      title={config.title}
                    >
                      {config.icon}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setVisualizing(false)}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
              >
                ← Back to Search
              </button>
            </div>
          </div>

          <div className="flex-1 card p-0 overflow-hidden">
            {repoInfo && <EnhancedRepo3DViewer owner={repoInfo.owner} repo={repoInfo.repo} role={selectedRole} />}
          </div>
        </div>
      )}
    </div>
  );
}
