import { GoogleGenerativeAI } from '@google/generative-ai';
import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

interface AIFileAnalysis {
  path: string;
  functions: {
    name: string;
    description: string;
    purpose: string;
  }[];
  dependencies: {
    file: string;
    reason: string;
    type: 'import' | 'api-call' | 'data-flow';
  }[];
  apiCalls: {
    endpoint: string;
    method: string;
    purpose: string;
    line?: number;
  }[];
}

interface AIRepositoryAnalysis {
  files: AIFileAnalysis[];
  connections: {
    source: string;
    target: string;
    type: 'import' | 'api-call' | 'data-flow';
    description: string;
  }[];
}

export async function analyzeRepositoryWithAI(
  owner: string,
  repo: string
): Promise<AIRepositoryAnalysis> {
  console.log(`Starting AI analysis for ${owner}/${repo}`);

  if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured');
  }

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  // Fetch repository structure
  const { data: tree } = await octokit.git.getTree({
    owner,
    repo,
    tree_sha: 'HEAD',
    recursive: 'true'
  });

  // Filter to code files only (limit to important files to avoid token limits)
  const codeFiles = tree.tree
    .filter(item =>
      item.type === 'blob' &&
      item.path &&
      /\.(ts|tsx|js|jsx|py|java|go|rs)$/.test(item.path) &&
      !item.path.includes('node_modules') &&
      !item.path.includes('dist') &&
      !item.path.includes('build') &&
      !item.path.includes('.test.') &&
      !item.path.includes('.spec.')
    )
    .slice(0, 50); // Limit to first 50 files to avoid token limits

  console.log(`Analyzing ${codeFiles.length} code files with AI`);

  // Fetch file contents
  const filesWithContent = await Promise.all(
    codeFiles.map(async (file) => {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: file.path!
        });

        if ('content' in data) {
          const content = Buffer.from(data.content, 'base64').toString('utf-8');
          return {
            path: file.path!,
            content: content.slice(0, 5000) // Limit content length
          };
        }
      } catch (error) {
        console.error(`Error fetching ${file.path}:`, error);
      }
      return null;
    })
  );

  const validFiles = filesWithContent.filter(f => f !== null);

  // Analyze files in batches
  const batchSize = 5;
  const allAnalyses: AIFileAnalysis[] = [];

  for (let i = 0; i < validFiles.length; i += batchSize) {
    const batch = validFiles.slice(i, i + batchSize);

    const prompt = `You are analyzing a codebase. For each file below, extract:
1. All functions/methods with their descriptions and purposes
2. Dependencies on other files (not external libraries) with reasons
3. API calls (HTTP requests, database queries, etc.) with purposes

Respond with ONLY valid JSON in this exact format:
{
  "files": [
    {
      "path": "file/path.ts",
      "functions": [
        {
          "name": "functionName",
          "description": "what it does",
          "purpose": "why it exists"
        }
      ],
      "dependencies": [
        {
          "file": "other/file.ts",
          "reason": "uses X from this file",
          "type": "import"
        }
      ],
      "apiCalls": [
        {
          "endpoint": "/api/users",
          "method": "GET",
          "purpose": "fetch user data"
        }
      ]
    }
  ]
}

Files to analyze:
${batch.map(f => `
--- FILE: ${f!.path} ---
${f!.content}
`).join('\n\n')}`;

    try {
      console.log(`Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(validFiles.length / batchSize)}`);

      const result = await model.generateContent(prompt);
      const response = result.response.text();

      // Extract JSON from response (handle markdown code blocks)
      let jsonText = response;
      const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        jsonText = jsonMatch[1];
      }

      const batchAnalysis = JSON.parse(jsonText);
      allAnalyses.push(...batchAnalysis.files);

      // Rate limiting - wait between batches
      if (i + batchSize < validFiles.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } catch (error) {
      console.error(`Error analyzing batch ${i}:`, error);
      // Continue with other batches even if one fails
    }
  }

  // Build connections from dependencies
  const connections: AIRepositoryAnalysis['connections'] = [];
  allAnalyses.forEach(file => {
    file.dependencies?.forEach(dep => {
      connections.push({
        source: file.path,
        target: dep.file,
        type: dep.type,
        description: dep.reason
      });
    });
  });

  console.log(`AI analysis complete: ${allAnalyses.length} files, ${connections.length} connections`);

  return {
    files: allAnalyses,
    connections
  };
}

export async function enhanceAnalysisWithAI(
  owner: string,
  repo: string,
  baseAnalysis: any
): Promise<any> {
  try {
    const aiAnalysis = await analyzeRepositoryWithAI(owner, repo);

    // Merge AI analysis with base analysis
    const fileMap = new Map(aiAnalysis.files.map(f => [f.path, f]));

    // Enhance hierarchy with AI function data
    baseAnalysis.hierarchy.forEach((node: any) => {
      if (node.type === 'file') {
        const aiData = fileMap.get(node.path);
        if (aiData) {
          node.aiFunctions = aiData.functions;
          node.aiAPIs = aiData.apiCalls;
        }
      }
    });

    // Add AI-discovered connections
    baseAnalysis.aiConnections = aiAnalysis.connections;

    return baseAnalysis;
  } catch (error) {
    console.error('AI enhancement failed:', error);
    // Return base analysis if AI fails
    return baseAnalysis;
  }
}
