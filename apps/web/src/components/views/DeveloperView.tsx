import { useState } from 'react';

export default function DeveloperView() {
  const [repoUrl, setRepoUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleVisualize = async () => {
    if (!repoUrl) return;
    setLoading(true);

    // Parse owner/repo from URL
    const match = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (match) {
      const [, owner, repo] = match;
      console.log(`Visualizing ${owner}/${repo}`);
      // TODO: Implement actual visualization
    }

    setTimeout(() => setLoading(false), 1000);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-2">💻 Developer View</h1>
      <p className="text-gray-400 mb-8">Visualize any GitHub repository in 3D</p>

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
              placeholder="https://github.com/facebook/react or facebook/react"
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            onClick={handleVisualize}
            disabled={loading || !repoUrl}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Loading...' : '🔥 Visualize Repository'}
          </button>
        </div>

        <div className="mt-8 p-6 bg-gray-700 rounded-lg">
          <h3 className="font-semibold mb-4">Coming Soon:</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li>✓ Interactive 3D repository visualization</li>
            <li>✓ Color-coded files by language</li>
            <li>✓ Dependency graphs and connections</li>
            <li>✓ Code complexity heatmaps</li>
            <li>✓ Real-time navigation</li>
          </ul>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="card">
          <h3 className="font-semibold text-orange-400 mb-2">🎯 Popular</h3>
          <button className="text-sm text-gray-300 hover:text-white">facebook/react</button>
        </div>
        <div className="card">
          <h3 className="font-semibold text-blue-400 mb-2">⭐ Trending</h3>
          <button className="text-sm text-gray-300 hover:text-white">microsoft/vscode</button>
        </div>
        <div className="card">
          <h3 className="font-semibold text-green-400 mb-2">📚 Recent</h3>
          <button className="text-sm text-gray-300 hover:text-white">Your repositories</button>
        </div>
      </div>
    </div>
  );
}
