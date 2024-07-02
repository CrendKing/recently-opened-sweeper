'use strict'

import * as fs from 'fs'
import * as vscode from 'vscode'

export interface IRecentlyOpened {
    workspaces: IRecentWorkspace[]
    files: IRecentFile[]
}

type IRecentWorkspace = {
    readonly folderUri: vscode.Uri
} | {
    readonly workspace: {
        configPath: vscode.Uri
    }
}

type IRecentFile = {
    readonly fileUri: vscode.Uri
}

export function activate(context: vscode.ExtensionContext) {
    const commandName = 'recently-opened-sweeper.sweep'

    const disposable = vscode.commands.registerCommand(commandName, async () => {
        // The "_workbench.getRecentlyOpened" is a private API.
        // This issue https://github.com/microsoft/vscode/issues/124577 proposes to turn it public, which still hasn't happened yet
        const recentlyOpened = await vscode.commands.executeCommand<IRecentlyOpened>('_workbench.getRecentlyOpened')
        const toDelete = []

        for (const ws of recentlyOpened.workspaces) {
            let uri
            if ('folderUri' in ws) {
                uri = ws.folderUri
            } else if ('workspace' in ws) {
                uri = ws.workspace.configPath
            }

            if (uri && uri.scheme === 'file' && !fs.existsSync(uri.fsPath)) {
                toDelete.push(uri.fsPath)
            }
        }

        for (const file of recentlyOpened.files) {
            const path = file.fileUri.fsPath
            if (!fs.existsSync(path)) {
                toDelete.push(path)
            }
        }

        for (const path of toDelete) {
            vscode.commands.executeCommand('vscode.removeFromRecentlyOpened', path)
        }
    })
    context.subscriptions.push(disposable)

    const config = vscode.workspace.getConfiguration('recently-opened-sweeper');
    if (config.get('runAtStartup')) {
        vscode.commands.executeCommand(commandName)
    }
}

export function deactivate() { }
