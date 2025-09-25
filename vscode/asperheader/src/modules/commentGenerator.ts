import * as vscode from 'vscode';
import * as CONST from "../constants";
import { query } from './querier';
import { logger } from './logger';
import { getMessage } from './messageProvider';
import { LazyFileLoader } from './lazyFileLoad';

interface CommentStyle {
    singleLine: string[];
    multiLine: string[];
    prompt_comment_opening_type: boolean;
}

export class CommentGenerator {
    // Class in charge of building the comment that will be added to the target file
    private Const = CONST;
    private languageComment: LazyFileLoader | undefined = undefined;
    private documentBody: vscode.TextDocument | undefined = undefined;
    private filePath: string | undefined = undefined;
    private fileName: string | undefined = undefined;
    private fileExtension: string | undefined = undefined;
    private languageId: string | undefined = undefined;
    private documentEOL: vscode.EndOfLine | undefined = undefined;
    private documentVersion: number | undefined = undefined;
    private headerInnerStart: number | undefined = undefined;
    private headerInnerEnd: number | undefined = undefined;
    private maxScanLength: number = this.Const.defaultMaxScanLength;
    private headerLogo: string[] = this.Const.defaultHeaderLogo;
    private projectName: string = this.Const.extensionName;
    private projectCopyRight: string = this.Const.projectCopyright;
    private addBlankLineAfterMultiline: boolean = this.Const.headerAddBlankLineAfterMultiline;

    constructor(languageComment: LazyFileLoader | undefined = undefined, editor: vscode.TextEditor | undefined = undefined) {
        if (languageComment !== undefined) {
            this.languageComment = languageComment;
        } else {
            logger.warning(getMessage("missingLanguageComment"));
        }
        if (!editor) {
            logger.warning(getMessage("noFocusedEditors"));
        } else {
            this.updateFileInfo(editor);
        }
    }

    private determineNewLine(eol: vscode.EndOfLine): string {
        if (eol === vscode.EndOfLine.LF) {
            return "\n";
        } else {
            return "\r\n";
        }
    }

    private headerOpener(comment: string, eol: vscode.EndOfLine, projectName: string = this.Const.extensionName): string {
        let final: string = comment + this.Const.headerOpenerDecorationOpen;
        final += this.Const.telegraphBegin + " ";
        final += projectName;
        final += this.Const.headerOpenerDecorationClose;
        final += this.determineNewLine(eol);
        return final;
    }

    private async determineCorrectComment(): Promise<CommentStyle> {
        const primaryKey: string = "langs";
        let commentStructure: CommentStyle = {
            singleLine: [],
            multiLine: [],
            prompt_comment_opening_type: false,
        };
        if (this.languageComment === undefined) {
            logger.Gui.error(getMessage("missingFileError"));
            return commentStructure;
        }
        const jsonContent = await this.languageComment?.get();
        logger.info(getMessage("jsonContent", JSON.stringify(jsonContent)));
        if ((primaryKey in jsonContent) === false) {
            logger.Gui.error(getMessage("unknownFileStructure"));
            return commentStructure;
        }
        if (Array.isArray(jsonContent[primaryKey]) === false) {
            logger.Gui.error(getMessage("unknownFileStructure"));
            return commentStructure;
        }
        let index = 0;
        const languageNodes = jsonContent[primaryKey];
        let locatedName: string = "";
        for (; index < languageNodes.length; index++) {
            let nodeFound = false;
            const node = languageNodes[index];

            const nodeLangs: string[] = node.langs ?? [];
            const nodeFileExtensions: Record<string, string[]> = node.fileExtensions ?? {};

            for (let langIndex = 0; langIndex < nodeLangs.length; langIndex++) {
                const langName = nodeLangs[langIndex].toLowerCase();
                locatedName = langName;

                if (langName === this.languageId?.toLowerCase()) {
                    nodeFound = true;
                    break;
                }

                if (this.fileExtension) {
                    const extensionsForLang = nodeFileExtensions[langName] ?? [];
                    for (let extIndex = 0; extIndex < extensionsForLang.length; extIndex++) {
                        if (extensionsForLang[extIndex] === `.${this.fileExtension}`) {
                            nodeFound = true;
                            break;
                        }
                    }
                }

                if (nodeFound) {
                    break;
                }
            }

            if (nodeFound) {
                logger.Gui.info(getMessage("identifiedLanguage", locatedName));
                logger.info(getMessage("arrayNodeContent", `Json[${primaryKey}]`, index, node));
                commentStructure.singleLine = node.singleLine ?? [];
                commentStructure.multiLine = node.multiLine ?? [];
                commentStructure.prompt_comment_opening_type = node.prompt_comment_opening_type ?? false;
                break;
            }
            logger.debug(getMessage("arrayNodeContent", `Json[${primaryKey}]`, index, node));
        }
        return commentStructure;
    }

    private async determineHeaderDescription(): Promise<string[]> {
        let final: string[] = [];
        const usrResponse: string | undefined = await query.input(getMessage("getHeaderDescription"));
        final.push(usrResponse || "");
        return final;
    }

    private async determineHeaderTags(): Promise<string[]> {
        let final: string[] = [];
        const usrResponse: string | undefined = await query.input(getMessage("getHeaderTags"));
        final.push(usrResponse || "");
        return final;
    }

    private async determineHeaderPurpose(): Promise<string[]> {
        let final: string[] = [];
        const usrResponse: string | undefined = await query.input(getMessage("getHeaderPurpose"));
        final.push(usrResponse || "");
        return final;
    }

    private async getSingleCommentOption(commentOptions: string[]): Promise<string> {
        if (commentOptions.length === 0) {
            logger.Gui.error(getMessage("noCommentToShow"));
            throw Error(getMessage("noCommentToShow"));
        }
        if (commentOptions.length === 1) {
            logger.info(getMessage("noProvidedCommentOptions"));
            return commentOptions[0];
        }
        const response: string | undefined = await query.quickPick(commentOptions, getMessage("chooseSingleLineCommentOption"));
        return response || commentOptions[0];
    }

    private addKeyDefinitionSeparator(): string {
        const userSettingDefinedElement: string = this.Const.headerKeyDefinitionSeparator;
        return userSettingDefinedElement || this.Const.headerKeyDefinitionSeparator;
    }

    private addCreationDate(comment: string, eol: vscode.EndOfLine) {
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = now.getFullYear();
        const separatorDay: string = this.Const.headerDateSeperatorDay;
        const separatorMonth: string = this.Const.headerDateSeperatorMonth;
        const separatorYear: string = this.Const.headerDateSeperatorYear;
        let final: string = comment + this.Const.headerCreationDateKey + this.addKeyDefinitionSeparator();
        final += `${day}${separatorDay}${month}${separatorMonth}${year}${separatorYear}`;
        final += this.determineNewLine(eol);
        return final;
    }
    private addLastModifiedDate(comment: string, eol: vscode.EndOfLine) {
        const now: Date = new Date();
        const day: string = String(now.getDate()).padStart(2, "0");
        const month: string = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year: number = now.getFullYear();
        const hour: number = now.getHours();
        const minute: number = now.getMinutes();
        const seconds: number = now.getSeconds();
        const separatorDay: string = this.Const.headerDateSeperatorDay;
        const separatorMonth: string = this.Const.headerDateSeperatorMonth;
        const separatorYear: string = this.Const.headerDateSeperatorYear;
        const separatorTimeAndDate: string = this.Const.headerTimeAndDateSeperator;
        const separatorSecond: string = this.Const.headerTimeSeperatorSecond;
        const separatorMinute: string = this.Const.headerTimeSeperatorMinute;
        const separatorHour: string = this.Const.headerTimeSeperatorHour;
        let final: string = comment + this.Const.headerLastModifiedKey + this.addKeyDefinitionSeparator();
        final += `${hour}${separatorHour}${minute}${separatorMinute}${seconds}${separatorSecond}${separatorTimeAndDate}${day}${separatorDay}${month}${separatorMonth}${year}${separatorYear}`;
        final += this.determineNewLine(eol);
        return final;
    }

    private addMultilineKey(comment: string, eol: vscode.EndOfLine, tagName: string, tagDefinition: string[]): string {
        const eolStr: string = this.determineNewLine(eol);
        let final: string = comment + tagName + this.addKeyDefinitionSeparator() + eolStr;
        for (let i = 0; i < tagDefinition.length; i++) {
            final += comment + tagDefinition[i] + eolStr;
        }
        final += comment + this.Const.telegraphBlockStop + eolStr;
        if (this.addBlankLineAfterMultiline) {
            final += comment + eolStr;
        }
        return final;
    }

    private addSingleLineKey(comment: string, eol: vscode.EndOfLine, tagName: string, tagDefinition: string): string {
        let final: string = comment + tagName + this.addKeyDefinitionSeparator();
        final += tagDefinition + this.determineNewLine(eol);
        return final;
    }

    private beforeHeaderCloser(comment: string, eol: vscode.EndOfLine): string {
        return comment + this.Const.telegraphEndOfTransmission + this.determineNewLine(eol);
    }

    private headerCloser(comment: string, eol: vscode.EndOfLine, projectName: string = this.Const.extensionName): string {
        let final: string = comment + this.Const.headerOpenerDecorationOpen;
        final += this.Const.telegraphEnd + " ";
        final += projectName;
        final += this.Const.headerOpenerDecorationClose;
        final += this.determineNewLine(eol);
        return final;
    }

    private updateFileInfo(editor: vscode.TextEditor) {
        this.headerInnerEnd = undefined;
        this.headerInnerStart = undefined;
        this.documentBody = editor.document;
        this.projectName = this.Const.extensionName;
        this.filePath = this.documentBody.uri.fsPath;
        this.projectCopyRight = this.Const.projectCopyright;
        this.addBlankLineAfterMultiline = this.Const.headerAddBlankLineAfterMultiline;
        this.maxScanLength = this.Const.defaultMaxScanLength + this.headerLogo.length;
        this.fileName = this.documentBody.uri.path.split('/').pop() || "unknown";
        if (this.fileName.includes('.')) {
            this.fileExtension = this.fileName.split('.').pop() || "none";
        } else {
            this.fileExtension = "none";
        };
        this.languageId = this.documentBody.languageId;
        this.documentEOL = this.documentBody.eol;
        this.documentVersion = this.documentBody.version;
    }


    private async buildTheHeader(determinedComment: CommentStyle): Promise<string[]> {
        const eol: vscode.EndOfLine = this.documentEOL || vscode.EndOfLine.LF;
        const unknownTerm: string = getMessage("unknown");
        let commentOpener: string = "";
        let commentMiddle: string = "";
        let commentCloser: string = "";
        if (determinedComment.multiLine.length >= 2) {
            commentOpener = determinedComment.multiLine[0];
            if (determinedComment.multiLine.length >= 3) {
                commentMiddle = determinedComment.multiLine[1];
                commentCloser = determinedComment.multiLine[2];
            } else {
                commentMiddle = "";
                commentCloser = determinedComment.multiLine[1];
            }
        } else if (determinedComment.singleLine.length > 0) {
            if (determinedComment.prompt_comment_opening_type) {
                // Ask the user for the type to use based on the single comments that are present.
                const commentString: string = await this.getSingleCommentOption(determinedComment.singleLine);
                commentOpener = commentString;
                commentMiddle = commentString;
                commentCloser = commentString;
            } else {
                commentOpener = determinedComment.singleLine[0];
                commentMiddle = determinedComment.singleLine[0];
                commentCloser = determinedComment.singleLine[0];
            }
        } else {
            commentOpener = "";
            commentMiddle = "";
            commentCloser = "";
        }
        commentOpener += this.Const.headerCommentSpacing;
        commentMiddle += this.Const.headerCommentSpacing;
        commentCloser += this.Const.headerCommentSpacing;
        let buildHeader: string[] = [];
        // Preparing the header content so that it can be put in a comment and written.
        if (commentOpener.length > 0) {
            buildHeader.push(`${commentOpener}${this.determineNewLine(eol)}`);
        }
        // Opening the header
        buildHeader.push(this.headerOpener(commentMiddle, eol, this.projectName));
        // The logo
        buildHeader.push(this.addMultilineKey(commentMiddle, eol, this.Const.headerLogoKey, this.headerLogo));
        // The project name
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Const.headerProjectKey, this.projectName));
        // The file name
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Const.headerFileKey, this.fileName || unknownTerm));
        // The Creation date
        buildHeader.push(this.addCreationDate(commentMiddle, eol));
        // The Last modified date
        buildHeader.push(this.addLastModifiedDate(commentMiddle, eol));
        // The description
        buildHeader.push(this.addMultilineKey(commentMiddle, eol, this.Const.headerDescriptionKey, await this.determineHeaderDescription()));
        // The copyright
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Const.headerCopyrightKey, this.projectCopyRight));
        // The Tag
        // buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Const.headerTagKey, (await this.determineHeaderTags()).join(",")));
        // The Purpose
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Const.headerPurposeKey, (await this.determineHeaderPurpose()).join(";")));
        // End of transmission telegraph
        buildHeader.push(this.beforeHeaderCloser(commentMiddle, eol));
        // Closing the header 
        buildHeader.push(this.headerCloser(commentMiddle, eol, this.projectName));
        if (commentCloser.length > 0) {
            buildHeader.push(`${commentCloser}${this.determineNewLine(eol)}`);
        }
        return buildHeader;
    }

    private async updateEditDate(editor: vscode.TextEditor) {

    }

    protected locateIfHeaderPresent(): boolean | undefined {
        this.headerInnerStart = undefined;
        this.headerInnerEnd = undefined;
        if (this.documentBody === undefined) {
            logger.error(getMessage("emptyDocument"));
            return undefined;
        }
        if (this.documentBody.isClosed) {
            logger.warning(getMessage("closedDocument"));
            return undefined;
        }
        const eol: vscode.EndOfLine = this.documentEOL ?? vscode.EndOfLine.LF;
        const opener: string = this.headerOpener("", eol);
        const closer: string = this.headerCloser("", eol);
        const scanLines: number = Math.min(this.maxScanLength, this.documentBody.lineCount);
        let lineOpenerFound: boolean = false;
        let lineCloserFound: boolean = false;
        for (let i = 0; i < scanLines; i++) {
            const lineText = this.documentBody.lineAt(i).text + this.determineNewLine(eol);
            if (lineText === opener && lineCloserFound) {
                logger.Gui.warning(getMessage("brokenHeader"));
                return false;
            }
            if (lineText === closer && !lineOpenerFound) {
                logger.Gui.warning(getMessage("brokenHeader"));
                return false;
            }
            if (lineText === opener && (!lineCloserFound && !lineOpenerFound)) {
                lineOpenerFound = true;
                this.headerInnerStart = i;
                logger.info(getMessage("headerOpenerFound"));
                continue;
            }
            if (lineText === closer && (!lineCloserFound && lineOpenerFound)) {
                this.headerInnerEnd = i;
                logger.info(getMessage("headerOpenerAndCloserFound"));
                return true;
            }
        }
        logger.Gui.warning(getMessage("documentLineScanExceeded", this.maxScanLength));
        return false;
    }

    private async writeHeaderToFile(editor: vscode.TextEditor): Promise<number> {
        let offset: number = 0;
        const determineComment: CommentStyle = await this.determineCorrectComment();
        const headerContent: string[] = await this.buildTheHeader(determineComment);
        // determine if the first line has a shebang like line on the first line, if true, add a new line, and write from that line.
        const headerString: string = headerContent.join("");
        await editor.edit(editBuilder => editBuilder.insert(new vscode.Position(offset, 0), headerString));
        return this.Const.statusSuccess;
    }
    async injectHeader() {
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            logger.error(getMessage("noFocusedEditors"));
            logger.Gui.error(getMessage("openFileToApplyHeader"));
            return;
        }
        this.updateFileInfo(editor);
        // Checking that the meta data is filled out.
        if (
            this.documentBody === undefined || this.filePath === undefined
            || this.fileName === undefined || this.fileExtension === undefined
            || this.languageId === undefined || this.documentEOL === undefined
            || this.documentVersion === undefined
        ) {
            logger.error(getMessage("corruptedFileMetaData"));
            logger.Gui.error(getMessage("errorDuringFunctionCall", "injectHeader"));
            return;
        }
        // Making sure that the target document is still open.
        if (this.documentBody.isClosed) {
            logger.warning(getMessage("closedDocument"));
            logger.Gui.warning(getMessage("updateAbortedBecauseFileClosedSyncCancelled"));
            return;
        }
        const msg = "this.documentBody = '" + JSON.stringify(this.documentBody) + "', this.filePath = '" + JSON.stringify(this.filePath) + "', this.fileName = '" + JSON.stringify(this.fileName) + "', this.fileExtension = '" + JSON.stringify(this.fileExtension) + "', this.languageId = '" + JSON.stringify(this.languageId) + "', this.documentEOL = '" + JSON.stringify(this.documentEOL) + "', this.documentVersion = '" + JSON.stringify(this.documentVersion) + "'";
        logger.Gui.debug(msg);
        logger.debug(msg);
        let response: boolean | undefined = this.locateIfHeaderPresent();
        if (response === undefined) {
            logger.Gui.warning(getMessage("updateAbortedBecauseFileClosedSyncCancelled"));
            return;
        }
        if (response === true) {
            logger.Gui.info(getMessage("updatingEditionDate"));
            await this.updateEditDate(editor);
            return;
        }
        if (response === false) {
            let status: number = await this.writeHeaderToFile(editor);
            if (status === this.Const.statusError) {
                logger.Gui.error(getMessage("headerWriteFailed"));
                return;
            }
            logger.Gui.info(getMessage("headerWriteSuccess"));
        }
    }
}
