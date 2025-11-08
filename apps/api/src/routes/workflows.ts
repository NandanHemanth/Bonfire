import express from 'express';
import {
  createWorkflow,
  addNodeToWorkflow,
  connectNodes,
  createIntegration,
  testIntegration,
  getWorkflow,
  getAllWorkflows,
  getIntegration,
  getAllIntegrations,
  deleteWorkflow,
  deleteIntegration,
  presetIntegrations
} from '../services/workflow-manager.js';

const router = express.Router();

// Workflow routes
router.post('/workflows', async (req, res, next) => {
  try {
    const { name, description } = req.body;
    const workflow = createWorkflow(name, description);
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

router.get('/workflows', async (req, res, next) => {
  try {
    const workflows = getAllWorkflows();
    res.json(workflows);
  } catch (error) {
    next(error);
  }
});

router.get('/workflows/:id', async (req, res, next) => {
  try {
    const workflow = getWorkflow(req.params.id);
    if (!workflow) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json(workflow);
  } catch (error) {
    next(error);
  }
});

router.delete('/workflows/:id', async (req, res, next) => {
  try {
    const deleted = deleteWorkflow(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Workflow not found' });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

router.post('/workflows/:id/nodes', async (req, res, next) => {
  try {
    const node = addNodeToWorkflow(req.params.id, req.body);
    res.json(node);
  } catch (error) {
    next(error);
  }
});

router.post('/workflows/:id/connections', async (req, res, next) => {
  try {
    const { sourceNodeId, targetNodeId } = req.body;
    connectNodes(req.params.id, sourceNodeId, targetNodeId);
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

// Integration routes
router.get('/integrations/presets', async (req, res, next) => {
  try {
    res.json(presetIntegrations);
  } catch (error) {
    next(error);
  }
});

router.post('/integrations', async (req, res, next) => {
  try {
    const integration = createIntegration(req.body);
    res.json(integration);
  } catch (error) {
    next(error);
  }
});

router.get('/integrations', async (req, res, next) => {
  try {
    const integrations = getAllIntegrations();
    res.json(integrations);
  } catch (error) {
    next(error);
  }
});

router.get('/integrations/:id', async (req, res, next) => {
  try {
    const integration = getIntegration(req.params.id);
    if (!integration) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    res.json(integration);
  } catch (error) {
    next(error);
  }
});

router.post('/integrations/:id/test', async (req, res, next) => {
  try {
    const success = await testIntegration(req.params.id);
    res.json({ success });
  } catch (error) {
    next(error);
  }
});

router.delete('/integrations/:id', async (req, res, next) => {
  try {
    const deleted = deleteIntegration(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Integration not found' });
    }
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
});

export default router;
