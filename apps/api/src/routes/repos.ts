import express from 'express';
import { parseRepository, analyzeCodeStructure } from '../services/github-parser.js';
import { generateRepoLegend } from '../services/gemini-analyzer.js';
import { analyzeRepository, detectIntegrations } from '../services/code-analyzer.js';
import { enhanceAnalysisWithAI } from '../services/ai-analyzer.js';

const router = express.Router();

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

export default router;
