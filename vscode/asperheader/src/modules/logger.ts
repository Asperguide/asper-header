import * as vscode from 'vscode';
import { CodeConfig } from "./processConfiguration";

class LoggerInternals {
    constructor() { }
    getCorrectPrefix(info: boolean, warning: boolean, error: boolean, debug: boolean): string {
        if (info) {
            return "INFO: ";
        } else if (warning) {
            return "WARNING: ";
        } else if (error) {
            return "ERROR: ";
        } else if (debug) {
            return "DEBUG: ";
        } else {
            return "";
        }
    }

    getDatetime(): string {
        let date: Date = new Date();
        let finalString: string = "[";
        finalString += date.getDate() + "-";
        finalString += date.getMonth() + "-";
        finalString += date.getFullYear() + " ";
        finalString += date.getHours() + ":";
        finalString += date.getMinutes() + ":";
        finalString += date.getSeconds() + ".";
        finalString += date.getMilliseconds();
        finalString += "]";
        return finalString;
    }

    getParentCaller(searchDepth: number = 2): string | undefined {
        const stack = new Error().stack;
        if (!stack) {
            return undefined;
        };

        const lines = stack.split("\n").map(line => line.trim());

        // Ensure the requested search depth exists in the stack
        if (lines.length > searchDepth) {
            const match = lines[searchDepth].match(/at (\w+)/);
            if (match) {
                return match[1];
            };
        }

        return undefined;
    }

    debugEnabled(): boolean {
        return CodeConfig.getVariable("enableDebug");
    }
}

class Gui {
    private LI: LoggerInternals;
    constructor(loggerInternals: LoggerInternals, depthSearch: number | undefined = undefined) {
        this.LI = loggerInternals;
    };
    info<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        let final: string = "";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " '" + message + "'";
        return vscode.window.showInformationMessage<T>(message, ...items);
    };
    warning<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " '" + message + "'";
        return vscode.window.showWarningMessage<T>(message, ...items);
    };
    error<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, true, false);
        final += " '" + message + "'";
        return vscode.window.showErrorMessage<T>(message, ...items);
    }
    debug<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        if (!this.LI.debugEnabled()) {
            return Promise.resolve(undefined);
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, false, true);
        final += " '" + message + "'";
        return vscode.window.showInformationMessage<T>(final, ...items);
    }
}

class Log {
    private depthSearch: number = 3;
    private LI: LoggerInternals = new LoggerInternals();
    public Gui: Gui = new Gui(this.LI);
    constructor() { };
    info(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.log(final);
    };
    warning(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.warn(final);
    };
    error(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, true, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.error(final);
    };
    debug(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.getVariable("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, false, true);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.debug(final);
    };
}

const instance = new Log();

export const logger: Log = instance;

export type LogType = Log;
