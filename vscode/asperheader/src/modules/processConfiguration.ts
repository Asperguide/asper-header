import * as vscode from 'vscode';
import * as CONST from '../constants';

class Configuration {
    private statusError: number = CONST.statusError;
    private statusSuccess: number = CONST.statusSuccess;
    private extensionName: string = CONST.extensionName;
    private moduleName: string = CONST.moduleName;
    private projectCopyright: string = CONST.projectCopyright;
    private headerOpenerDecorationOpen: string = CONST.headerOpenerDecorationOpen;
    private headerOpenerDecorationClose: string = CONST.headerOpenerDecorationClose;
    private headerCommentSpacing: string = CONST.headerCommentSpacing;
    private telegraphBegin: string = CONST.telegraphBegin;
    private telegraphEnd: string = CONST.telegraphEnd;
    private telegraphBlockStop: string = CONST.telegraphBlockStop;
    private telegraphEndOfTransmission: string = CONST.telegraphEndOfTransmission;
    private headerAddBlankLineAfterMultiline: boolean = CONST.headerAddBlankLineAfterMultiline;
    private headerKeyDefinitionSeparator: string = CONST.headerKeyDefinitionSeparator;
    private headerLogoKey: string = CONST.headerLogoKey;
    private headerProjectKey: string = CONST.headerProjectKey;
    private headerFileKey: string = CONST.headerFileKey;
    private headerCreationDateKey: string = CONST.headerCreationDateKey;
    private headerLastModifiedKey: string = CONST.headerLastModifiedKey;
    private headerDescriptionKey: string = CONST.headerDescriptionKey;
    private headerCopyrightKey: string = CONST.headerCopyrightKey;
    private headerTagKey: string = CONST.headerTagKey;
    private headerPurposeKey: string = CONST.headerPurposeKey;
    private headerTimeSeperatorHour: string = CONST.headerTimeSeperatorHour;
    private headerTimeSeperatorMinute: string = CONST.headerTimeSeperatorMinute;
    private headerTimeSeperatorSecond: string = CONST.headerTimeSeperatorSecond;
    private headerTimeAndDateSeperator: string = CONST.headerTimeAndDateSeperator;
    private headerDateSeperatorDay: string = CONST.headerDateSeperatorDay;
    private headerDateSeperatorMonth: string = CONST.headerDateSeperatorMonth;
    private headerDateSeperatorYear: string = CONST.headerDateSeperatorYear;
    private headerLogo: string[] = CONST.defaultHeaderLogo;
    private maxScanLength: number = CONST.defaultMaxScanLength;
    private enableDebug: boolean = CONST.enableDebug;
    private refreshOnSave: boolean = CONST.refreshOnSave;
    private promptToCreateIfMissing: boolean = CONST.promptToCreateIfMissing;
    private randomLogo: boolean = CONST.randomLogo;
    private extensionIgnore: string[] = CONST.extensionIgnore;

    async refreshVariables(): Promise<void> {
        const config = vscode.workspace.getConfiguration(CONST.moduleName);

        this.extensionName = config.get<string>("extensionName", CONST.extensionName);
        this.projectCopyright = config.get<string>("projectCopyright", CONST.projectCopyright);
        this.headerOpenerDecorationOpen = config.get<string>("headerOpenerDecorationOpen", CONST.headerOpenerDecorationOpen);
        this.headerOpenerDecorationClose = config.get<string>("headerOpenerDecorationClose", CONST.headerOpenerDecorationClose);
        this.headerCommentSpacing = config.get<string>("headerCommentSpacing", CONST.headerCommentSpacing);
        this.telegraphBegin = config.get<string>("telegraphBegin", CONST.telegraphBegin);
        this.telegraphEnd = config.get<string>("telegraphEnd", CONST.telegraphEnd);
        this.telegraphBlockStop = config.get<string>("telegraphBlockStop", CONST.telegraphBlockStop);
        this.telegraphEndOfTransmission = config.get<string>("telegraphEndOfTransmission", CONST.telegraphEndOfTransmission);
        this.headerAddBlankLineAfterMultiline = config.get<boolean>("headerAddBlankLineAfterMultiline", CONST.headerAddBlankLineAfterMultiline);
        this.headerKeyDefinitionSeparator = config.get<string>("headerKeyDefinitionSeparator", CONST.headerKeyDefinitionSeparator);
        this.headerLogoKey = config.get<string>("headerLogoKey", CONST.headerLogoKey);
        this.headerProjectKey = config.get<string>("headerProjectKey", CONST.headerProjectKey);
        this.headerFileKey = config.get<string>("headerFileKey", CONST.headerFileKey);
        this.headerCreationDateKey = config.get<string>("headerCreationDateKey", CONST.headerCreationDateKey);
        this.headerLastModifiedKey = config.get<string>("headerLastModifiedKey", CONST.headerLastModifiedKey);
        this.headerDescriptionKey = config.get<string>("headerDescriptionKey", CONST.headerDescriptionKey);
        this.headerCopyrightKey = config.get<string>("headerCopyrightKey", CONST.headerCopyrightKey);
        this.headerTagKey = config.get<string>("headerTagKey", CONST.headerTagKey);
        this.headerPurposeKey = config.get<string>("headerPurposeKey", CONST.headerPurposeKey);
        this.headerTimeSeperatorHour = config.get<string>("headerTimeSeperatorHour", CONST.headerTimeSeperatorHour);
        this.headerTimeSeperatorMinute = config.get<string>("headerTimeSeperatorMinute", CONST.headerTimeSeperatorMinute);
        this.headerTimeSeperatorSecond = config.get<string>("headerTimeSeperatorSecond", CONST.headerTimeSeperatorSecond);
        this.headerTimeAndDateSeperator = config.get<string>("headerTimeAndDateSeperator", CONST.headerTimeAndDateSeperator);
        this.headerDateSeperatorDay = config.get<string>("headerDateSeperatorDay", CONST.headerDateSeperatorDay);
        this.headerDateSeperatorMonth = config.get<string>("headerDateSeperatorMonth", CONST.headerDateSeperatorMonth);
        this.headerDateSeperatorYear = config.get<string>("headerDateSeperatorYear", CONST.headerDateSeperatorYear);
        this.headerLogo = config.get<string[]>("headerLogo", CONST.defaultHeaderLogo);
        this.maxScanLength = config.get<number>("maxScanLength", CONST.defaultMaxScanLength);
        this.enableDebug = config.get<boolean>("enableDebug", CONST.enableDebug);
        this.refreshOnSave = config.get<boolean>("refreshOnSave", CONST.refreshOnSave);
        this.promptToCreateIfMissing = config.get<boolean>("promptToCreateIfMissing", CONST.promptToCreateIfMissing);
        this.randomLogo = config.get<boolean>("randomLogo", CONST.randomLogo);
        this.extensionIgnore = config.get<string[]>("extensionIgnore", CONST.extensionIgnore);
    }

    getVariable(key: string): any {
        // fallback to CONST if no runtime override exists
        return (this as any)[key] ?? (CONST as any)[key];
    }

    get(key: string): any {
        // fallback to CONST if no runtime override exists
        return (this as any)[key] ?? (CONST as any)[key];
    }
}

const instance = new Configuration();
export const CodeConfig: Configuration = instance;
export type CodeConfigType = Configuration;
