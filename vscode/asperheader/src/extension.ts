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

// ---- SHared variables ----

const updatingDocuments = new WeakSet<vscode.TextDocument>();

const CodeConfiguration: CodeConfigType = CodeConfig;

const COMMENTS_FORMAT = new LazyFileLoader<any>();

const MORSETRANSLATOR_INITIALISED = new MorseTranslator();

const COMMENT_GENERATOR: CommentGenerator = new CommentGenerator(COMMENTS_FORMAT);

const DARLING: Darling = new Darling();

const WATERMARK: Watermark = new Watermark();

const RANDOM_LOGO: RandomLogo = new RandomLogo();

// --- Helper functions ---
function getFileInfo(editor: vscode.TextEditor) {
	const document = editor.document;
	const filePath = document.uri.fsPath;
	const fileName = document.uri.path.split('/').pop() || "unknown";
	const fileExtension = fileName.includes('.') ? fileName.split('.').pop() : "none";
	const languageId = document.languageId;

	return { filePath, fileName, fileExtension, languageId };
}

// --- Command implementations ---

/**
 * Command: Hello World
 */
function helloWorldCommand() {
	vscode.window.showInformationMessage(getMessage("helloWorldGreetingsCommand", moduleName));
}

/**
 * Command: Say Hello with file info
 */
async function sayHelloWorldCommand() {
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

/**
 * Update checks to avoid concurrency during a save trigger
 */
async function updateSaveSafe(document: vscode.TextDocument) {
	if (updatingDocuments.has(document)) {
		return;
	}
	updatingDocuments.add(document);
	try {
		await COMMENT_GENERATOR.refreshHeader(document);
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

/**
 * Refresh the name of the cached workspace if any is activated
 */
function refreshWorkspaceName() {
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

/**
 * Activate extension
 */
export async function activate(context: vscode.ExtensionContext) {
	logger.Gui.debug(`context.extensionPath: ${context.extensionPath}`);
	const jsonLanguagePath: string = path.join(
		context.extensionPath,
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
	const watermarkPath: string = path.join(
		context.extensionPath,
		"assets",
		"bonus",
		"watermark.min.json"
	);
	const logoPath: string = path.join(
		context.extensionPath,
		"assets",
		"asciiArt"
	);
	await DARLING.updateCurrentWorkingDirectory(context.extensionPath);
	await WATERMARK.updateCurrentWorkingDirectory(context.extensionPath);
	RANDOM_LOGO.updateCurrentWorkingDirectory(context.extensionPath);
	await COMMENTS_FORMAT.updateCurrentWorkingDirectory(context.extensionPath);
	await DARLING.updateFilePath(darlingPath);
	await WATERMARK.updateFilePath(watermarkPath);
	await RANDOM_LOGO.updateRootDir(logoPath);
	await COMMENTS_FORMAT.updateFilePath(jsonLanguagePath);
	await CodeConfiguration.refreshVariables();
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
		vscode.workspace.onDidSaveTextDocument(async (document: vscode.TextDocument) => { await updateSaveSafe(document); })
	);
}

/**
 * Deactivate extension
 */
export function deactivate() { }
