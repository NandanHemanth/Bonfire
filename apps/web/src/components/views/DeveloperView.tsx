import { useState } from 'react';
import Repo3DViewer from '../visualization/Repo3DViewer';
import Enhanced3DViewer from '../visualization/Enhanced3DViewer';

export default function DeveloperView() {
  const [repoUrl, setRepoUrl] = useState('');
  const [visualizing, setVisualizing] = useState(false);
  const [repoInfo, setRepoInfo] = useState<{ owner: string; repo: string } | null>(null);
  const [useEnhancedView, setUseEnhancedView] = useState(true);

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

  return (
    <div className="p-8 h-screen flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">💻 Developer View</h1>
        <p className="text-gray-400">Visualize any GitHub repository in 3D</p>
      </div>

      {!visualizing ? (
        <>
          <div className="card max-w-2xl">
            <h2 className="text-xl font-semibold mb-4">Repository Visualization</h2>

            <div className="space-y-4">
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
              <h3 className="font-semibold mb-4">Features:</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li>✓ Interactive 3D repository visualization</li>
                <li>✓ Color-coded files by language</li>
                <li>✓ Directory structure mapping</li>
                <li>✓ Real-time navigation with mouse controls</li>
                <li>✓ Automatic GitHub API integration</li>
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
            <h2 className="text-2xl font-bold">
              {repoInfo?.owner}/{repoInfo?.repo}
            </h2>
            <div className="flex items-center space-x-3">
              <div className="flex items-center bg-gray-800 rounded-lg p-1">
                <button
                  onClick={() => setUseEnhancedView(false)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    !useEnhancedView ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Basic
                </button>
                <button
                  onClick={() => setUseEnhancedView(true)}
                  className={`px-3 py-1 rounded text-sm transition ${
                    useEnhancedView ? 'bg-orange-600 text-white' : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Enhanced
                </button>
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
            {repoInfo && (
              useEnhancedView ? (
                <Enhanced3DViewer owner={repoInfo.owner} repo={repoInfo.repo} />
              ) : (
                <Repo3DViewer owner={repoInfo.owner} repo={repoInfo.repo} />
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}
