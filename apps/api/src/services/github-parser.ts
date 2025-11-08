import { Octokit } from '@octokit/rest';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

export async function parseRepository(owner: string, repo: string, branch: string = 'main') {
  try {
    const { data: repoData } = await octokit.repos.get({ owner, repo });
    const { data: tree } = await octokit.git.getTree({
      owner,
      repo,
      tree_sha: branch,
      recursive: '1'
    });

    return {
      owner,
      name: repo,
      branch,
      structure: tree.tree,
      metadata: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        language: repoData.language,
        lastUpdated: repoData.updated_at,
        contributors: 0 // Placeholder
      }
    };
  } catch (error: any) {
    throw new Error(`Failed to parse repository: ${error.message}`);
  }
}

export async function analyzeCodeStructure(owner: string, repo: string, path: string, branch: string = 'main') {
  try {
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo,
      path,
      ref: branch
    });

    return {
      path,
      type: Array.isArray(contents) ? 'directory' : 'file',
      contents: Array.isArray(contents) ? contents.length : 1,
      data: contents
    };
  } catch (error: any) {
    throw new Error(`Failed to analyze code structure: ${error.message}`);
  }
}
