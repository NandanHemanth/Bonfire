import * as vscode from 'vscode';

export class Dependency extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly type: 'file' | 'function' | 'import',
    public readonly children: Dependency[] = [],
    public readonly collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label} (${this.type})`;
    this.contextValue = this.type;
  }

  iconPath = this.getIcon();

  private getIcon(): vscode.ThemeIcon {
    switch (this.type) {
      case 'file':
        return new vscode.ThemeIcon('file-code');
      case 'function':
        return new vscode.ThemeIcon('symbol-function');
      case 'import':
        return new vscode.ThemeIcon('symbol-namespace');
      default:
        return new vscode.ThemeIcon('symbol-misc');
    }
  }
}

export class DependencyTreeProvider implements vscode.TreeDataProvider<Dependency> {
  private _onDidChangeTreeData: vscode.EventEmitter<Dependency | undefined | null | void> =
    new vscode.EventEmitter<Dependency | undefined | null | void>();
  readonly onDidChangeTreeData: vscode.Event<Dependency | undefined | null | void> =
    this._onDidChangeTreeData.event;

  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  getTreeItem(element: Dependency): vscode.TreeItem {
    return element;
  }

  getChildren(element?: Dependency): Dependency[] {
    if (!element) {
      // Return root dependencies
      return this.getRootDependencies();
    }
    return element.children;
  }

  private getRootDependencies(): Dependency[] {
    // This would be populated by analyzing the workspace
    return [
      new Dependency('express', 'import', [
        new Dependency('Router', 'function'),
        new Dependency('Request', 'function')
      ], vscode.TreeItemCollapsibleState.Collapsed),
      new Dependency('react', 'import', [
        new Dependency('useState', 'function'),
        new Dependency('useEffect', 'function')
      ], vscode.TreeItemCollapsibleState.Collapsed)
    ];
  }
}
