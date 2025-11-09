import express from 'express';
import { parseRepository, analyzeCodeStructure } from '../services/github-parser.js';
import { generateRepoLegend } from '../services/gemini-analyzer.js';
import { analyzeRepository, detectIntegrations } from '../services/code-analyzer.js';
import { enhanceAnalysisWithAI } from '../services/ai-analyzer.js';
import { analyzeRepositoryWithGemini, loadLatestAnalysis } from '../services/gemini-repo-analyzer.js';

const router = express.Router();

// In-memory sync status tracking
const syncStatus = new Map<string, {
  status: 'idle' | 'syncing' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
  lastSync?: string;
  error?: string;
}>();

// Get repository structure and visualization data
router.get('/:owner/:repo', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch as string || 'main';

    const repoData = await parseRepository(owner, repo, branch);
    res.json(repoData);
  } catch (error) {
    next(error);
  }
});

// Generate AI-powered legend for repository
router.get('/:owner/:repo/legend', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch as string || 'main';

    // First get the repository structure
    const repoData = await parseRepository(owner, repo, branch);

    // Generate legend using Gemini AI
    const legend = await generateRepoLegend(owner, repo, repoData.structure);

    res.json(legend);
  } catch (error) {
    next(error);
  }
});

// Analyze specific file or directory
router.post('/:owner/:repo/analyze', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const { path, branch = 'main' } = req.body;

    const analysis = await analyzeCodeStructure(owner, repo, path, branch);
    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Deep code analysis - functions, connections, APIs, hierarchy
router.get('/:owner/:repo/deep-analysis', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch as string || 'main';
    const useAI = req.query.ai !== 'false'; // Default to true

    let analysis = await analyzeRepository(owner, repo, branch);

    // Enhance with AI if enabled
    if (useAI) {
      analysis = await enhanceAnalysisWithAI(owner, repo, analysis);
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Detect integrations (Slack, Jira, APIs, etc.)
router.get('/:owner/:repo/integrations', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.query.branch as string || 'main';

    const integrations = await detectIntegrations(owner, repo, branch);
    res.json(integrations);
  } catch (error) {
    next(error);
  }
});

// Sync repository - trigger full analysis with Gemini
router.post('/:owner/:repo/sync', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const branch = req.body.branch || 'main';
    const repoId = `${owner}/${repo}`;

    // Check if already syncing
    const currentStatus = syncStatus.get(repoId);
    if (currentStatus && currentStatus.status === 'syncing') {
      return res.status(409).json({
        error: 'Repository is already syncing',
        status: currentStatus
      });
    }

    // Initialize sync status
    syncStatus.set(repoId, {
      status: 'syncing',
      progress: 0,
      message: 'Starting repository sync...'
    });

    // Start sync in background
    syncRepository(owner, repo, branch).catch(error => {
      console.error(`Sync failed for ${repoId}:`, error);
      syncStatus.set(repoId, {
        status: 'error',
        progress: 0,
        message: 'Sync failed',
        error: error.message
      });
    });

    res.json({
      message: 'Sync started',
      repoId,
      status: syncStatus.get(repoId)
    });
  } catch (error) {
    next(error);
  }
});

// Get sync status for a repository
router.get('/:owner/:repo/sync-status', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;
    const repoId = `${owner}/${repo}`;

    const status = syncStatus.get(repoId) || {
      status: 'idle',
      progress: 0,
      message: 'Not synced yet'
    };

    res.json(status);
  } catch (error) {
    next(error);
  }
});

// Get latest analysis results
router.get('/:owner/:repo/analysis', async (req, res, next) => {
  try {
    const { owner, repo } = req.params;

    const analysis = await loadLatestAnalysis(owner, repo);

    if (!analysis) {
      return res.status(404).json({
        error: 'No analysis found',
        message: 'Run sync first to analyze this repository'
      });
    }

    res.json(analysis);
  } catch (error) {
    next(error);
  }
});

// Open file in VSCode
router.post('/open-in-vscode', async (req, res, next) => {
  try {
    const { owner, repo, filePath } = req.body;

    if (!owner || !repo || !filePath) {
      return res.status(400).json({
        error: 'Missing required fields: owner, repo, filePath'
      });
    }

    // Construct the file path in the local repository
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);

    // Get the directory where the file is located
    const parts = filePath.split('/');
    const parentDir = parts.slice(0, -1).join('/');
    const repoPath = `repos/${owner}/${repo}`;
    const fullFilePath = `${repoPath}/${filePath}`;

    // Check if repo exists locally, if not clone it
    try {
      await execAsync(`code "${fullFilePath}"`);
      res.json({
        success: true,
        message: `Opening ${filePath} in VSCode`,
        path: fullFilePath
      });
    } catch (error) {
      console.error('VSCode open error:', error);
      res.status(500).json({
        error: 'Failed to open file in VSCode',
        message: 'Make sure VSCode is installed and the "code" command is available in PATH'
      });
    }
  } catch (error) {
    next(error);
  }
});

// Background sync function
async function syncRepository(owner: string, repo: string, branch: string) {
  const repoId = `${owner}/${repo}`;

  try {
    // Update status: analyzing
    syncStatus.set(repoId, {
      status: 'analyzing',
      progress: 50,
      message: 'Analyzing repository with Gemini AI...'
    });

    // Perform full analysis
    await analyzeRepositoryWithGemini(owner, repo, branch);

    // Complete
    syncStatus.set(repoId, {
      status: 'complete',
      progress: 100,
      message: 'Sync complete',
      lastSync: new Date().toISOString()
    });
  } catch (error: any) {
    throw error;
  }
}

export default router;
