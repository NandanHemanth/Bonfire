import { WebClient } from '@slack/web-api';
import { Client } from '@microsoft/microsoft-graph-client';
import 'isomorphic-fetch';
import axios from 'axios';

// Slack Client
export class SlackIntegrationClient {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async sendMessage(channel: string, text: string) {
    return await this.client.chat.postMessage({
      channel,
      text,
    });
  }

  async testConnection() {
    try {
      await this.client.auth.test();
      return true;
    } catch {
      return false;
    }
  }
}

// Jira Client
export class JiraIntegrationClient {
  private baseUrl: string;
  private email: string;
  private apiToken: string;

  constructor(baseUrl: string, email: string, apiToken: string) {
    this.baseUrl = baseUrl;
    this.email = email;
    this.apiToken = apiToken;
  }

  private getAuthHeader() {
    return 'Basic ' + Buffer.from(`${this.email}:${this.apiToken}`).toString('base64');
  }

  async createIssue(projectKey: string, summary: string, description: string, issueType = 'Task') {
    const response = await axios.post(
      `${this.baseUrl}/rest/api/3/issue`,
      {
        fields: {
          project: { key: projectKey },
          summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: description }],
              },
            ],
          },
          issuetype: { name: issueType },
        },
      },
      {
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data;
  }

  async getIssue(issueKey: string) {
    const response = await axios.get(`${this.baseUrl}/rest/api/3/issue/${issueKey}`, {
      headers: {
        Authorization: this.getAuthHeader(),
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  }

  async testConnection() {
    try {
      await axios.get(`${this.baseUrl}/rest/api/3/myself`, {
        headers: {
          Authorization: this.getAuthHeader(),
          'Content-Type': 'application/json',
        },
      });
      return true;
    } catch {
      return false;
    }
  }
}

// Microsoft Graph Client
export class MicrosoftGraphClient {
  private client: Client;

  constructor(accessToken: string) {
    this.client = Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  // Email operations
  async sendEmail(to: string, subject: string, body: string) {
    const sendMail = {
      message: {
        subject,
        body: {
          contentType: 'Text',
          content: body,
        },
        toRecipients: [
          {
            emailAddress: {
              address: to,
            },
          },
        ],
      },
    };

    return await this.client.api('/me/sendMail').post(sendMail);
  }

  // Calendar operations
  async createCalendarEvent(subject: string, start: string, end: string, attendees: string[]) {
    const event = {
      subject,
      start: {
        dateTime: start,
        timeZone: 'UTC',
      },
      end: {
        dateTime: end,
        timeZone: 'UTC',
      },
      attendees: attendees.map((email) => ({
        emailAddress: { address: email },
        type: 'required',
      })),
    };

    return await this.client.api('/me/calendar/events').post(event);
  }

  async getCalendarEvents(startDate: string, endDate: string) {
    return await this.client
      .api('/me/calendar/events')
      .filter(`start/dateTime ge '${startDate}' and end/dateTime le '${endDate}'`)
      .select('subject,start,end,attendees')
      .get();
  }

  // OneDrive operations
  async uploadFile(fileName: string, content: Buffer) {
    return await this.client
      .api(`/me/drive/root:/${fileName}:/content`)
      .put(content);
  }

  async listFiles() {
    return await this.client.api('/me/drive/root/children').get();
  }

  // User operations
  async getCurrentUser() {
    return await this.client.api('/me').get();
  }

  async testConnection() {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }

  // Teams operations
  async sendTeamsMessage(teamId: string, channelId: string, message: string) {
    const chatMessage = {
      body: {
        content: message,
      },
    };

    return await this.client
      .api(`/teams/${teamId}/channels/${channelId}/messages`)
      .post(chatMessage);
  }
}

// Generic OAuth2 Token Manager for Microsoft
export class MicrosoftOAuthManager {
  private clientId: string;
  private clientSecret: string;
  private tenantId: string;

  constructor(clientId: string, clientSecret: string, tenantId: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.tenantId = tenantId;
  }

  async getAccessToken(scopes: string[] = ['https://graph.microsoft.com/.default']) {
    const tokenEndpoint = `https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`;

    const params = new URLSearchParams({
      client_id: this.clientId,
      client_secret: this.clientSecret,
      scope: scopes.join(' '),
      grant_type: 'client_credentials',
    });

    const response = await axios.post(tokenEndpoint, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data.access_token;
  }
}

// GitHub Client
export class GitHubIntegrationClient {
  private token: string;
  private baseUrl = 'https://api.github.com';

  constructor(token: string) {
    this.token = token;
  }

  private getHeaders() {
    return {
      Authorization: `token ${this.token}`,
      'User-Agent': 'BonFire-Integration',
      Accept: 'application/vnd.github.v3+json',
    };
  }

  async createIssue(owner: string, repo: string, title: string, body: string) {
    const response = await axios.post(
      `${this.baseUrl}/repos/${owner}/${repo}/issues`,
      { title, body },
      { headers: this.getHeaders() }
    );

    return response.data;
  }

  async getIssues(owner: string, repo: string) {
    const response = await axios.get(
      `${this.baseUrl}/repos/${owner}/${repo}/issues`,
      { headers: this.getHeaders() }
    );

    return response.data;
  }

  async testConnection() {
    try {
      await axios.get(`${this.baseUrl}/user`, { headers: this.getHeaders() });
      return true;
    } catch {
      return false;
    }
  }
}
