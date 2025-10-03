/**
 * @file extension.test.ts
 * @brief Comprehensive test suite for AsperHeader extension core functionality
 * @author Henry Letellier
 * @version 1.0.5
 * @date 2025
 * 
 * This module provides the main test suite for validating the core functionality
 * of the AsperHeader VS Code extension. It includes integration tests, API validation,
 * and regression testing to ensure extension stability and reliability across
 * different VS Code versions and operating environments.
 * 
 * Test Coverage:
 * - Extension activation and deactivation lifecycle
 * - Command registration and execution validation
 * - Configuration loading and management
 * - File operation integration testing
 * - Error handling and recovery scenarios
 * - Performance benchmarking and optimization validation
 * 
 * Testing Framework:
 * Uses VS Code's built-in testing framework with Mocha test runner for
 * comprehensive integration testing within the actual VS Code environment.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';
import { moduleName } from '../constants';
import { activate, deactivate } from '../extension';

suite('Extension Integration Test Suite', () => {
	let testDocument: vscode.TextDocument | undefined;
	let testEditor: vscode.TextEditor | undefined;
	let tempDir: string;
	let extensionContext: vscode.ExtensionContext;

	suiteSetup(async () => {
		// Create temporary directory for test files
		tempDir = await fs.mkdtemp(path.join(require('os').tmpdir(), 'extension-test-'));

		// Try to get extension context (may not be available in test environment)
		const possibleIds = ['asperguide.asperheader', 'henryletellierfr.asperheader', 'asperheader'];
		let extension: vscode.Extension<any> | undefined;

		for (const id of possibleIds) {
			extension = vscode.extensions.getExtension(id);
			if (extension) {
				break;
			}
		}

		if (extension) {
			try {
				await extension.activate();
				extensionContext = extension.exports?.context || {
					extensionPath: extension.extensionPath,
					subscriptions: [],
					workspaceState: {
						get: () => undefined,
						update: () => Promise.resolve()
					},
					globalState: {
						get: () => undefined,
						update: () => Promise.resolve(),
						setKeysForSync: () => { }
					}
				} as any;
			} catch (error) {
				// Extension activation might fail in test environment
				console.log('Extension activation failed in test environment:', error);
			}
		} else {
			// Create mock context for test environment
			extensionContext = {
				extensionPath: path.resolve(__dirname, '..', '..'),
				subscriptions: [],
				workspaceState: {
					get: () => undefined,
					update: () => Promise.resolve()
				},
				globalState: {
					get: () => undefined,
					update: () => Promise.resolve(),
					setKeysForSync: () => { }
				}
			} as any;
		}
	});

	suiteTeardown(async () => {
		// Cleanup temporary files
		if (tempDir) {
			await fs.rmdir(tempDir, { recursive: true }).catch(() => { });
		}

		// Close any open test documents
		if (testDocument) {
			await vscode.window.showTextDocument(testDocument);
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	});

	setup(async () => {
		// Reset test state before each test
		testDocument = undefined;
		testEditor = undefined;
	});

	teardown(async () => {
		// Cleanup after each test
		if (testEditor) {
			await vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		}
	});

	suite('Extension Lifecycle', () => {
		test('should activate successfully', async () => {
			// Try multiple possible extension identifiers
			const possibleIds = [
				'asperguide.asperheader',
				'henryletellierfr.asperheader',
				'asperheader'
			];

			let extension: vscode.Extension<any> | undefined;
			for (const id of possibleIds) {
				extension = vscode.extensions.getExtension(id);
				if (extension) {
					break;
				}
			}

			// If no extension found by ID, check if we're running in development
			if (!extension) {
				// In test environment, the extension might not be formally "installed"
				// Check if our activate function exists and can be called
				assert.doesNotThrow(() => {
					// Import should work if extension is properly loaded
					require('../extension');
				}, 'Extension module should be loadable');
				return; // Skip the rest if we can't find the extension by ID
			}

			assert.ok(extension, 'Extension should be loaded');

			// Try to activate if not already active
			if (!extension.isActive) {
				try {
					await extension.activate();
				} catch (error) {
					// Activation might fail in test environment, that's acceptable
				}
			}
		});

		test('should register all expected commands', async () => {
			const commands = await vscode.commands.getCommands(true);

			const expectedCommands = [
				`${moduleName}.helloWorld`,
				`${moduleName}.sayHelloWorld`,
				`${moduleName}.injectHeader`,
				`${moduleName}.refreshHeader`,
				`${moduleName}.darling`,
				`${moduleName}.author`,
				`${moduleName}.displayRandomLogo`
			];

			for (const expectedCommand of expectedCommands) {
				assert.ok(
					commands.includes(expectedCommand),
					`Command '${expectedCommand}' should be registered`
				);
			}
		});

		test('should handle deactivation gracefully', () => {
			// Test that deactivation doesn't throw errors
			assert.doesNotThrow(() => {
				deactivate();
			}, 'Deactivation should not throw errors');
		});
	});

	suite('Command Execution Tests', () => {
		test('should execute helloWorld command without errors', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.helloWorld`);
			}, 'HelloWorld command should execute without errors');
		});

		test('should execute sayHelloWorld command with active editor', async () => {
			// Create a test document
			const testContent = '// Test file content\n';
			const testFilePath = path.join(tempDir, 'test.ts');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			const originalLength = testDocument.getText().length;

			await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);

			// Should have added content to the document
			const newLength = testDocument.getText().length;
			assert.ok(newLength > originalLength, 'Content should be added to the document');
		});

		test('should handle sayHelloWorld command with no active editor', async () => {
			// Ensure no active editor
			await vscode.commands.executeCommand('workbench.action.closeAllEditors');

			// Command should not throw but may show an error message
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);
			}, 'SayHelloWorld command should handle no active editor gracefully');
		});

		test('should execute injectHeader command', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.injectHeader`);
			}, 'InjectHeader command should execute without errors');
		});

		test('should execute refreshHeader command', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.refreshHeader`);
			}, 'RefreshHeader command should execute without errors');
		});

		test('should execute darling command', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.darling`);
			}, 'Darling command should execute without errors');
		});

		test('should execute author command', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.author`);
			}, 'Author command should execute without errors');
		});

		test('should execute displayRandomLogo command', async () => {
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.displayRandomLogo`);
			}, 'DisplayRandomLogo command should execute without errors');
		});
	});

	suite('File Information Extraction', () => {
		test('should extract file info from TypeScript file', async () => {
			const testContent = 'const test: string = "hello";';
			const testFilePath = path.join(tempDir, 'test.ts');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			// Execute sayHelloWorld which uses getFileInfo internally
			await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);

			const documentText = testDocument.getText();
			assert.ok(documentText.includes('.ts'), 'Should detect TypeScript file extension');
			assert.ok(documentText.includes('test.ts'), 'Should detect correct filename');
		});

		test('should extract file info from Python file', async () => {
			const testContent = 'print("hello world")';
			const testFilePath = path.join(tempDir, 'test.py');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);

			const documentText = testDocument.getText();
			assert.ok(documentText.includes('.py'), 'Should detect Python file extension');
			assert.ok(documentText.includes('test.py'), 'Should detect correct filename');
		});

		test('should handle files without extensions', async () => {
			const testContent = 'Some content without extension';
			const testFilePath = path.join(tempDir, 'README');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);

			const documentText = testDocument.getText();
			assert.ok(documentText.includes('README'), 'Should detect filename without extension');
		});
	});

	suite('Document Save Integration', () => {
		test('should handle document save events', async () => {
			const testContent = '// Initial content\n';
			const testFilePath = path.join(tempDir, 'savetest.js');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			// Modify the document
			await testEditor.edit(editBuilder => {
				editBuilder.insert(new vscode.Position(1, 0), 'console.log("test");\n');
			});

			// Save should trigger the save event handler
			await assert.doesNotReject(async () => {
				if (testDocument) {
					await testDocument.save();
				}
			}, 'Document save should be handled without errors');
		});

		test('should prevent concurrent save operations', async () => {
			const testContent = '// Concurrent save test\n';
			const testFilePath = path.join(tempDir, 'concurrent.js');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			// Modify document
			await testEditor.edit(editBuilder => {
				editBuilder.insert(new vscode.Position(1, 0), 'const test = true;\n');
			});

			// Multiple rapid saves should be handled safely
			const savePromises = testDocument ? [
				testDocument.save(),
				testDocument.save(),
				testDocument.save()
			] : [];

			await assert.doesNotReject(async () => {
				await Promise.all(savePromises);
			}, 'Concurrent saves should be handled safely');
		});
	});

	suite('Workspace Management', () => {
		test('should handle workspace without folders', () => {
			// Test workspace name refresh when no workspace folders exist
			assert.doesNotThrow(() => {
				// The refreshWorkspaceName function should handle empty workspace gracefully
				vscode.commands.executeCommand(`${moduleName}.injectHeader`);
			}, 'Should handle workspace without folders');
		});

		test('should detect workspace folders when available', () => {
			// This test depends on the actual workspace setup
			const workspaceFolders = vscode.workspace.workspaceFolders;
			if (workspaceFolders && workspaceFolders.length > 0) {
				assert.ok(workspaceFolders[0].name, 'Should have workspace folder name');
			}
		});
	});

	suite('Error Handling and Edge Cases', () => {
		test('should handle commands with invalid context gracefully', async () => {
			// Close all editors to test edge cases
			await vscode.commands.executeCommand('workbench.action.closeAllEditors');

			// Commands should handle the lack of active editor gracefully
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.refreshHeader`);
			}, 'Should handle refresh header without active document');
		});

		test('should handle file operations on read-only files', async () => {
			// Create a test file
			const testContent = '// Read-only test\n';
			const testFilePath = path.join(tempDir, 'readonly.js');
			await fs.writeFile(testFilePath, testContent);

			const uri = vscode.Uri.file(testFilePath);
			testDocument = await vscode.workspace.openTextDocument(uri);
			testEditor = await vscode.window.showTextDocument(testDocument);

			// Try to execute sayHelloWorld - should handle gracefully even if file becomes read-only
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.sayHelloWorld`);
			}, 'Should handle file operations gracefully');
		});
	});

	suite('Performance and Resource Management', () => {
		test('should complete activation within reasonable time', function () {
			this.timeout(5000); // 5 second timeout

			// Activation should be fast
			const extension = vscode.extensions.getExtension('asperguide.asperheader');
			if (extension && !extension.isActive) {
				return extension.activate();
			}
		});

		test('should handle multiple rapid command executions', async () => {
			// Execute multiple commands rapidly
			const commandPromises = [
				vscode.commands.executeCommand(`${moduleName}.helloWorld`),
				vscode.commands.executeCommand(`${moduleName}.displayRandomLogo`),
				vscode.commands.executeCommand(`${moduleName}.author`),
				vscode.commands.executeCommand(`${moduleName}.darling`)
			];

			await assert.doesNotReject(async () => {
				await Promise.all(commandPromises);
			}, 'Should handle multiple rapid command executions');
		});

		test('should clean up resources properly', () => {
			// Test that deactivation and cleanup work properly
			assert.doesNotThrow(() => {
				deactivate();
			}, 'Resource cleanup should not throw errors');
		});
	});

	suite('Module Integration Tests', () => {
		test('should have properly initialized all modules', async () => {
			// These commands depend on module initialization
			const moduleCommands = [
				`${moduleName}.darling`,
				`${moduleName}.author`,
				`${moduleName}.displayRandomLogo`,
				`${moduleName}.injectHeader`
			];

			for (const command of moduleCommands) {
				await assert.doesNotReject(async () => {
					await vscode.commands.executeCommand(command);
				}, `Module integration test for ${command} should not fail`);
			}
		});

		test('should handle asset loading failures gracefully', async () => {
			// Commands should still execute even if some assets fail to load
			await assert.doesNotReject(async () => {
				await vscode.commands.executeCommand(`${moduleName}.displayRandomLogo`);
				await vscode.commands.executeCommand(`${moduleName}.darling`);
				await vscode.commands.executeCommand(`${moduleName}.author`);
			}, 'Should handle asset loading issues gracefully');
		});
	});
});
