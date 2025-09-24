import * as vscode from 'vscode';
import { logger } from './logger';
import { getMessage } from './messageProvider';

export class Query {
    private constructor() { }

    /** Singleton instance */
    private static _instance: Query;
    public static get instance(): Query {
        if (!this._instance) {
            this._instance = new Query();
        }
        return this._instance;
    }

    /** Show an input box to the user */
    public async input(promptText: string, options?: vscode.InputBoxOptions): Promise<string | undefined> {
        try {
            const result = await vscode.window.showInputBox({
                prompt: promptText,
                ...options
            });
            return result;
        } catch (err) {
            logger.error(getMessage("inputboxError", promptText, err));
            return undefined;
        }
    }

    /** Show a quick pick list */
    public async quickPick(items: string[], placeholder: string): Promise<string | undefined> {
        try {
            const result = await vscode.window.showQuickPick(items, {
                placeHolder: placeholder
            });
            return result;
        } catch (err) {
            logger.error(getMessage("quickPickError", err));
            return undefined;
        }
    }

    /** Confirm yes/no */
    public async confirm(promptText: string): Promise<boolean> {
        const yes: string = getMessage("quickPickYes");
        const no: string = getMessage("quickPickNo");
        const selection = await vscode.window.showQuickPick([yes, no], { placeHolder: promptText });
        return selection === yes;
    }
}

/** Convenience singleton export */
export const query = Query.instance;
