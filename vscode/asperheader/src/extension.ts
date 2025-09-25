import * as path from "path";
import * as vscode from 'vscode';
import { getMessage } from './modules/messageProvider';
import { logger } from './modules/logger';
import { LazyFileLoader } from './modules/lazyFileLoad';
import { MorseTranslator } from './modules/morseCode';
import { CommentGenerator } from './modules/commentGenerator';
import { moduleName } from './constants';

// ---- SHared variables ----

const COMMENTS_FORMAT = new LazyFileLoader<any>();

const MORSETRANSLATOR_INITIALISED = new MorseTranslator();

const COMMENT_GENERATOR: CommentGenerator = new CommentGenerator(COMMENTS_FORMAT);

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
 * Activate extension
 */
export async function activate(context: vscode.ExtensionContext) {
	logger.Gui.debug(`context.extensionPath: ${context.extensionPath}`);
	const jsonLanguagePath: string = path.join(
		context.extensionPath,
		"assets",
		"formatingRules",
		"languagesReorganised.min.json"
	);
	await COMMENTS_FORMAT.updateCurrentWorkingDirectory(context.extensionPath);
	await COMMENTS_FORMAT.updateFilePath(jsonLanguagePath);
	logger.info(getMessage("extensionActivated", moduleName), 3);


	context.subscriptions.push(
		vscode.commands.registerCommand(`${moduleName}.helloWorld`, helloWorldCommand),
		vscode.commands.registerCommand(`${moduleName}.sayHelloWorld`, sayHelloWorldCommand),
		vscode.commands.registerCommand(`${moduleName}.injectHeader`, COMMENT_GENERATOR.injectHeader.bind(COMMENT_GENERATOR))
	);
}

/**
 * Deactivate extension
 */
export function deactivate() { }
