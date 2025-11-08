import express from 'express';
import { triggerMCPAction } from '../services/mcp-orchestrator.js';

const router = express.Router();

// Trigger MCP action (finance, HR, CI/CD, security)
router.post('/trigger', async (req, res, next) => {
  try {
    const { action, server, params } = req.body;

    if (!action || !server) {
      return res.status(400).json({
        error: 'Missing required fields: action and server'
      });
    }

    const result = await triggerMCPAction(server, action, params);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

// Get MCP server status
router.get('/status', async (req, res) => {
  res.json({
    finance: process.env.MCP_FINANCE_ENABLED === 'true',
    hr: process.env.MCP_HR_ENABLED === 'true',
    cicd: process.env.MCP_CICD_ENABLED === 'true',
    security: process.env.MCP_SECURITY_ENABLED === 'true'
  });
});

export default router;
