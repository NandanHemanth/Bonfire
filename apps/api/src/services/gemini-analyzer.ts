import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface FileNode {
  path: string;
  type: string;
  size?: number;
}

export async function generateRepoLegend(owner: string, repo: string, structure: FileNode[]) {
  try {
    // Create a markdown representation of the file structure
    const fileTree = createFileTreeMarkdown(structure);

    // Generate analysis using Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this GitHub repository structure and create a concise legend for 3D visualization.

Repository: ${owner}/${repo}
Total Files: ${structure.length}

File Structure:
${fileTree}

Please provide:
1. **Repository Type**: (e.g., React App, Python Library, Monorepo, etc.)
2. **Main Technologies**: List the primary languages/frameworks used
3. **Directory Legend**: Explain what each major directory contains
4. **Color Coding**: Suggest color meanings for the 3D visualization based on file types
5. **Key Insights**: 2-3 bullet points about the repository structure

Format the response as clean, readable markdown suitable for display in a legend panel.
Keep it concise - aim for 200-300 words total.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const legend = response.text();

    return {
      owner,
      repo,
      totalFiles: structure.length,
      legend,
      fileTree,
      timestamp: new Date().toISOString()
    };
  } catch (error: any) {
    console.error('Gemini analysis error:', error);

    // Fallback to basic analysis if Gemini fails
    return {
      owner,
      repo,
      totalFiles: structure.length,
      legend: generateFallbackLegend(owner, repo, structure),
      fileTree: createFileTreeMarkdown(structure),
      timestamp: new Date().toISOString()
    };
  }
}

function createFileTreeMarkdown(structure: FileNode[]): string {
  // Group files by directory
  const directories = new Map<string, FileNode[]>();

  structure.forEach(file => {
    if (file.type === 'blob') {
      const parts = file.path.split('/');
      const dir = parts.length > 1 ? parts[0] : 'root';

      if (!directories.has(dir)) {
        directories.set(dir, []);
      }
      directories.get(dir)?.push(file);
    }
  });

  // Create markdown tree (limit to first 50 files to avoid token limits)
  let markdown = '```\n';
  let fileCount = 0;

  directories.forEach((files, dirName) => {
    if (fileCount >= 50) return;

    markdown += `${dirName}/\n`;
    files.slice(0, 10).forEach(file => {
      if (fileCount >= 50) return;
      const fileName = file.path.split('/').pop();
      markdown += `  ├── ${fileName}\n`;
      fileCount++;
    });

    if (files.length > 10) {
      markdown += `  └── ... (${files.length - 10} more files)\n`;
    }
  });

  markdown += '```\n';
  return markdown;
}

function generateFallbackLegend(owner: string, repo: string, structure: FileNode[]): string {
  // Basic analysis without AI
  const extensions = new Map<string, number>();
  const directories = new Set<string>();

  structure.forEach(file => {
    if (file.type === 'blob') {
      const ext = file.path.split('.').pop()?.toLowerCase() || 'unknown';
      extensions.set(ext, (extensions.get(ext) || 0) + 1);

      const dir = file.path.split('/')[0];
      directories.add(dir);
    }
  });

  // Sort extensions by count
  const topExtensions = Array.from(extensions.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  return `# ${owner}/${repo}

## Repository Overview
- **Total Files**: ${structure.length}
- **Directories**: ${directories.size}

## File Types
${topExtensions.map(([ext, count]) => `- **.${ext}**: ${count} files`).join('\n')}

## 3D Visualization Legend
- **Central Sphere**: Repository root
- **Outer Spheres**: Major directories
- **Small Cubes**: Individual files
- **Lines**: Directory-file relationships

## Color Coding
- **JavaScript (.js)**: Yellow
- **TypeScript (.ts, .tsx)**: Blue
- **Python (.py)**: Dark Blue
- **CSS (.css)**: Purple
- **Markdown (.md)**: Gray

*Note: This is a basic analysis. For detailed insights, ensure Gemini API is configured.*`;
}
