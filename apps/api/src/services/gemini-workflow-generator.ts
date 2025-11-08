import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export interface GeneratedWorkflow {
  nodes: any[];
  edges: any[];
  explanation: string;
  generatedBy?: string;
  model?: string;
}

export async function generateWorkflowFromPrompt(prompt: string): Promise<GeneratedWorkflow> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const systemPrompt = `You are an AI workflow generation assistant. When a user describes a workflow they want to create, you generate a JSON structure representing nodes and edges for a visual workflow builder (like n8n or Zapier).

Available node types:
- slack (Slack integration)
- jira (Jira integration)
- email (Email/Outlook)
- calendar (Calendar events)
- github (GitHub integration)
- database (Database operations)
- webhook (HTTP webhooks)
- api-call (Generic API calls)
- condition (If/then logic)
- code (Run custom code)
- onedrive (OneDrive file operations)
- excel (Excel operations)
- sharepoint (SharePoint)
- teams (Microsoft Teams)

Return ONLY a valid JSON object with this structure:
{
  "nodes": [
    {
      "id": "unique-id",
      "type": "workflowNode",
      "position": { "x": number, "y": number },
      "data": {
        "label": "Node Label",
        "icon": "icon-name",
        "color": "#hexcolor",
        "nodeType": "node-type",
        "description": "Brief description"
      }
    }
  ],
  "edges": [
    {
      "id": "edge-id",
      "source": "source-node-id",
      "target": "target-node-id"
    }
  ],
  "explanation": "A brief explanation of how this workflow works"
}

Rules:
1. Position nodes in a logical flow (left to right, top to bottom)
2. First node at x:100, y:100, subsequent nodes spaced by 250px horizontally
3. Connect nodes in execution order
4. Use appropriate colors for each service type
5. Keep it simple - 3-7 nodes typically`;

    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nGenerate the workflow JSON:`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // Extract JSON from response (sometimes it's wrapped in code blocks)
    let jsonText = text.trim();
    if (jsonText.startsWith('```json')) {
      jsonText = jsonText.replace(/```json\n?/g, '').replace(/```\n?$/g, '');
    } else if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/```\n?/g, '').replace(/```\n?$/g, '');
    }

    const workflow = JSON.parse(jsonText);

    return workflow;
  } catch (error) {
    console.error('Error generating workflow:', error);

    // Return a simple fallback workflow
    return {
      nodes: [
        {
          id: 'start-1',
          type: 'workflowNode',
          position: { x: 100, y: 100 },
          data: {
            label: 'Start',
            icon: 'action',
            color: '#6366F1',
            nodeType: 'webhook',
            description: 'Workflow trigger',
          },
        },
      ],
      edges: [],
      explanation: 'I encountered an error generating your workflow. Please try describing it differently.',
    };
  }
}

// Color scheme for different services
export const serviceColors: Record<string, string> = {
  slack: '#4A154B',
  jira: '#0052CC',
  email: '#EA4335',
  calendar: '#0078D4',
  github: '#181717',
  database: '#336791',
  webhook: '#6366F1',
  'api-call': '#8B5CF6',
  condition: '#F59E0B',
  code: '#10B981',
  onedrive: '#0078D4',
  excel: '#217346',
  sharepoint: '#038387',
  teams: '#6264A7',
  outlook: '#0078D4',
};
