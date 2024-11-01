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
    const extensionName = 'recentlyOpenedSweeper'
    const keepCountConfigName = 'keepEntries.count'
    const commandName = `${extensionName}.sweep`

    const config = vscode.workspace.getConfiguration(extensionName)
    let keepCount = config.get<number>(keepCountConfigName, -1)

    context.subscriptions.push(
        vscode.commands.registerCommand(commandName, async function () {
            // The "_workbench.getRecentlyOpened" is a private API.
            // This issue https://github.com/microsoft/vscode/issues/124577 proposes to turn it public, which still hasn't happened yet
            const recentlyOpened = await vscode.commands.executeCommand<IRecentlyOpened>('_workbench.getRecentlyOpened')
            const toDelete = []

            let validCount = 0
            for (const ws of recentlyOpened.workspaces) {
                let uri
                if ('folderUri' in ws) {
                    uri = ws.folderUri
                } else if ('workspace' in ws) {
                    uri = ws.workspace.configPath
                }

                if (uri) {
                    if ((keepCount >= 0 && validCount >= keepCount) || (uri.scheme === 'file' && !fs.existsSync(uri.fsPath))) {
                        toDelete.push(uri.fsPath)
                    } else {
                        validCount += 1
                    }
                }
            }

            validCount = 0
            for (const file of recentlyOpened.files) {
                const path = file.fileUri.fsPath
                if ((keepCount >= 0 && validCount >= keepCount) || !fs.existsSync(path)) {
                    toDelete.push(path)
                } else {
                    validCount += 1
                }
            }

            for (const path of toDelete) {
                vscode.commands.executeCommand('vscode.removeFromRecentlyOpened', path)
            }
        }),
        vscode.workspace.onDidChangeConfiguration(evt => {
            if (evt.affectsConfiguration(`${extensionName}.${keepCountConfigName}`)) {
                keepCount = vscode.workspace.getConfiguration(extensionName).get<number>(keepCountConfigName, -1)
            }
        }),
    )

    if (config.get<boolean>('runAtStartup.enabled', true)) {
        vscode.commands.executeCommand(commandName)
    }
}

export function deactivate() { }
