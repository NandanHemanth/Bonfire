import express from 'express';
import { parseRepository, analyzeCodeStructure } from '../services/github-parser.js';

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

export default router;
