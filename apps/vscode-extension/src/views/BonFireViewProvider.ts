import * as vscode from 'vscode';

export class BonFireViewProvider implements vscode.WebviewViewProvider {
  constructor(private readonly _extensionUri: vscode.Uri) {}

  public resolveWebviewView(
    webviewView: vscode.WebviewView,
    context: vscode.WebviewViewResolveContext,
    _token: vscode.CancellationToken
  ) {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [this._extensionUri]
    };

    webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

    // Handle messages from the webview
    webviewView.webview.onDidReceiveMessage(async (data) => {
      switch (data.type) {
        case 'visualize':
          await this.visualizeWorkspace(data.path);
          break;
        case 'analyze':
          await this.analyzeFile(data.path);
          break;
        case 'triggerMCP':
          await this.triggerMCPAction(data.action, data.params);
          break;
      }
    });
  }

  public async visualizeWorkspace(path: string) {
    // Implementation for workspace visualization
    console.log('Visualizing workspace:', path);
  }

  public async analyzeFile(path: string) {
    // Implementation for file analysis
    console.log('Analyzing file:', path);
  }

  private async triggerMCPAction(action: string, params: any) {
    // Implementation for MCP actions
    console.log('Triggering MCP action:', action, params);
  }

  private _getHtmlForWebview(webview: vscode.Webview) {
    return `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BonFire 3D View</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #1e1e1e;
          color: #d4d4d4;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        #canvas-container {
          width: 100%;
          height: 400px;
          border: 1px solid #3e3e3e;
          border-radius: 4px;
          margin: 10px 0;
        }
        .controls {
          padding: 10px;
        }
        button {
          background-color: #0e639c;
          color: white;
          border: none;
          padding: 8px 16px;
          margin: 4px;
          border-radius: 2px;
          cursor: pointer;
        }
        button:hover {
          background-color: #1177bb;
        }
        .info {
          padding: 10px;
          font-size: 12px;
        }
      </style>
    </head>
    <body>
      <div class="controls">
        <h3>🔥 BonFire 3D Visualization</h3>
        <button onclick="visualize()">Visualize Repository</button>
        <button onclick="analyze()">Analyze Code</button>
      </div>
      <div id="canvas-container">
        <p style="text-align: center; padding-top: 150px;">
          Click "Visualize Repository" to start
        </p>
      </div>
      <div class="info">
        <p><strong>Tips:</strong></p>
        <ul>
          <li>Click nodes to explore code structure</li>
          <li>Drag to rotate view</li>
          <li>Scroll to zoom in/out</li>
        </ul>
      </div>
      <script>
        const vscode = acquireVsCodeApi();

        function visualize() {
          vscode.postMessage({
            type: 'visualize',
            path: ''
          });
        }

        function analyze() {
          vscode.postMessage({
            type: 'analyze',
            path: ''
          });
        }
      </script>
    </body>
    </html>`;
  }
}
