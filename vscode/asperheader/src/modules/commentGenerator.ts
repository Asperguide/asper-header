/**
 * @file commentGenerator.ts
 * @brief Comprehensive comment and header generation system for AsperHeader extension
 * @author Henry Letellier
 * @version 1.0.18
 * @since 1.0.0
 * @date 2025
 * 
 * This module serves as the core engine for generating, injecting, and managing 
 * file headers with customizable logos, project metadata, and timestamp tracking.
 * It provides intelligent comment style detection, multi-language support, and
 * seamless integration with the VS Code workspace environment.
 * 
 * Architecture Overview:
 * - **CommentGenerator**: Main orchestrator class managing header lifecycle
 * - **Language Detection**: Automatic identification of file types and comment styles
 * - **Template System**: Flexible header templates with variable substitution  
 * - **Logo Integration**: Dynamic logo selection from ASCII art collections
 * - **Metadata Management**: Creation date, modification tracking, and file properties
 * - **Configuration Integration**: Deep integration with {@link processConfiguration} system
 * 
 * Key Dependencies:
 * - {@link LazyFileLoader}: Lazy loading of language configuration files
 * - {@link RandomLogo}: ASCII art logo selection and management
 * - {@link Query}: User interaction and input validation
 * - {@link logger}: Comprehensive logging and error reporting
 * - {@link CodeConfig}: Extension configuration and workspace settings
 * 
 * Supported Features:
 * - Multi-line and single-line comment generation
 * - Language-specific comment syntax adaptation
 * - Automatic header refresh on file save
 * - Project name and workspace integration
 * - Telegraph-style protocol markers for structured headers
 * - Copyright and authorship attribution
 * - File description and purpose documentation
 * 
 * Integration Points:
 * This module integrates with the extension's save event handlers, workspace
 * configuration system, and user interface components to provide seamless
 * header management throughout the development workflow.
 * 
 * @example Basic header injection:
 * ```typescript
 * const generator = new CommentGenerator(lazyFileLoader);
 * generator.updateLogoInstanceRandomiser(randomLogo);
 * await generator.injectHeader(); // Injects header to active editor
 * ```
 * 
 * @example Automatic refresh setup:
 * ```typescript
 * // In extension activation
 * vscode.workspace.onDidSaveTextDocument(async (document) => {
 *     await generator.refreshHeader(document);
 * });
 * ```
 */

import * as vscode from 'vscode';
import { minimatch } from 'minimatch';
import { CodeConfig, CodeConfigType } from './processConfiguration';
import { query } from './querier';
import { logger } from './logger';
import { getMessage } from './messageProvider';
import { LazyFileLoader } from './lazyFileLoad';
import { RandomLogo, logo } from './randomLogo';

/**
 * @interface CommentStyle
 * @brief Defines comment style configuration for different programming languages
 * 
 * This interface specifies the comment syntax patterns used to generate
 * appropriate headers for different file types and programming languages.
 */
interface CommentStyle {
    /** @brief Array of single-line comment prefixes (e.g., "//", "#") */
    singleLine: string[];
    /** @brief Array of multi-line comment delimiters [opener, middle, closer] (e.g., ["/*", " *", " *\/"]) */
    multiLine: string[];
    /** @brief Whether to prompt user for comment type selection when multiple options exist */
    prompt_comment_opening_type: boolean;
    /** @brief Wether the language was identified or not */
    language?: string;
}

/**
 * @class CommentGenerator  
 * @brief Intelligent file header generation and management system
 * 
 * The CommentGenerator class serves as the central orchestrator for all header-related
 * operations within the AsperHeader extension. It provides comprehensive functionality
 * for creating, updating, and maintaining file headers with rich metadata, ASCII art
 * logos, and language-appropriate comment formatting.
 * 
 * Core Responsibilities:
 * - **Header Lifecycle Management**: Creation, injection, refresh, and validation
 * - **Language Adaptation**: Automatic detection and appropriate comment style selection
 * - **Template Processing**: Dynamic variable substitution in header templates
 * - **Logo Integration**: Seamless integration with {@link RandomLogo} for ASCII art
 * - **Metadata Tracking**: Creation timestamps, modification dates, and file properties
 * - **User Interaction**: Prompting for missing information and configuration
 * 
 * Architectural Features:
 * - **Lazy Loading**: Language configurations loaded on-demand for performance
 * - **Configuration Integration**: Deep coupling with {@link Configuration} settings
 * - **Error Resilience**: Comprehensive error handling and user feedback
 * - **Workspace Awareness**: Context-sensitive behavior based on workspace state
 * - **Multi-Language Support**: Extensible system supporting diverse programming languages
 * 
 * Header Structure:
 * Generated headers follow a structured format including:
 * - Opening decoration and logo placement
 * - Project identification and file metadata  
 * - Creation and modification timestamps
 * - Description, purpose, and copyright information
 * - Telegraph protocol markers for structured communication
 * - Closing decoration and formatting
 * 
 * Performance Considerations:
 * - Language configurations cached after first load
 * - Header parsing optimized for large files
 * - Minimal VS Code API calls to reduce overhead
 * - Efficient string manipulation and template processing
 * 
 * @example Advanced usage with configuration:
 * ```typescript
 * const generator = new CommentGenerator(configLoader);
 * generator.updateLogoInstanceRandomiser(logoProvider);
 * 
 * // Configure behavior
 * await generator.refreshHeader(document, {
 *     forceUpdate: true,
 *     preserveDescription: false
 * });
 * ```
 */
export class CommentGenerator {
    /** @brief Configuration object containing all extension settings */
    private Config: CodeConfigType = CodeConfig;
    /** @brief Random logo generator instance */
    private randomLogo: RandomLogo = new RandomLogo();
    /** @brief Lazy loader for language comment configuration */
    private languageComment: LazyFileLoader | undefined = undefined;
    /** @brief VS Code document being processed */
    private documentBody: vscode.TextDocument | undefined = undefined;
    /** @brief Full file system path of the current document */
    private filePath: string | undefined = undefined;
    /** @brief Name of the current file including extension */
    private fileName: string | undefined = undefined;
    /** @brief File extension without the dot (e.g., "ts", "js") */
    private fileExtension: string | undefined = undefined;
    /** @brief VS Code language identifier */
    private languageId: string | undefined = undefined;
    /** @brief End-of-line character type (LF or CRLF) */
    private documentEOL: vscode.EndOfLine | undefined = undefined;
    /** @brief Document version number for change tracking */
    private documentVersion: number | undefined = undefined;
    /** @brief Line number where header content starts (excluding opener) */
    private headerInnerStart: number | undefined = undefined;
    /** @brief Line number where header content ends (excluding closer) */
    private headerInnerEnd: number | undefined = undefined;
    /** @brief Maximum number of lines to scan when looking for existing headers */
    private maxScanLength: number = this.Config.get("maxScanLength");
    /** @brief Array of logo lines to display in header */
    private headerLogo: string[] = this.Config.get("headerLogo");
    /** @brief Project name to display in header */
    private projectName: string = this.Config.get("extensionName");
    /** @brief Copyright information */
    private projectCopyRight: string = this.Config.get("projectCopyright");
    /** @brief Whether to add blank line after multiline sections */
    private addBlankLineAfterMultiline: boolean = this.Config.get("headerAddBlankLineAfterMultiline");
    /** @brief The content to prepend to the comment before it is present */
    private languagePrepend: Record<string, string> = this.Config.get("languagePrepend");
    /** @brief The content to append to the comment after it is present */
    private languageAppend: Record<string, string> = this.Config.get("languageAppend");
    /** @brief Wether to follow a custom comment ruleset to override single line comments for a given language */
    private singleLineOverride: Record<string, string> = this.Config.get("languageSingleLineComment");
    /** @brief Wether to follow a custom comment ruleset to override multi line comments for a given language */
    private multiLineOverride: Record<string, string[]> = this.Config.get("languageMultiLineComment");
    /** @brief Wether to remove trailing spaces after a generated line */
    private trimTrailingSpaces: boolean = this.Config.get("removeTrailingHeaderSpaces");
    /** @brief Wether to choose single line comments when multi line comments are available */
    private preferSingleLineComments: boolean = this.Config.get("preferSingleLineComments");

    /**
     * @brief Constructor for CommentGenerator class
     * @param languageComment Optional lazy loader for language comment configurations
     * @param editor Optional VS Code text editor instance
     * @param randomLogoInstance Optional random logo generator instance
     * 
     * Initializes the comment generator with optional dependencies. If any parameter
     * is undefined, appropriate warnings are logged and defaults are used.
     */
    constructor(languageComment: LazyFileLoader | undefined = undefined, editor: vscode.TextEditor | undefined = undefined, randomLogoInstance: RandomLogo | undefined = undefined) {
        logger.debug(getMessage("inFunction", "constructor", "CommentGenerator"));
        if (languageComment !== undefined) {
            this.languageComment = languageComment;
            logger.debug(getMessage("foundLanguageComment"));
        } else {
            logger.warning(getMessage("missingLanguageComment"));
        }
        if (!editor) {
            logger.warning(getMessage("noFocusedEditors"));
        } else {
            this.updateFileInfo(editor.document);
            logger.debug(getMessage("foundFocusEditor"));
        }
        if (!randomLogoInstance) {
            logger.warning(getMessage("noLogoInstanceProvided"));
        } else {
            this.randomLogo = randomLogoInstance;
            logger.debug(getMessage("foundLogoInstance"));
        }
    }

    /**
     * @brief Converts VS Code EndOfLine enum to string representation
     * @param eol VS Code end-of-line type
     * @return String representation of newline character(s)
     * 
     * Converts the VS Code EndOfLine enumeration to the appropriate string
     * for use in text manipulation operations.
     */
    private determineNewLine(eol: vscode.EndOfLine): string {
        logger.debug(getMessage("inFunction", "determineNewLine", "CommentGenerator"));
        if (eol === vscode.EndOfLine.LF) {
            logger.debug(getMessage("foundNewLine", "\\n"));
            return "\n";
        } else {
            logger.debug(getMessage("foundNewLine", "\\r\\n"));
            return "\r\n";
        }
    }

    /**
     * @brief Generates the opening line of a file header
     * @param comment Comment prefix to use
     * @param eol End-of-line type for the document
     * @param projectName Name of the project (defaults to extension name)
     * @return Formatted header opening line
     * 
     * Creates the decorative opening line of the header with telegraph-style
     * formatting and project name.
     */
    private headerOpener(comment: string, eol: vscode.EndOfLine, projectName: string = this.Config.get("extensionName")): string {
        logger.debug(getMessage("inFunction", "headerOpener", "CommentGenerator"));
        let final: string = comment + this.Config.get("headerOpenerDecorationOpen");
        final += this.Config.get("telegraphBegin") + " ";
        final += projectName;
        final += this.Config.get("headerOpenerDecorationClose");
        final += this.determineNewLine(eol);
        return final;
    }

    /**
     * @brief Determines appropriate comment style for current file
     * @return Promise resolving to CommentStyle configuration
     * 
     * Analyzes the current file's language ID and extension to determine
     * the appropriate comment syntax from the language configuration file.
     * Supports both language ID matching and file extension fallback.
     */
    private async determineCorrectComment(): Promise<CommentStyle> {
        logger.debug(getMessage("inFunction", "determineCorrectComment", "CommentGenerator"));
        const primaryKey: string = "langs";
        let commentStructure: CommentStyle = {
            singleLine: [],
            multiLine: [],
            prompt_comment_opening_type: false,
            language: undefined,
        };
        if (this.languageComment === undefined) {
            logger.Gui.error(getMessage("missingFileError"));
            return commentStructure;
        }
        const jsonContent = await this.languageComment?.get();
        // logger.info(getMessage("jsonContent", JSON.stringify(jsonContent)));
        if (!jsonContent || typeof jsonContent !== 'object' || jsonContent === null || (primaryKey in jsonContent) === false) {
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
                        let dot: string = "";
                        if (extensionsForLang[extIndex].length > 0 && extensionsForLang[extIndex][0] === ".") {
                            dot = ".";
                        }
                        if (extensionsForLang[extIndex] === `${dot}${this.fileExtension}`) {
                            nodeFound = true;
                            break;
                        }
                    }
                }

                if (nodeFound) {
                    break;
                }
            }

            logger.debug(getMessage("arrayNodeContent", `Json[${primaryKey}]`, index, node));
            if (nodeFound) {
                logger.Gui.info(getMessage("identifiedLanguage", locatedName));
                logger.info(getMessage("arrayNodeContent", `Json[${primaryKey}]`, index, node));
                commentStructure.singleLine = node.singleLine ?? [];
                commentStructure.multiLine = node.multiLine ?? [];
                commentStructure.prompt_comment_opening_type = node.prompt_comment_opening_type ?? false;
                commentStructure.language = locatedName ?? undefined;
                return commentStructure;
            }
        }
        logger.error(getMessage("languageNotFound", String(this.languageId), this.fileExtension));
        return commentStructure;
    }

    /**
     * @brief Prompts user for file description
     * @return Promise resolving to array of description lines
     * 
     * Displays an input dialog asking the user to provide a description
     * for the current file. The description will be included in the header.
     */
    private async determineHeaderDescription(): Promise<string[]> {
        logger.debug(getMessage("inFunction", "determineHeaderDescription", "CommentGenerator"));
        let final: string[] = [];
        const usrProjectDescription: string = this.Config.get("projectDescription");
        if (usrProjectDescription.length === 0) {
            const usrResponse: string | undefined = await query.input(getMessage("getHeaderDescription"));
            final.push(usrResponse || "");
        } else {
            logger.debug(getMessage("configDescriptionUsed"));
            final.push(usrProjectDescription);
        }
        return final;
    }

    /**
     * @brief Prompts user for file tags
     * @return Promise resolving to array of tag strings
     * 
     * Displays an input dialog asking the user to provide tags
     * for categorizing the current file.
     */
    private async determineHeaderTags(): Promise<string[]> {
        logger.debug(getMessage("inFunction", "determineHeaderTags", "CommentGenerator"));
        let final: string[] = [];
        const usrResponse: string | undefined = await query.input(getMessage("getHeaderTags"));
        final.push(usrResponse || "");
        return final;
    }

    /**
     * @brief Prompts user for file purpose
     * @return Promise resolving to array of purpose strings
     * 
     * Displays an input dialog asking the user to describe the
     * purpose or function of the current file.
     */
    private async determineHeaderPurpose(): Promise<string[]> {
        logger.debug(getMessage("inFunction", "determineHeaderPurpose", "CommentGenerator"));
        let final: string[] = [];
        const usrResponse: string | undefined = await query.input(getMessage("getHeaderPurpose"));
        final.push(usrResponse || "");
        return final;
    }

    /**
     * @brief Presents user with comment style options for selection
     * @param commentOptions Array of available comment style strings
     * @return Promise resolving to selected comment style
     * @throws Error if no comment options are provided
     * 
     * When multiple comment styles are available for a language, this method
     * presents a quick pick dialog for user selection. Returns the single
     * option if only one exists, or the first option if user cancels selection.
     */
    private async getSingleCommentOption(commentOptions: string[]): Promise<string> {
        logger.debug(getMessage("inFunction", "getSingleCommentOption", "CommentGenerator"));
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

    /**
     * @brief Gets the separator string between keys and values in header
     * @return Key-value separator string from configuration
     * 
     * Returns the configured separator string used between header keys
     * (like "File:", "Date:") and their corresponding values.
     */
    private addKeyDefinitionSeparator(): string {
        logger.debug(getMessage("inFunction", "addKeyDefinitionSeparator", "CommentGenerator"));
        const userSettingDefinedElement: string = this.Config.get("headerKeyDefinitionSeparator");
        return userSettingDefinedElement || this.Config.get("headerKeyDefinitionSeparator");
    }

    /**
     * @brief Generates creation date line for header
     * @param comment Comment prefix to prepend
     * @param eol End-of-line type for the document
     * @return Formatted creation date line with comment prefix
     * 
     * Creates a header line showing the current date as the file creation date.
     * Uses configured date separators and formatting from the extension settings.
     */
    private addCreationDate(comment: string, eol: vscode.EndOfLine) {
        logger.debug(getMessage("inFunction", "addCreationDate", "CommentGenerator"));
        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year = now.getFullYear();
        const separatorDay: string = this.Config.get("headerDateSeperatorDay");
        const separatorMonth: string = this.Config.get("headerDateSeperatorMonth");
        const separatorYear: string = this.Config.get("headerDateSeperatorYear");
        let final: string = comment + this.Config.get("headerCreationDateKey") + this.addKeyDefinitionSeparator();
        final += `${day}${separatorDay}${month}${separatorMonth}${year}${separatorYear}`;
        final += this.determineNewLine(eol);
        return final;
    }

    /**
     * @brief Generates last modified date/time line for header
     * @param comment Comment prefix to prepend
     * @param eol End-of-line type for the document
     * @return Formatted last modified date/time line with comment prefix
     * 
     * Creates a header line showing the current date and time as the last
     * modification timestamp. Includes hours, minutes, and seconds along with
     * the date using configured separators.
     */
    private addLastModifiedDate(comment: string, eol: vscode.EndOfLine) {
        logger.debug(getMessage("inFunction", "addLastModifiedDate", "CommentGenerator"));
        const now: Date = new Date();
        const day: string = String(now.getDate()).padStart(2, "0");
        const month: string = String(now.getMonth() + 1).padStart(2, "0"); // Months are 0-based
        const year: number = now.getFullYear();
        const hour: number = now.getHours();
        const minute: number = now.getMinutes();
        const seconds: number = now.getSeconds();
        const separatorDay: string = this.Config.get("headerDateSeperatorDay");
        const separatorMonth: string = this.Config.get("headerDateSeperatorMonth");
        const separatorYear: string = this.Config.get("headerDateSeperatorYear");
        const separatorTimeAndDate: string = this.Config.get("headerTimeAndDateSeperator");
        const separatorSecond: string = this.Config.get("headerTimeSeperatorSecond");
        const separatorMinute: string = this.Config.get("headerTimeSeperatorMinute");
        const separatorHour: string = this.Config.get("headerTimeSeperatorHour");
        let final: string = comment + this.Config.get("headerLastModifiedKey") + this.addKeyDefinitionSeparator();
        final += `${hour}${separatorHour}${minute}${separatorMinute}${seconds}${separatorSecond}${separatorTimeAndDate}${day}${separatorDay}${month}${separatorMonth}${year}${separatorYear}`;
        final += this.determineNewLine(eol);
        return final;
    }

    private mySmartTrimmer(content: string): string {
        if (this.trimTrailingSpaces) {
            return content.trimEnd()
        }
        return content
    }

    /**
     * @brief Formats a multi-line key-value section for the header
     * @param comment Comment prefix for each line
     * @param eol End-of-line type
     * @param tagName Name of the key/tag
     * @param tagDefinition Array of content lines
     * @return Formatted multi-line section string
     * 
     * Creates a multi-line section in the header with a key name followed by
     * multiple content lines. Adds telegraph-style block terminator and
     * optional blank line based on configuration.
     */
    private addMultilineKey(comment: string, eol: vscode.EndOfLine, tagName: string, tagDefinition: string[]): string {
        logger.debug(getMessage("inFunction", "addMultilineKey", "CommentGenerator"));
        const eolStr: string = this.determineNewLine(eol);
        const keyLine: string = comment + tagName + this.mySmartTrimmer(this.addKeyDefinitionSeparator()) + eolStr;
        let final: string = keyLine;
        for (let i = 0; i < tagDefinition.length; i++) {
            final += comment + tagDefinition[i] + eolStr;
        }
        final += comment + this.Config.get("telegraphBlockStop") + eolStr;
        if (this.addBlankLineAfterMultiline) {
            final += comment + eolStr;
        }
        return final;
    }

    /**
     * @brief Formats a single-line key-value pair for the header
     * @param comment Comment prefix
     * @param eol End-of-line type
     * @param tagName Name of the key/tag
     * @param tagDefinition Value content
     * @return Formatted single-line string
     * 
     * Creates a single-line key-value pair in the header format.
     */
    private addSingleLineKey(comment: string, eol: vscode.EndOfLine, tagName: string, tagDefinition: string): string {
        logger.debug(getMessage("inFunction", "addSingleLineKey", "CommentGenerator"));
        let final: string = comment + tagName + this.addKeyDefinitionSeparator();
        final += tagDefinition + this.determineNewLine(eol);
        return final;
    }

    /**
     * @brief Generates the line before header closure
     * @param comment Comment prefix
     * @param eol End-of-line type
     * @return Telegraph end-of-transmission line
     * 
     * Creates a telegraph-style end-of-transmission marker that appears
     * before the final header closing line.
     */
    private beforeHeaderCloser(comment: string, eol: vscode.EndOfLine): string {
        logger.debug(getMessage("inFunction", "beforeHeaderCloser", "CommentGenerator"));
        return comment + this.Config.get("telegraphEndOfTransmission") + this.determineNewLine(eol);
    }

    /**
     * @brief Generates the closing line of a file header
     * @param comment Comment prefix to use
     * @param eol End-of-line type for the document
     * @param projectName Name of the project (defaults to extension name)
     * @return Formatted header closing line
     * 
     * Creates the decorative closing line of the header with telegraph-style
     * formatting and project name, matching the opener format.
     */
    private headerCloser(comment: string, eol: vscode.EndOfLine, projectName: string = this.Config.get("extensionName")): string {
        logger.debug(getMessage("inFunction", "headerCloser", "CommentGenerator"));
        let final: string = comment + this.Config.get("headerOpenerDecorationOpen");
        final += this.Config.get("telegraphEnd") + " ";
        final += projectName;
        final += this.Config.get("headerOpenerDecorationClose");
        final += this.determineNewLine(eol);
        return final;
    }

    /**
     * @brief Updates internal file metadata from document
     * @param document VS Code text document instance
     * 
     * Extracts and stores file metadata including path, name, extension,
     * language ID, EOL type, and version. Resets header boundary markers
     * and updates configuration-dependent properties.
     */
    private updateFileInfo(document: vscode.TextDocument) {
        logger.debug(getMessage("inFunction", "updateFileInfo", "CommentGenerator"));
        this.headerInnerEnd = undefined;
        this.headerInnerStart = undefined;
        this.documentBody = document;
        if (this.Config.get("useWorkspaceNameWhenAvailable")) {
            this.projectName = this.Config.get("workspaceName") || this.Config.get("extensionName");
        } else {
            this.projectName = this.Config.get("extensionName");
        }
        this.filePath = this.documentBody.uri.fsPath;
        this.projectCopyRight = this.Config.get("projectCopyright");
        this.addBlankLineAfterMultiline = this.Config.get("headerAddBlankLineAfterMultiline");
        this.maxScanLength = this.Config.get("defaultMaxScanLength") + this.headerLogo.length;
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

    private prependIfPresent(buildHeader: string[], eol: vscode.EndOfLine, languageId?: string): string[] {
        if (languageId === undefined) {
            return buildHeader;
        }
        const instance = this.languageAppend[languageId];
        if (instance !== undefined) {
            if (Array.isArray(instance)) {
                buildHeader.push(instance.join(this.determineNewLine(eol)));
            } else {
                buildHeader.push(this.languageAppend[languageId]);
            }
            logger.debug(getMessage("languageAppendApplied", languageId));
        }
        return buildHeader;
    }

    private appendIfPresent(buildHeader: string[], eol: vscode.EndOfLine, languageId?: string): string[] {
        if (languageId === undefined) {
            return buildHeader;
        }
        const instance = this.languageAppend[languageId];
        if (instance !== undefined) {
            if (Array.isArray(instance)) {
                buildHeader.push(instance.join(this.determineNewLine(eol)));
            } else {
                buildHeader.push(this.languageAppend[languageId]);
            }
            logger.debug(getMessage("languageAppendApplied", languageId));
        }
        return buildHeader;
    }

    private getOverrideIfPresent(determinedComment: CommentStyle): CommentStyle {
        // If the language is not known, nothing to override
        if (!determinedComment.language) {
            return determinedComment;
        }

        const languageId = determinedComment.language;

        // Apply single-line override if present
        const singleOverride = this.singleLineOverride[languageId];
        if (singleOverride !== undefined) {
            // Wrap the single string into an array since CommentStyle.singleLine expects string[]
            if (Array.isArray(singleOverride)) {
                determinedComment.singleLine = singleOverride;
            } else {
                determinedComment.singleLine = [singleOverride];
            }
            logger.debug(getMessage("singleLineCommentOverrideApplied", languageId, determinedComment.singleLine));
        }

        // Apply multi-line override if present
        const multiOverride = this.multiLineOverride[languageId];
        if (multiOverride !== undefined) {
            // multiOverride is already a string[]
            determinedComment.multiLine = multiOverride;
            logger.debug(getMessage("multiLineCommentOverrideApplied", languageId, determinedComment.multiLine));
        }

        return determinedComment;
    }
    /**
     * @brief Determines comment prefixes based on comment style configuration
     * @param determinedComment Comment style configuration for the language
     * @return Promise resolving to array of [opener, middle, closer] comment prefixes
     * 
     * Analyzes the comment style configuration and determines the appropriate
     * comment prefixes for header opener, content lines, and closer. Handles
     * both multi-line and single-line comment styles with user prompting when needed.
     */
    private async getCorrectCommentPrefix(determinedComment: CommentStyle): Promise<string[]> {
        logger.debug(getMessage("inFunction", "getCorrectPrefix", "CommentGenerator"));
        let commentOpener: string = "";
        let commentMiddle: string = "";
        let commentCloser: string = "";
        const determinedComment_checked: CommentStyle = this.getOverrideIfPresent(determinedComment);
        if (determinedComment_checked.multiLine.length >= 2 && this.preferSingleLineComments === false) {
            commentOpener = determinedComment_checked.multiLine[0];
            if (determinedComment_checked.multiLine.length >= 3) {
                commentMiddle = determinedComment_checked.multiLine[1];
                commentCloser = determinedComment_checked.multiLine[2];
            } else {
                commentMiddle = "";
                commentCloser = determinedComment_checked.multiLine[1];
            }
        } else if (determinedComment_checked.singleLine.length > 0) {
            if (determinedComment_checked.prompt_comment_opening_type) {
                // Ask the user for the type to use based on the single comments that are present.
                const commentString: string = await this.getSingleCommentOption(determinedComment_checked.singleLine);
                commentOpener = commentString;
                commentMiddle = commentString;
                commentCloser = commentString;
            } else {
                commentOpener = determinedComment_checked.singleLine[0];
                commentMiddle = determinedComment_checked.singleLine[0];
                commentCloser = determinedComment_checked.singleLine[0];
            }
        } else {
            commentOpener = "";
            commentMiddle = "";
            commentCloser = "";
        }
        commentOpener += this.Config.get("headerCommentSpacing");
        commentMiddle += this.Config.get("headerCommentSpacing");
        commentCloser += this.Config.get("headerCommentSpacing");
        return [commentOpener, commentMiddle, commentCloser];
    }

    /**
     * @brief Constructs the complete file header content
     * @param comments Array of comment prefixes [opener, middle, closer]
     * @return Promise resolving to array of header lines
     * 
     * Assembles the complete header including:
     * - Opening comment delimiter
     * - Header opener with project name
     * - Logo section (static or random)
     * - Project metadata (name, file, dates)
     * - User-provided description and purpose
     * - Copyright information
     * - Telegraph-style closing markers
     * - Closing comment delimiter
     */
    private async buildTheHeader(comments: string[], languageId?: string): Promise<string[]> {
        logger.debug(getMessage("inFunction", "buildTheHeader", "CommentGenerator"));
        const eol: vscode.EndOfLine = this.documentEOL || vscode.EndOfLine.LF;
        const unknownTerm: string = getMessage("unknown");
        const commentOpener: string = comments[0] || "";
        const commentMiddle: string = comments[1] || "";
        const commentCloser: string = comments[2] || "";
        let buildHeader: string[] = [];
        // Check wether there are elements required to be added before the header
        buildHeader = this.prependIfPresent(buildHeader, eol, languageId);
        // Preparing the header content so that it can be put in a comment and written.
        if (commentOpener.length > 0) {
            buildHeader.push(`${commentOpener}${this.determineNewLine(eol)}`);
        }
        // Opening the header
        buildHeader.push(this.headerOpener(commentMiddle, eol, this.projectName));
        // The logo
        let logoContent = this.headerLogo;
        if (this.Config.get("randomLogo") === true) {
            try {
                const gatheredLogo: logo = await this.randomLogo.getRandomLogoFromFolder();
                if (gatheredLogo.logoContent !== undefined) {
                    logoContent = gatheredLogo.logoContent;
                } else {
                    logger.error(getMessage("randomLogoGatheringFailed", getMessage("ramdomLogoGatheringLogoUndefined")));
                }
            } catch (e) {
                logger.error(getMessage("randomLogoGatheringFailed", String(e)));
            }
        }
        buildHeader.push(this.addMultilineKey(commentMiddle, eol, this.Config.get("headerLogoKey"), logoContent));
        // The project name
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Config.get("headerProjectKey"), this.projectName));
        // The file name
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Config.get("headerFileKey"), this.fileName || unknownTerm));
        // The Creation date
        buildHeader.push(this.addCreationDate(commentMiddle, eol));
        // The Last modified date
        buildHeader.push(this.addLastModifiedDate(commentMiddle, eol));
        // The description
        buildHeader.push(this.addMultilineKey(commentMiddle, eol, this.Config.get("headerDescriptionKey"), await this.determineHeaderDescription()));
        // The copyright
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Config.get("headerCopyrightKey"), this.projectCopyRight));
        // The Tag
        // buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Config.get("headerTagKey"), (await this.determineHeaderTags()).join(",")));
        // The Purpose
        buildHeader.push(this.addSingleLineKey(commentMiddle, eol, this.Config.get("headerPurposeKey"), (await this.determineHeaderPurpose()).join(";")));
        // End of transmission telegraph
        buildHeader.push(this.beforeHeaderCloser(commentMiddle, eol));
        // Closing the header 
        buildHeader.push(this.headerCloser(commentMiddle, eol, this.projectName));
        if (commentCloser.length > 0) {
            buildHeader.push(`${commentCloser}${this.determineNewLine(eol)}`);
        }

        buildHeader = this.appendIfPresent(buildHeader, eol, languageId);

        return buildHeader;
    }

    /**
     * @brief Updates the "Last Modified" timestamp in an existing header
     * @param editor VS Code text editor instance
     * @param comments Array of comment prefixes [opener, middle, closer]
     * 
     * Locates the "Last Modified" line within the existing header boundaries
     * and updates it with the current date and time. Requires that header
     * boundaries have been previously determined by locateIfHeaderPresent().
     */
    private async updateEditDate(document: vscode.TextDocument, comments: string[]) {
        logger.debug(getMessage("inFunction", "updateEditDate", "CommentGenerator"));
        const commentOpener: string = comments[0] || "";
        const commentMiddle: string = comments[1] || "";
        const commentCloser: string = comments[2] || "";
        if (this.headerInnerStart === undefined || this.headerInnerEnd === undefined) {
            const errMsg: string = getMessage("updateEditDateMissingBounds");
            logger.error(errMsg);
            logger.Gui.error(errMsg);
            return;
        }
        if (!this.documentBody) {
            const errMsg: string = getMessage("emptyDocument");
            logger.error(errMsg);
            logger.Gui.error(errMsg);
            return;
        }

        const eol = this.documentEOL || vscode.EndOfLine.LF;
        const lastModifiedKey = this.Config.get("headerLastModifiedKey");

        // Build the new "Last Modified" line
        const newLine = this.addLastModifiedDate(commentMiddle, eol).trimEnd();

        let targetLine: number | undefined = undefined;

        // Scan header block to locate the "Last Modified" line
        for (let i = this.headerInnerStart; i <= this.headerInnerEnd; i++) {
            const lineText = this.documentBody.lineAt(i).text;
            if (lineText.includes(lastModifiedKey)) {
                targetLine = i;
                break;
            }
        }

        if (targetLine === undefined) {
            const errMsg: string = getMessage("lastModifiedLineNotFound");
            logger.error(errMsg);
            logger.Gui.error(errMsg);
            return;
        }

        const edit = new vscode.WorkspaceEdit();
        const range = document.lineAt(targetLine).range;
        edit.replace(document.uri, range, newLine);
        await vscode.workspace.applyEdit(edit);

        const msg: string = getMessage("lastModifiedUpdated");
        logger.info(msg);
        logger.Gui.info(msg);
    }

    /**
     * @brief Scans document to detect existing header presence and boundaries
     * @param comments Array of comment prefixes [opener, middle, closer]
     * @return true if valid header found, false if no/broken header, undefined on error
     * 
     * Searches the document within maxScanLength lines for header opener and closer
     * patterns. Sets headerInnerStart and headerInnerEnd properties when valid
     * header is found. Detects broken headers (mismatched/missing opener/closer).
     */
    protected locateIfHeaderPresent(comments: string[]): boolean | undefined {
        logger.debug(getMessage("inFunction", "locateIfHeaderPresent", "CommentGenerator"));
        const commentOpener: string = comments[0] || "";
        const commentMiddle: string = comments[1] || "";
        const commentCloser: string = comments[2] || "";
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
        const opener: string = this.headerOpener(commentMiddle, eol, this.projectName);
        const closer: string = this.headerCloser(commentMiddle, eol, this.projectName);
        const scanLines: number = Math.min(this.maxScanLength, this.documentBody.lineCount);
        let lineOpenerFound: boolean = false;
        let lineCloserFound: boolean = false;
        for (let i = 0; i < scanLines; i++) {
            const lineText = this.documentBody.lineAt(i).text;
            if (lineText === opener.trimEnd() && lineCloserFound) {
                logger.Gui.warning(getMessage("brokenHeader"));
                return false;
            }
            if (lineText === closer.trimEnd() && !lineOpenerFound) {
                logger.Gui.warning(getMessage("brokenHeader"));
                return false;
            }
            if (lineText === opener.trimEnd() && (!lineCloserFound && !lineOpenerFound)) {
                lineOpenerFound = true;
                this.headerInnerStart = i;
                logger.info(getMessage("headerOpenerFound"));
                continue;
            }
            if (lineText === closer.trimEnd() && (!lineCloserFound && lineOpenerFound)) {
                this.headerInnerEnd = i;
                logger.info(getMessage("headerOpenerAndCloserFound"));
                return true;
            }
        }
        logger.Gui.warning(getMessage("documentLineScanExceeded", this.maxScanLength));
        return false;
    }

    /**
     * @brief Writes a new header to the beginning of the file
     * @param editor VS Code text editor instance
     * @param comments Array of comment prefixes [opener, middle, closer]
     * @return Promise resolving to status code (success/error)
     * 
     * Generates a complete header using buildTheHeader() and inserts it at the
     * top of the document. Handles shebang line detection and offset calculation.
     */
    private async writeHeaderToFile(document: vscode.TextDocument, comments: string[], languageId?: string): Promise<number> {
        logger.debug(getMessage("inFunction", "writeHeaderToFile", "CommentGenerator"));
        const headerLines: string[] = await this.buildTheHeader(comments, languageId);
        const headerText: string = headerLines.join(this.determineNewLine(document.eol));
        let insertPosition = 0;
        if (document.lineCount > 0) {
            const firstLine = document.lineAt(0).text;
            if (firstLine.startsWith('#!')) {
                insertPosition = 1;
                if (document.lineCount > 1 && document.lineAt(1).text !== '') {
                    const edit = new vscode.WorkspaceEdit();
                    edit.insert(document.uri, new vscode.Position(1, 0), this.determineNewLine(document.eol));
                    await vscode.workspace.applyEdit(edit);
                    insertPosition = 2;
                }
            }
        }
        const edit = new vscode.WorkspaceEdit();
        edit.insert(document.uri, new vscode.Position(insertPosition, 0), headerText + this.determineNewLine(document.eol));
        await vscode.workspace.applyEdit(edit);
        return this.Config.get("statusSuccess");
    }
    /**
     * @brief Main method to inject or update header in active editor
     * 
     * Primary entry point for header injection functionality. Performs:
     * 1. Validates active editor and file metadata
     * 2. Determines appropriate comment style for the language
     * 3. Checks for existing header presence
     * 4. Updates existing header timestamp OR writes new header
     * 
     * This method is typically called by user command activation.
     */
    async injectHeader() {
        logger.debug(getMessage("inFunction", "injectHeader", "CommentGenerator"));
        const editor = vscode.window.activeTextEditor;
        if (editor === undefined) {
            logger.error(getMessage("noFocusedEditors"));
            logger.Gui.error(getMessage("openFileToApplyHeader"));
            return;
        }
        this.updateFileInfo(editor.document);
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
        // Some logging
        const msg = getMessage("inputArgs", JSON.stringify(this.documentBody), JSON.stringify(this.filePath), JSON.stringify(this.fileName), JSON.stringify(this.fileExtension), JSON.stringify(this.languageId), JSON.stringify(this.documentEOL), JSON.stringify(this.documentVersion));
        logger.Gui.debug(msg);
        logger.debug(msg);
        // Determining the correct comment prefix
        const determineComment: CommentStyle = await this.determineCorrectComment();
        const comments: string[] = await this.getCorrectCommentPrefix(determineComment);
        // attempt to locate the header
        let response: boolean | undefined = this.locateIfHeaderPresent(comments);
        if (response === undefined) {
            logger.Gui.warning(getMessage("updateAbortedBecauseFileClosedSyncCancelled"));
            return;
        }
        if (response === true) {
            logger.Gui.info(getMessage("updatingEditionDate"));
            await this.updateEditDate(editor.document, comments);
            return;
        }
        if (response === false) {
            let status: number = await this.writeHeaderToFile(editor.document, comments, determineComment.language);
            if (status === this.Config.get("statusError")) {
                logger.Gui.error(getMessage("headerWriteFailed"));
                return;
            }
            logger.Gui.info(getMessage("headerWriteSuccess"));
        }
    }

    /**
     * @brief Checks if current file is allowed for header operations
     * @return Promise resolving to true if file is allowed, false if excluded
     * 
     * Evaluates the current file against the extension's ignore patterns
     * configured in extensionIgnore setting. Checks file extension,
     * file name, and full file path against minimatch patterns.
     */
    private async allowedToActivate(): Promise<boolean> {
        logger.debug(getMessage("inFunction", "allowedToActivate", "CommentGenerator"));
        const ignored: string[] = CodeConfig.get("extensionIgnore") ?? [];

        for (const pattern of ignored) {
            if (
                this.fileExtension && minimatch(this.fileExtension, pattern) ||
                this.fileName && minimatch(this.fileName, pattern) ||
                this.filePath && minimatch(this.filePath, pattern)
            ) {
                return false;
            }
        }

        return true;
    }

    /**
     * @brief Updates the random logo generator instance
     * @param randomLogoInstance New RandomLogo instance to use
     * @return Void - Updates instance reference synchronously
     * 
     * Allows external code to update the logo randomizer, useful for
     * dependency injection or runtime reconfiguration.
     */
    updateLogoInstanceRandomiser(randomLogoInstance: RandomLogo): void {
        logger.debug(getMessage("inFunction", "updateLogoInstanceRandomiser", "CommentGenerator"));
        this.randomLogo = randomLogoInstance;
    }

    /**
     * @brief Automatically refreshes header on document save (if configured)
     * @param document The document being saved
     * 
     * Called by the extension's document save event handler. Checks configuration
     * settings for auto-refresh behavior and file exclusion patterns. Can either:
     * 1. Update existing header timestamps
     * 2. Prompt to create new header (if configured)
     * 3. Do nothing (if refresh disabled or file excluded)
     */
    async refreshHeader(document: vscode.TextDocument | undefined) {
        logger.debug(getMessage("inFunction", "refreshHeader", "CommentGenerator"));
        const refreshOnSave: boolean = CodeConfig.get("refreshOnSave");
        const promptToCreateIfMissing: boolean = CodeConfig.get("promptToCreateIfMissing");
        if (!refreshOnSave) {
            return;
        }
        if (document === undefined) {
            logger.error(getMessage("noDocumentProvided"));
            return;
        }
        this.updateFileInfo(document);
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
        // Check that the file is not in the exclusion list.
        if (!await this.allowedToActivate()) {
            logger.info(getMessage("fileExcludedActivationDisabled"));
            return;
        }
        // Making sure that the target document is still open.
        if (this.documentBody.isClosed) {
            logger.warning(getMessage("closedDocument"));
            logger.Gui.warning(getMessage("updateAbortedBecauseFileClosedSyncCancelled"));
            return;
        }
        // Some logging
        const msg = getMessage("inputArgs", JSON.stringify(this.documentBody), JSON.stringify(this.filePath), JSON.stringify(this.fileName), JSON.stringify(this.fileExtension), JSON.stringify(this.languageId), JSON.stringify(this.documentEOL), JSON.stringify(this.documentVersion));
        logger.Gui.debug(msg);
        logger.debug(msg);
        // Determining the correct comment prefix
        const determineComment: CommentStyle = await this.determineCorrectComment();
        const comments: string[] = await this.getCorrectCommentPrefix(determineComment);
        // attempt to locate the header
        const response: boolean | undefined = this.locateIfHeaderPresent(comments);
        if (response === undefined) {
            logger.Gui.warning(getMessage("updateAbortedBecauseFileClosedSyncCancelled"));
            return;
        }
        if (response === false) {
            if (!promptToCreateIfMissing) {
                logger.Gui.info(getMessage("headerNotFound"));
                return;
            }
            logger.Gui.warning(getMessage("headerNotFound"));
            const questionResponse: boolean = await query.confirm(getMessage("headerInjectQuestion"));
            if (questionResponse === false) {
                logger.Gui.info(getMessage("headerInjectQuestionRefused"));
                return;
            }
            const status: number = await this.writeHeaderToFile(document, comments, determineComment.language);
            if (status === this.Config.get("statusError")) {
                logger.Gui.error(getMessage("headerWriteFailed"));
                return;
            }
            logger.Gui.info(getMessage("headerWriteSuccess"));
        }
        if (response === true) {
            logger.Gui.info(getMessage("updatingEditionDate"));
            await this.updateEditDate(document, comments);
            return;
        }
    }
}
