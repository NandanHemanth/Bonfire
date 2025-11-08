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
  presetIntegrations,
  updateWorkflow,
  executeWorkflow
} from '../services/workflow-manager.js';
import { generateWorkflowFromPrompt } from '../services/gemini-workflow-generator.js';
import { getDedalusClient } from '../services/dedalus-client.js';

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

router.put('/workflows/:id', async (req, res, next) => {
  try {
    const workflow = updateWorkflow(req.params.id, req.body);
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

router.post('/workflows/:id/execute', async (req, res, next) => {
  try {
    const result = await executeWorkflow(req.params.id);
    res.json(result);
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

// AI Workflow Generation
router.post('/workflows/generate', async (req, res, next) => {
  try {
    const { prompt, model } = req.body;
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    // Check if user wants to use Dedalus (@dedalus mention)
    const useDedalus = prompt.toLowerCase().includes('@dedalus');
    const cleanPrompt = prompt.replace(/@dedalus/gi, '').trim();

    let workflow;

    if (useDedalus) {
      console.log('Using Dedalus AI for workflow generation...');
      const dedalusClient = getDedalusClient();

      // Get available integrations (could be passed from frontend)
      const availableIntegrations = [
        'slack', 'jira', 'email', 'calendar', 'github',
        'database', 'onedrive', 'teams', 'sharepoint'
      ];

      workflow = await dedalusClient.generateWorkflowWithTools(
        cleanPrompt,
        availableIntegrations
      );

      // Add metadata to indicate Dedalus was used
      workflow.generatedBy = 'dedalus';
      workflow.model = model || 'gpt-4-turbo';
    } else {
      console.log('Using Gemini for workflow generation...');
      workflow = await generateWorkflowFromPrompt(cleanPrompt);
      workflow.generatedBy = 'gemini';
    }

    res.json(workflow);
  } catch (error) {
    console.error('Error generating workflow:', error);
    next(error);
  }
});

// Test Dedalus connection
router.get('/integrations/dedalus/test', async (req, res, next) => {
  try {
    const dedalusClient = getDedalusClient();
    const isConnected = await dedalusClient.testConnection();

    res.json({
      success: isConnected,
      service: 'Dedalus AI',
      status: isConnected ? 'connected' : 'disconnected'
    });
  } catch (error) {
    next(error);
  }
});

export default router;
