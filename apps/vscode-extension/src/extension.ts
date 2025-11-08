import * as vscode from 'vscode';
import { BonFireViewProvider } from './views/BonFireViewProvider';
import { DependencyTreeProvider } from './views/DependencyTreeProvider';
import { MCPStatusProvider } from './views/MCPStatusProvider';

export function activate(context: vscode.ExtensionContext) {
  console.log('🔥 BonFire extension is now active!');

  // Register 3D visualization webview provider
  const bonFireViewProvider = new BonFireViewProvider(context.extensionUri);
  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      'bonfire.view',
      bonFireViewProvider
    )
  );

  // Register dependency tree view
  const dependencyProvider = new DependencyTreeProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'bonfire.dependencies',
      dependencyProvider
    )
  );

  // Register MCP status view
  const mcpStatusProvider = new MCPStatusProvider();
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'bonfire.mcp',
      mcpStatusProvider
    )
  );

  // Register commands
  context.subscriptions.push(
    vscode.commands.registerCommand('bonfire.visualize', async () => {
      const workspaceFolders = vscode.workspace.workspaceFolders;
      if (!workspaceFolders) {
        vscode.window.showErrorMessage('No workspace folder open');
        return;
      }

      await bonFireViewProvider.visualizeWorkspace(workspaceFolders[0].uri.fsPath);
      vscode.window.showInformationMessage('🔥 Visualizing repository...');
    }),

    vscode.commands.registerCommand('bonfire.analyze', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor) {
        vscode.window.showErrorMessage('No active file to analyze');
        return;
      }

      await bonFireViewProvider.analyzeFile(editor.document.uri.fsPath);
      vscode.window.showInformationMessage('🔍 Analyzing code...');
    }),

    vscode.commands.registerCommand('bonfire.deploy', async () => {
      const result = await vscode.window.showQuickPick([
        'Development',
        'Staging',
        'Production'
      ], {
        placeHolder: 'Select deployment environment'
      });

      if (result) {
        vscode.window.showInformationMessage(`🚀 Deploying to ${result}...`);
        // Trigger MCP deployment workflow
      }
    }),

    vscode.commands.registerCommand('bonfire.showDependencies', async () => {
      dependencyProvider.refresh();
      vscode.window.showInformationMessage('📊 Refreshing dependencies...');
    })
  );

  // Show welcome message
  vscode.window.showInformationMessage(
    '🔥 BonFire is ready! Use Command Palette (Ctrl+Shift+P) to access features.'
  );
}

export function deactivate() {
  console.log('🔥 BonFire extension deactivated');
}
