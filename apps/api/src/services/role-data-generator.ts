import { Octokit } from '@octokit/rest';
import { FinanceData, HRData, PMData, DevOpsData, ContributorInfo, Issue, PullRequest, SprintData, TestResult } from '@bonfire/shared/types/analysis.js';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN
});

// Generate Finance data for a repository
export async function generateFinanceData(owner: string, repo: string, files: string[]): Promise<FinanceData> {
  // Dummy budget allocation data
  const budgetAllocation = [
    { projectName: 'Frontend Development', allocated: 50000, used: 32000, currency: 'USD' },
    { projectName: 'Backend Development', allocated: 60000, used: 45000, currency: 'USD' },
    { projectName: 'DevOps & Infrastructure', allocated: 30000, used: 18000, currency: 'USD' },
    { projectName: 'Testing & QA', allocated: 20000, used: 12000, currency: 'USD' },
    { projectName: 'Documentation', allocated: 10000, used: 7000, currency: 'USD' }
  ];

  // Generate file costs based on file characteristics
  const fileCosts: Record<string, { developmentCost: number; maintenanceCost: number; resourceHours: number }> = {};

  files.forEach(filePath => {
    // Simulate costs based on file type and complexity
    const isTest = filePath.includes('test') || filePath.includes('spec');
    const isConfig = filePath.includes('config') || filePath.endsWith('.json');
    const isCore = filePath.includes('core') || filePath.includes('service');

    let baseCost = 1000;
    if (isCore) baseCost = 3000;
    else if (isTest) baseCost = 800;
    else if (isConfig) baseCost = 200;

    fileCosts[filePath] = {
      developmentCost: baseCost + Math.random() * 1000,
      maintenanceCost: baseCost * 0.2 + Math.random() * 200,
      resourceHours: Math.floor(baseCost / 100) + Math.random() * 10
    };
  });

  return {
    budgetAllocation,
    fileCosts
  };
}

// Generate HR data for a repository
export async function generateHRData(owner: string, repo: string, files: string[]): Promise<HRData> {
  const fileContributors: Record<string, ContributorInfo[]> = {};

  try {
    // Fetch real contributors from GitHub
    const { data: contributors } = await octokit.repos.listContributors({
      owner,
      repo,
      per_page: 20
    });

    // Assign roles to contributors
    const roles = ['Software Developer', 'Senior Developer', 'Tech Lead', 'DevOps Engineer', 'QA Engineer'];
    const teamMembers: ContributorInfo[] = contributors.map((contributor, idx) => ({
      username: contributor.login || 'unknown',
      name: contributor.login || 'Unknown',
      role: idx === 0 ? 'Tech Lead' : roles[idx % roles.length],
      contributions: contributor.contributions || 0,
      lastContribution: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Add Claude as SCRUM Master
    teamMembers.push({
      username: 'claude-ai',
      name: 'Claude',
      role: 'SCRUM Master',
      contributions: 0,
      lastContribution: new Date().toISOString()
    });

    // Assign contributors to files
    for (const filePath of files) {
      try {
        // Try to get real commit data for the file
        const { data: commits } = await octokit.repos.listCommits({
          owner,
          repo,
          path: filePath,
          per_page: 5
        });

        const fileContribs = commits.map(commit => {
          const username = commit.author?.login || commit.commit.author?.name || 'unknown';
          const existing = teamMembers.find(tm => tm.username === username);

          return existing || {
            username,
            name: commit.commit.author?.name || username,
            role: 'Software Developer',
            contributions: 1,
            lastContribution: commit.commit.author?.date
          };
        });

        fileContributors[filePath] = fileContribs.slice(0, 3); // Top 3 contributors per file
      } catch (error) {
        // If file commit fetch fails, assign random contributors
        fileContributors[filePath] = teamMembers
          .sort(() => Math.random() - 0.5)
          .slice(0, 2);
      }
    }

    return {
      fileContributors,
      teamMembers: teamMembers.slice(0, 10) // Limit to top 10
    };
  } catch (error) {
    console.error('Error fetching HR data from GitHub:', error);

    // Return dummy data if GitHub API fails
    const dummyContributors: ContributorInfo[] = [
      { username: 'john-doe', name: 'John Doe', role: 'Tech Lead', contributions: 150, lastContribution: new Date().toISOString() },
      { username: 'jane-smith', name: 'Jane Smith', role: 'Senior Developer', contributions: 120, lastContribution: new Date().toISOString() },
      { username: 'bob-wilson', name: 'Bob Wilson', role: 'Software Developer', contributions: 80, lastContribution: new Date().toISOString() },
      { username: 'claude-ai', name: 'Claude', role: 'SCRUM Master', contributions: 0, lastContribution: new Date().toISOString() }
    ];

    files.forEach(filePath => {
      fileContributors[filePath] = dummyContributors.slice(0, 2);
    });

    return {
      fileContributors,
      teamMembers: dummyContributors
    };
  }
}

// Generate PM data for a repository
export async function generatePMData(owner: string, repo: string, files: string[]): Promise<PMData> {
  // Generate dummy issues with impact on specific files
  const issues: Issue[] = [
    {
      id: 1,
      title: 'Fix authentication bug in login flow',
      status: 'in_progress',
      priority: 'high',
      impact: 'high',
      affectedFiles: files.filter(f => f.includes('auth') || f.includes('login')).slice(0, 3),
      assignee: 'john-doe'
    },
    {
      id: 2,
      title: 'Improve API response time',
      status: 'open',
      priority: 'medium',
      impact: 'medium',
      affectedFiles: files.filter(f => f.includes('api') || f.includes('service')).slice(0, 2),
      assignee: 'jane-smith'
    },
    {
      id: 3,
      title: 'Update dependencies to latest versions',
      status: 'open',
      priority: 'low',
      impact: 'low',
      affectedFiles: ['package.json', 'package-lock.json'],
      assignee: 'bob-wilson'
    },
    {
      id: 4,
      title: 'Critical security vulnerability in user validation',
      status: 'in_progress',
      priority: 'critical',
      impact: 'high',
      affectedFiles: files.filter(f => f.includes('user') || f.includes('validation')).slice(0, 2),
      assignee: 'john-doe'
    },
    {
      id: 5,
      title: 'Add unit tests for payment module',
      status: 'closed',
      priority: 'medium',
      impact: 'medium',
      affectedFiles: files.filter(f => f.includes('payment') || f.includes('test')).slice(0, 3),
      assignee: 'jane-smith'
    }
  ];

  try {
    // Fetch real pull requests from GitHub
    const { data: prs } = await octokit.pulls.list({
      owner,
      repo,
      state: 'all',
      per_page: 10,
      sort: 'updated',
      direction: 'desc'
    });

    const pullRequests: PullRequest[] = prs.map(pr => ({
      id: pr.number,
      title: pr.title,
      status: pr.state === 'open' ? 'open' : (pr.merged_at ? 'merged' : 'closed'),
      filesChanged: pr.changed_files || 0,
      additions: pr.additions || 0,
      deletions: pr.deletions || 0,
      author: pr.user?.login || 'unknown',
      createdAt: pr.created_at
    }));

    // Generate sprint data
    const currentSprint: SprintData = {
      name: 'Sprint 12',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      totalPoints: 100,
      completedPoints: 45,
      inProgressPoints: 30,
      todoPoints: 25
    };

    const sprints: SprintData[] = [
      {
        name: 'Sprint 10',
        startDate: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 90,
        completedPoints: 85,
        inProgressPoints: 0,
        todoPoints: 5
      },
      {
        name: 'Sprint 11',
        startDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 95,
        completedPoints: 90,
        inProgressPoints: 0,
        todoPoints: 5
      },
      currentSprint
    ];

    return {
      issues,
      pullRequests: pullRequests.length > 0 ? pullRequests : generateDummyPRs(),
      sprints,
      currentSprint
    };
  } catch (error) {
    console.error('Error fetching PM data from GitHub:', error);

    return {
      issues,
      pullRequests: generateDummyPRs(),
      sprints: [{
        name: 'Sprint 12',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 100,
        completedPoints: 45,
        inProgressPoints: 30,
        todoPoints: 25
      }],
      currentSprint: {
        name: 'Sprint 12',
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        totalPoints: 100,
        completedPoints: 45,
        inProgressPoints: 30,
        todoPoints: 25
      }
    };
  }
}

function generateDummyPRs(): PullRequest[] {
  return [
    {
      id: 101,
      title: 'Add new user dashboard',
      status: 'merged',
      filesChanged: 12,
      additions: 450,
      deletions: 120,
      author: 'john-doe',
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 102,
      title: 'Fix memory leak in data processing',
      status: 'open',
      filesChanged: 3,
      additions: 45,
      deletions: 30,
      author: 'jane-smith',
      createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
    },
    {
      id: 103,
      title: 'Update API documentation',
      status: 'merged',
      filesChanged: 5,
      additions: 200,
      deletions: 50,
      author: 'bob-wilson',
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
    }
  ];
}

// Generate DevOps data with test results from multiple LLMs
export async function generateDevOpsData(files: string[]): Promise<DevOpsData> {
  const testResults: Record<string, TestResult[]> = {};

  // Generate test results for each file from different LLMs
  files.forEach(filePath => {
    const results: TestResult[] = [];

    // Skip non-code files
    if (filePath.endsWith('.json') || filePath.endsWith('.md') || filePath.endsWith('.txt')) {
      return;
    }

    // Gemini test results
    const geminiPassed = Math.random() > 0.2; // 80% pass rate
    const geminiTotal = Math.floor(Math.random() * 20) + 5;
    const geminiPassedCount = geminiPassed ? geminiTotal : Math.floor(geminiTotal * 0.7);

    results.push({
      llm: 'gemini',
      filePath,
      passed: geminiPassed,
      totalTests: geminiTotal,
      passedTests: geminiPassedCount,
      failedTests: geminiTotal - geminiPassedCount,
      coverage: Math.floor(Math.random() * 30) + 70, // 70-100%
      executionTime: Math.random() * 2 + 0.5,
      details: geminiPassed ? 'All tests passed' : `${geminiTotal - geminiPassedCount} test(s) failed`
    });

    // Claude test results
    const claudePassed = Math.random() > 0.15; // 85% pass rate
    const claudeTotal = Math.floor(Math.random() * 20) + 5;
    const claudePassedCount = claudePassed ? claudeTotal : Math.floor(claudeTotal * 0.75);

    results.push({
      llm: 'claude',
      filePath,
      passed: claudePassed,
      totalTests: claudeTotal,
      passedTests: claudePassedCount,
      failedTests: claudeTotal - claudePassedCount,
      coverage: Math.floor(Math.random() * 25) + 75, // 75-100%
      executionTime: Math.random() * 2 + 0.3,
      details: claudePassed ? 'All tests passed' : `${claudeTotal - claudePassedCount} test(s) failed`
    });

    // XAI test results (dummy data for now)
    const xaiPassed = Math.random() > 0.25; // 75% pass rate
    const xaiTotal = Math.floor(Math.random() * 20) + 5;
    const xaiPassedCount = xaiPassed ? xaiTotal : Math.floor(xaiTotal * 0.65);

    results.push({
      llm: 'xai',
      filePath,
      passed: xaiPassed,
      totalTests: xaiTotal,
      passedTests: xaiPassedCount,
      failedTests: xaiTotal - xaiPassedCount,
      coverage: Math.floor(Math.random() * 35) + 65, // 65-100%
      executionTime: Math.random() * 3 + 0.5,
      details: xaiPassed ? 'All tests passed' : `${xaiTotal - xaiPassedCount} test(s) failed`
    });

    testResults[filePath] = results;
  });

  return {
    testResults,
    cicdStatus: [
      {
        pipeline: 'Build & Test',
        status: 'success',
        lastRun: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        pipeline: 'Security Scan',
        status: 'success',
        lastRun: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString()
      },
      {
        pipeline: 'Deploy to Staging',
        status: 'running',
        lastRun: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        pipeline: 'Performance Tests',
        status: 'failed',
        lastRun: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
      }
    ]
  };
}

// Main function to generate all role-based data
export async function generateAllRoleData(owner: string, repo: string, files: string[]) {
  const [financeData, hrData, pmData, devOpsData] = await Promise.all([
    generateFinanceData(owner, repo, files),
    generateHRData(owner, repo, files),
    generatePMData(owner, repo, files),
    generateDevOpsData(files)
  ]);

  return {
    financeData,
    hrData,
    pmData,
    devOpsData
  };
}
