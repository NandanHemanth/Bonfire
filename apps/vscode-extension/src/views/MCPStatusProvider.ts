import * as vscode from 'vscode';

class MCPStatus extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly status: 'active' | 'inactive' | 'error',
    public readonly description?: string
  ) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.tooltip = description || label;
    this.iconPath = this.getStatusIcon();
  }

  private getStatusIcon(): vscode.ThemeIcon {
    switch (this.status) {
      case 'active':
        return new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
      case 'inactive':
        return new vscode.ThemeIcon('circle-outline', new vscode.ThemeColor('charts.gray'));
      case 'error':
        return new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
    }
  }
}

export class MCPStatusProvider implements vscode.TreeDataProvider<MCPStatus> {
  private _onDidChangeTreeData: vscode.EventEmitter<MCPStatus | undefined | null | void> =
    new vscode.EventEmitter<MCPStatus | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<MCPStatus | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: MCPStatus): vscode.TreeItem {
    return element;
  }

  getChildren(element?: MCPStatus): MCPStatus[] {
    if (element) {
      return [];
    }

    return this.getMCPServers();
  }

  private getMCPServers(): MCPStatus[] {
    // This would check actual MCP server status
    return [
      new MCPStatus('Finance MCP', 'active', 'Budget & cost tracking'),
      new MCPStatus('HR MCP', 'active', 'Team ownership & capacity'),
      new MCPStatus('CI/CD MCP', 'active', 'Deployment pipelines'),
      new MCPStatus('Security MCP', 'inactive', 'Security scans')
    ];
  }
}
