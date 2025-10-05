/**
 * @file extension.ts
 * @brief Main extension entry point for AsperHeader VS Code extension
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.0
 * @date 2025
 * 
 * This file serves as the primary activation point for the AsperHeader VS Code extension,
 * providing comprehensive file header management with ASCII art integration, multi-language
 * support, and automated documentation features. The extension orchestrates various
 * modules to deliver a cohesive development experience for file organization and
 * documentation standardization.
 * 
 * Key responsibilities include:
 * - Extension lifecycle management (activation/deactivation)
 * - Command registration and routing
 * - Module initialization and dependency injection
 * - Workspace configuration and state management
 * - Document save event handling with header refresh
 * 
 * The extension integrates multiple specialized modules:
 * - {@link CommentGenerator}: Automated header injection and refresh
 * - {@link RandomLogo}: ASCII art logo selection and display
 * - {@link Darling}: Easter egg functionality with character display
 * - {@link Watermark}: Author watermark management
 * - {@link MorseTranslator}: Text-to-Morse code conversion utilities
 * - {@link logger}: Dual-channel logging system for development and user feedback
 * 
 * @example Extension activation workflow:
 * ```typescript
 * // Extension activates automatically when VS Code loads
 * // Commands become available in Command Palette:
 * // - "AsperHeader: Hello World"
 * // - "AsperHeader: Say Hello World"
 * // - "AsperHeader: Inject Header"
 * // - "AsperHeader: Refresh Header"
 * // - "AsperHeader: Display Random Logo"
 * 
 * // Headers auto-refresh on file save when configured
 * ```
 */

import * as path from "path";
import * as vscode from 'vscode';
import { moduleName } from './constants';
import { logger } from './modules/logger';
import { Darling } from "./modules/darling";
import { MorseTranslator } from './modules/morseCode';
import { getMessage } from './modules/messageProvider';
import { LazyFileLoader } from './modules/lazyFileLoad';
import { CommentGenerator } from './modules/commentGenerator';
import { CodeConfig, CodeConfigType } from "./modules/processConfiguration";
import { Watermark } from "./modules/watermark";
import { RandomLogo } from "./modules/randomLogo";
import { query } from "./modules/querier";

// Extension boot message
const earlyLog = vscode.window.createOutputChannel('AsperHeader-Preboot');
earlyLog.appendLine('>>> AsperHeader: imports success');
logger.info(getMessage("bootingUp"));

// ---- Shared variables ----

const updatingDocuments = new WeakSet<vscode.TextDocument>();
earlyLog.appendLine('>>> AsperHeader: WeakSet initialised');

const CodeConfiguration: CodeConfigType = CodeConfig;
earlyLog.appendLine('>>> AsperHeader: CodeConfigType initialised');


// --- Helper functions ---

/**
 * @brief Extracts comprehensive file information from VS Code text editor
 * @param editor Active VS Code text editor instance
 * @return Object containing file path, name, extension, and language ID
 * 
 * Analyzes the active editor's document to extract metadata used for
 * header generation and file processing. Essential for context-aware
 * operations across different file types and languages.
 */
function getFileInfo(editor: vscode.TextEditor) {
	logger.debug(getMessage("inFunction", "getFileInfo"));
	const document = editor.document;
	const filePath = document.uri.fsPath;
	const fileName = document.uri.path.split('/').pop() || "unknown";
	const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : "none";
	const languageId = document.languageId;

	return { filePath, fileName, fileExtension, languageId };
}
earlyLog.appendLine('>>> AsperHeader: getFileInfo initialised');

// --- Command implementations ---

/**
 * @brief Displays a simple greeting message from the extension
 * @return Void - Operation completes synchronously
 * 
 * Basic command implementation showing informational notification
 * to verify extension functionality and user interaction.
 */
function helloWorldCommand() {
	logger.debug(getMessage("inFunction", "helloWorldCommand"));
	vscode.window.showInformationMessage(getMessage("helloWorldGreetingsCommand", moduleName));
}
earlyLog.appendLine('>>> AsperHeader: helloWorldCommand initialised');

/**
 * @brief Inserts greeting message with current file information
 * @return Promise<void> - Resolves when message insertion is complete
 * 
 * Advanced hello command that analyzes the active editor and
 * inserts contextual information including file path, extension,
 * and language type. Demonstrates file analysis capabilities.
 */
async function sayHelloWorldCommand() {
	logger.debug(getMessage("inFunction", "sayHelloWorldCommand"));
	const editor = vscode.window.activeTextEditor;
	if (!editor) {
		logger.Gui.error(getMessage("noActiveEditor"));
		return;
	}
	const { filePath, fileName, fileExtension, languageId } = getFileInfo(editor);
	const message = getMessage("sayHelloWorldResponse", fileExtension, fileName, filePath, languageId);
	await editor.edit(editBuilder => editBuilder.insert(new vscode.Position(0, 0), message));
	logger.Gui.info(getMessage("messageWritten"));
}
earlyLog.appendLine('>>> AsperHeader: sayHelloWorldCommand initialised');

/**
 * @brief Thread-safe document update handler for save events
 * @param document VS Code text document being saved
 * @return Promise<void> - Resolves when update operation is complete or skipped
 * 
 * Implements concurrency control to prevent multiple simultaneous
 * header updates during save operations. Uses WeakSet tracking
 * to ensure atomic updates and prevent corruption.
 */
async function updateSaveSafe(document: vscode.TextDocument, comment_generator: CommentGenerator) {
	logger.debug(getMessage("inFunction", "updateSaveSafe"));
	if (updatingDocuments.has(document)) {
		return;
	}
	updatingDocuments.add(document);
	try {
		await comment_generator.refreshHeader(document);
		if (document.isDirty) {
			const status = await document.save();
			if (!status) {
				logger.Gui.error(getMessage("fileSaveFailed"));
			}
		}
	} finally {
		updatingDocuments.delete(document);
	}
}
earlyLog.appendLine('>>> AsperHeader: updateSaveSafe initialised');

/**
 * @brief Updates cached workspace name from VS Code workspace state
 * @return Void - Updates configuration cache synchronously
 * 
 * Analyzes current workspace configuration to extract and cache
 * the workspace name for use in header generation. Handles both
 * workspace folders and legacy root path configurations.
 */
function refreshWorkspaceName() {
	logger.debug(getMessage("inFunction", "refreshWorkspaceName"));
	let workspaceName: string | undefined;

	if (vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0) {
		workspaceName = vscode.workspace.workspaceFolders[0].name;
	}
	else if ((vscode.workspace as any).rootPath) {
		const rootPath = (vscode.workspace as any).rootPath as string;
		workspaceName = rootPath.split(/[\\/]/).pop();
	}

	CodeConfig.setWorkspaceName(workspaceName);
}
earlyLog.appendLine('>>> AsperHeader: refreshWorkspaceName initialised');

/**
 * @brief Converts user input to Morse code through interactive GUI dialog
 * @return Promise<void> - Resolves when conversion and display are complete
 * 
 * Presents an input dialog for text entry, converts the input to Morse code
 * using {@link MorseTranslator}, and displays the result through both console
 * and GUI notification channels.
 */
async function toMorseGui() {
	logger.debug(getMessage("inFunction", "toMorseGui"));
	const usr_input: string | undefined = await query.input(getMessage("toMorseGetInput"));
	if (usr_input === undefined) {
		logger.Gui.info(getMessage("operationCanceled"));
		return;
	}
	const converted_response: string = MorseTranslator.toMorse(usr_input);
	logger.info(getMessage("convertedContentCli", converted_response));
	logger.Gui.info(`${converted_response}`);
	logger.Gui.info(getMessage("convertedContentGui"));
}
earlyLog.appendLine('>>> AsperHeader: toMorseGui initialised');

/**
 * @brief Converts Morse code input to plain text through interactive GUI dialog
 * @return Promise<void> - Resolves when conversion and display are complete
 * 
 * Presents an input dialog for Morse code entry, converts the input to plain text
 * using {@link MorseTranslator}, and displays the result through both console
 * and GUI notification channels.
 */
async function fromMorseGui() {
	logger.debug(getMessage("inFunction", "fromMorseGui"));
	const usr_input: string | undefined = await query.input(getMessage("fromMorseGetInput"));
	if (usr_input === undefined) {
		logger.Gui.info(getMessage("operationCanceled"));
		return;
	}
	const converted_response: string = MorseTranslator.fromMorse(usr_input);
	logger.info(getMessage("convertedContentCli", converted_response));
	logger.Gui.info(`${converted_response}`);
	logger.Gui.info(getMessage("convertedContentGui"));
}
earlyLog.appendLine('>>> AsperHeader: fromMorseGui initialised');

/**
 * @brief Main extension activation entry point
 * @param context VS Code extension context providing access to extension resources
 * 
 * Orchestrates complete extension initialization including:
 * - Module dependency injection and configuration
 * - Asset path resolution for templates and resources
 * - Command registration for user interaction
 * - Event handler setup for document management
 * - Logger initialization with installation state
 * 
 * Called automatically by VS Code when extension loads or
 * when activation events are triggered.
 */
export async function activate(context: vscode.ExtensionContext) {
	logger.updateInitialisationStatus(true);
	logger.info(getMessage("inActivate"));
	// Initialising the variables of the CodeConfiguration class
	await CodeConfiguration.refreshVariables();
	logger.info(getMessage("variablesRefreshed"));
	// Updating the logger settings
	logger.updateInstallationState(context);
	logger.info(getMessage("inActivateAfterLogger"));
	logger.Gui.debug(`context.extensionPath: ${context.extensionPath}`);
	logger.info(getMessage("inActivateAfterGuiDebug"));

	// Class initialisers
	const COMMENTS_FORMAT = new LazyFileLoader<any>();
	logger.debug(getMessage("classInitialised", "LazyFileLoader", moduleName));
	earlyLog.appendLine('>>> AsperHeader: LazyFileLoader initialised');
	const COMMENT_GENERATOR: CommentGenerator = new CommentGenerator(COMMENTS_FORMAT);
	logger.debug(getMessage("classInitialised", "CommentGenerator", moduleName));
	earlyLog.appendLine('>>> AsperHeader: CommentGenerator initialised');
	const DARLING: Darling = new Darling();
	earlyLog.appendLine('>>> AsperHeader: Darling initialised');
	logger.debug(getMessage("classInitialised", "Darling", moduleName));
	const WATERMARK: Watermark = new Watermark();
	earlyLog.appendLine('>>> AsperHeader: Watermark initialised');
	logger.debug(getMessage("classInitialised", "Watermark", moduleName));
	const RANDOM_LOGO: RandomLogo = new RandomLogo();
	earlyLog.appendLine('>>> AsperHeader: RandomLogo initialised');
	logger.debug(getMessage("classInitialised", "RandomLogo", moduleName));
	logger.debug(getMessage("classesInitialised"));

	const jsonLanguagePath: string = path.join(
		context.extensionPath,
		"assets",
		"formatingRules",
		"languages.min.json"
	);
	const alternateJsonLanguagePath: string = path.join(
		context.extensionPath,
		"dist",
		"assets",
		"formatingRules",
		"languages.min.json"
	);
	const darlingPath: string = path.join(
		context.extensionPath,
		"assets",
		"bonus",
		"ditf.min.json"
	);
	const alternateDarlingPath: string = path.join(
		context.extensionPath,
		"dist",
		"assets",
		"bonus",
		"ditf.min.json"
	);
	const watermarkPath: string = path.join(
		context.extensionPath,
		"assets",
		"bonus",
		"watermark.min.json"
	);
	const alternateWatermarkPath: string = path.join(
		context.extensionPath,
		"dist",
		"assets",
		"bonus",
		"watermark.min.json"
	);
	const logoPath: string = path.join(
		context.extensionPath,
		"assets",
		"asciiArt"
	);
	const alternateLogoPath: string = path.join(
		context.extensionPath,
		"dist",
		"assets",
		"asciiArt"
	);
	logger.debug(getMessage("pathsSet"));
	// Updating the current working directories of the classes
	await DARLING.updateCurrentWorkingDirectory(context.extensionPath);
	await WATERMARK.updateCurrentWorkingDirectory(context.extensionPath);
	RANDOM_LOGO.updateCurrentWorkingDirectory(context.extensionPath);
	await COMMENTS_FORMAT.updateCurrentWorkingDirectory(context.extensionPath);
	logger.debug(getMessage("currentWorkingDirectorySet"));
	// Updating the default file paths of the classes
	await DARLING.updateFilePath(darlingPath);
	await WATERMARK.updateFilePath(watermarkPath);
	await RANDOM_LOGO.updateRootDir(logoPath, alternateLogoPath);
	await COMMENTS_FORMAT.updateFilePath(jsonLanguagePath);
	logger.debug(getMessage("filePathsAndRootDirsUpdated"));
	// Updating the backup paths of the classes
	await DARLING.updateAlternateFilePath(alternateDarlingPath);
	await WATERMARK.updateAlternateFilePath(alternateWatermarkPath);
	await COMMENTS_FORMAT.updateAlternateFilePath(alternateJsonLanguagePath);
	logger.debug(getMessage("filePathAlternateSet"));
	// Initialising the random logo of the Comment generator class
	COMMENT_GENERATOR.updateLogoInstanceRandomiser(RANDOM_LOGO);
	logger.info(getMessage("extensionActivated", moduleName), 3);


	context.subscriptions.push(
		vscode.commands.registerCommand(`${moduleName}.helloWorld`, helloWorldCommand),
		vscode.commands.registerCommand(`${moduleName}.sayHelloWorld`, sayHelloWorldCommand),
		vscode.commands.registerCommand(`${moduleName}.injectHeader`, () => { refreshWorkspaceName(); COMMENT_GENERATOR.injectHeader(); }),
		vscode.commands.registerCommand(`${moduleName}.refreshHeader`, () => { refreshWorkspaceName(); COMMENT_GENERATOR.refreshHeader(vscode.window.activeTextEditor?.document); }),
		vscode.commands.registerCommand(`${moduleName}.darling`, DARLING.displayRandomPersonInWindow.bind(DARLING)),
		vscode.commands.registerCommand(`${moduleName}.author`, WATERMARK.displayRandomAuthorWatermarkInWindow.bind(WATERMARK)),
		vscode.commands.registerCommand(`${moduleName}.displayRandomLogo`, RANDOM_LOGO.displayRandomLogoInWindow.bind(RANDOM_LOGO)),
		vscode.commands.registerCommand(`${moduleName}.toMorse`, toMorseGui),
		vscode.commands.registerCommand(`${moduleName}.fromMorse`, fromMorseGui),
		vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => { await updateSaveSafe(document, COMMENT_GENERATOR); }),
		vscode.workspace.onDidChangeConfiguration(async (event) => { if (event.affectsConfiguration(moduleName)) { await CodeConfiguration.refreshVariables(); logger.debug(getMessage("variablesRefreshed")); } })
	);
	logger.debug(getMessage("subscriptionsAdded"));
}
earlyLog.appendLine('>>> AsperHeader: activate called');

/**
 * @brief Extension cleanup and deactivation handler
 * @return Void - Completes synchronously with no explicit cleanup
 * 
 * Called when extension is deactivated, disabled, or VS Code closes.
 * Currently implements graceful shutdown without explicit cleanup
 * as modules handle their own resource management.
 */
export function deactivate() { }
