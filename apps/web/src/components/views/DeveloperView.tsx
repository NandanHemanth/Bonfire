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

    repo = repo.replace(/\.git$/, '');
    setRepoInfo({ owner, repo });
    setVisualizing(true);
  };

  const handleQuickVisualize = (owner: string, repo: string) => {
    setRepoUrl(`${owner}/${repo}`);
    setRepoInfo({ owner, repo });
    setVisualizing(true);
  };

  const getRoleIcon = (role: Role) => {
    const icons = {
      developer: '💻',
      finance: '💰',
      hr: '👥',
      pm: '📊',
      devops: '🔧'
    };
    return icons[role];
  };

  return (
    <div className="h-full flex items-center justify-center p-6">
      {!visualizing ? (
        <div className="w-full max-w-4xl">
          {/* Centered Card */}
          <div className="card">
            <div className="text-center mb-6">
              <h1 className="text-4xl font-bold mb-2">🔥 BonFire</h1>
              <p className="text-gray-300 text-lg">3D Repository Visualization</p>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-300 mb-3 text-center">
                Select Your Role
              </label>
              <div className="flex justify-center gap-3">
                {(['developer', 'finance', 'hr', 'pm', 'devops'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-4 py-3 rounded-xl border-2 transition-all ${
                      selectedRole === role
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white shadow-lg shadow-orange-500/50 scale-105'
                        : 'border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-sm text-gray-300 hover:border-opacity-40 hover:bg-opacity-20'
                    }`}
                  >
                    <div className="text-2xl mb-1">{getRoleIcon(role)}</div>
                    <div className="text-xs font-semibold uppercase">{role}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Input Field */}
            <div className="mb-6">
              <input
                type="text"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVisualize()}
                placeholder="github.com/facebook/react or facebook/react"
                className="w-full px-6 py-4 bg-white bg-opacity-10 backdrop-blur-sm border border-white border-opacity-20 rounded-xl text-white text-center placeholder-gray-400 focus:outline-none focus:border-orange-500 focus:bg-opacity-20 transition-all text-lg"
              />
            </div>

            {/* Visualize Button */}
            <button
              onClick={handleVisualize}
              disabled={!repoUrl}
              className="w-full btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              🔥 Visualize Repository
            </button>

            {/* Quick Access */}
            <div className="mt-6 grid grid-cols-3 gap-3">
              <button
                onClick={() => handleQuickVisualize('facebook', 'react')}
                className="card cursor-pointer hover:border-orange-500 hover:shadow-orange-500/50 transition-all hover:scale-105 p-4"
              >
                <div className="text-orange-400 font-semibold mb-1">🎯 Popular</div>
                <div className="text-sm text-gray-300">facebook/react</div>
              </button>
              <button
                onClick={() => handleQuickVisualize('microsoft', 'vscode')}
                className="card cursor-pointer hover:border-blue-500 hover:shadow-blue-500/50 transition-all hover:scale-105 p-4"
              >
                <div className="text-blue-400 font-semibold mb-1">⭐ Trending</div>
                <div className="text-sm text-gray-300">microsoft/vscode</div>
              </button>
              <button
                onClick={() => handleQuickVisualize('vercel', 'next.js')}
                className="card cursor-pointer hover:border-green-500 hover:shadow-green-500/50 transition-all hover:scale-105 p-4"
              >
                <div className="text-green-400 font-semibold mb-1">📚 Framework</div>
                <div className="text-sm text-gray-300">vercel/next.js</div>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between px-4">
            <div>
              <h2 className="text-2xl font-bold">
                {repoInfo?.owner}/{repoInfo?.repo}
              </h2>
              <p className="text-sm text-gray-400 mt-1">
                {getRoleIcon(selectedRole)} Viewing as: <span className="text-orange-400 font-semibold">{selectedRole}</span>
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Role switcher */}
              <div className="flex items-center gap-2">
                {(['developer', 'finance', 'hr', 'pm', 'devops'] as Role[]).map((role) => (
                  <button
                    key={role}
                    onClick={() => setSelectedRole(role)}
                    className={`px-3 py-2 rounded-lg border transition-all text-sm ${
                      selectedRole === role
                        ? 'border-orange-500 bg-orange-500 bg-opacity-20 text-white shadow-lg shadow-orange-500/50'
                        : 'border-white border-opacity-20 bg-white bg-opacity-10 backdrop-blur-sm text-gray-400 hover:border-opacity-40 hover:bg-opacity-20'
                    }`}
                    title={role}
                  >
                    {getRoleIcon(role)}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setVisualizing(false)}
                className="px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 backdrop-blur-sm rounded-lg transition border border-white border-opacity-20"
              >
                ← Back
              </button>
            </div>
          </div>

          {/* Canvas */}
          <div className="flex-1 white-canvas-container overflow-hidden">
            {repoInfo && <EnhancedRepo3DViewer owner={repoInfo.owner} repo={repoInfo.repo} role={selectedRole} />}
          </div>
        </div>
      )}
    </div>
  );
}
