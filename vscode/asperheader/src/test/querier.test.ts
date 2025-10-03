/**
 * @file querier.test.ts
 * @brief Test suite for the Query user interaction system
 * @author Henry Letellier
 * @version 1.0.4
 * @date 2025
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { Query, query } from '../modules/querier';

// Mock state
let mockInputBoxResponse: string | undefined = undefined;
let mockQuickPickResponse: string | undefined = undefined;
let mockInputBoxCallCount = 0;
let mockQuickPickCallCount = 0;
let mockLastInputOptions: vscode.InputBoxOptions | undefined = undefined;
let mockLastQuickPickItems: string[] = [];
let mockLastQuickPickOptions: vscode.QuickPickOptions | undefined = undefined;

// Store original methods
let originalShowInputBox: any;
let originalShowQuickPick: any;

suite('Query Test Suite', function () {

    setup(() => {
        // Reset mock state
        mockInputBoxResponse = undefined;
        mockQuickPickResponse = undefined;
        mockInputBoxCallCount = 0;
        mockQuickPickCallCount = 0;
        mockLastInputOptions = undefined;
        mockLastQuickPickItems = [];
        mockLastQuickPickOptions = undefined;

        // Store original methods
        originalShowInputBox = vscode.window.showInputBox;
        originalShowQuickPick = vscode.window.showQuickPick;

        // Mock VS Code methods
        (vscode.window as any).showInputBox = async (options?: vscode.InputBoxOptions) => {
            mockInputBoxCallCount++;
            mockLastInputOptions = options;
            return mockInputBoxResponse;
        };

        (vscode.window as any).showQuickPick = async (items: string[], options?: vscode.QuickPickOptions) => {
            mockQuickPickCallCount++;
            mockLastQuickPickItems = [...items];
            mockLastQuickPickOptions = options;
            return mockQuickPickResponse;
        };
    });

    teardown(() => {
        // Restore original methods
        (vscode.window as any).showInputBox = originalShowInputBox;
        (vscode.window as any).showQuickPick = originalShowQuickPick;
    });

    suite('Singleton Pattern', () => {
        test('should return the same instance when accessing Query.instance multiple times', () => {
            const instance1 = Query.instance;
            const instance2 = Query.instance;

            assert.strictEqual(instance1, instance2, 'Query.instance should return the same instance');
            assert.ok(instance1 instanceof Query, 'Instance should be of type Query');
        });

        test('exported query constant should be the same as Query.instance', () => {
            const queryInstance = Query.instance;

            assert.strictEqual(query, queryInstance, 'Exported query should be the same as Query.instance');
        });

        test('should create instance on first access', () => {
            const instance = Query.instance;
            assert.ok(instance, 'Instance should be created on first access');
            assert.ok(typeof instance.input === 'function', 'Instance should have input method');
            assert.ok(typeof instance.quickPick === 'function', 'Instance should have quickPick method');
            assert.ok(typeof instance.confirm === 'function', 'Instance should have confirm method');
        });
    });

    suite('Input Dialog Tests', () => {
        test('should successfully return user input', async () => {
            const expectedInput = 'Test user input';
            const promptText = 'Enter your input:';

            mockInputBoxResponse = expectedInput;

            const result = await query.input(promptText);

            assert.strictEqual(result, expectedInput, 'Should return the user input');
            assert.strictEqual(mockInputBoxCallCount, 1, 'showInputBox should be called once');
            assert.strictEqual(mockLastInputOptions?.prompt, promptText, 'Should pass prompt correctly');
        });

        test('should handle user cancellation', async () => {
            mockInputBoxResponse = undefined;

            const result = await query.input('Test prompt');

            assert.strictEqual(result, undefined, 'Should return undefined when user cancels');
            assert.strictEqual(mockInputBoxCallCount, 1, 'showInputBox should be called once');
        });

        test('should pass through InputBoxOptions correctly', async () => {
            const promptText = 'Enter password:';
            const options: vscode.InputBoxOptions = {
                password: true,
                placeHolder: 'Your password here'
            };

            mockInputBoxResponse = 'secret123';

            const result = await query.input(promptText, options);

            assert.strictEqual(result, 'secret123', 'Should return input value');
            assert.strictEqual(mockLastInputOptions?.prompt, promptText, 'Should include prompt');
            assert.strictEqual(mockLastInputOptions?.password, true, 'Should pass password option');
            assert.strictEqual(mockLastInputOptions?.placeHolder, 'Your password here', 'Should pass placeholder');
        });

        test('should handle empty string input', async () => {
            mockInputBoxResponse = '';

            const result = await query.input('Enter something:');

            assert.strictEqual(result, '', 'Should return empty string if user enters empty string');
        });
    });

    suite('Quick Pick Dialog Tests', () => {
        test('should successfully return selected item', async () => {
            const items = ['Option 1', 'Option 2', 'Option 3'];
            const placeholder = 'Select an option:';
            const selectedItem = 'Option 2';

            mockQuickPickResponse = selectedItem;

            const result = await query.quickPick(items, placeholder);

            assert.strictEqual(result, selectedItem, 'Should return the selected item');
            assert.strictEqual(mockQuickPickCallCount, 1, 'showQuickPick should be called once');
            assert.deepStrictEqual(mockLastQuickPickItems, items, 'Should pass items correctly');
            assert.strictEqual(mockLastQuickPickOptions?.placeHolder, placeholder, 'Should pass placeholder correctly');
        });

        test('should handle user cancellation in quick pick', async () => {
            mockQuickPickResponse = undefined;

            const result = await query.quickPick(['Option 1'], 'Select:');

            assert.strictEqual(result, undefined, 'Should return undefined when user cancels');
            assert.strictEqual(mockQuickPickCallCount, 1, 'showQuickPick should be called once');
        });

        test('should handle empty items array', async () => {
            const emptyItems: string[] = [];
            mockQuickPickResponse = undefined;

            const result = await query.quickPick(emptyItems, 'No options:');

            assert.strictEqual(result, undefined, 'Should handle empty items gracefully');
            assert.deepStrictEqual(mockLastQuickPickItems, emptyItems, 'Should pass empty array');
        });

        test('should handle single item array', async () => {
            const singleItem = ['Only Option'];
            mockQuickPickResponse = 'Only Option';

            const result = await query.quickPick(singleItem, 'Only choice:');

            assert.strictEqual(result, 'Only Option', 'Should handle single item selection');
        });
    });

    suite('Confirmation Dialog Tests', () => {
        test('should return true when user selects Yes', async () => {
            // Mock getMessage to return localized strings
            const messageModule = require('../modules/messageProvider');
            const originalGetMessage = messageModule.getMessage;
            messageModule.getMessage = (key: string) => {
                if (key === 'quickPickYes') {
                    return 'Yes';
                }
                if (key === 'quickPickNo') {
                    return 'No';
                }
                return key;
            };

            try {
                mockQuickPickResponse = 'Yes';

                const result = await query.confirm('Do you want to proceed?');

                assert.strictEqual(result, true, 'Should return true for Yes selection');
                assert.strictEqual(mockQuickPickCallCount, 1, 'showQuickPick should be called once');
                assert.deepStrictEqual(mockLastQuickPickItems, ['Yes', 'No'], 'Should present Yes/No options');
                assert.strictEqual(mockLastQuickPickOptions?.placeHolder, 'Do you want to proceed?', 'Should use prompt as placeholder');
            } finally {
                messageModule.getMessage = originalGetMessage;
            }
        });

        test('should return false when user selects No', async () => {
            const messageModule = require('../modules/messageProvider');
            const originalGetMessage = messageModule.getMessage;
            messageModule.getMessage = (key: string) => {
                if (key === 'quickPickYes') {
                    return 'Yes';
                }
                if (key === 'quickPickNo') {
                    return 'No';
                }
                return key;
            };

            try {
                mockQuickPickResponse = 'No';

                const result = await query.confirm('Are you sure?');

                assert.strictEqual(result, false, 'Should return false for No selection');
            } finally {
                messageModule.getMessage = originalGetMessage;
            }
        });

        test('should return false when user cancels confirmation', async () => {
            const messageModule = require('../modules/messageProvider');
            const originalGetMessage = messageModule.getMessage;
            messageModule.getMessage = (key: string) => {
                if (key === 'quickPickYes') {
                    return 'Yes';
                }
                if (key === 'quickPickNo') {
                    return 'No';
                }
                return key;
            };

            try {
                mockQuickPickResponse = undefined;

                const result = await query.confirm('Confirm action?');

                assert.strictEqual(result, false, 'Should return false for cancellation');
            } finally {
                messageModule.getMessage = originalGetMessage;
            }
        });
    });

    suite('Integration Tests', () => {
        test('should handle complex input options', async () => {
            const complexOptions: vscode.InputBoxOptions = {
                value: 'default value',
                prompt: 'Override prompt',
                placeHolder: 'Type here...',
                password: false,
                ignoreFocusOut: true
            };

            mockInputBoxResponse = 'test@example.com';

            const result = await query.input('Enter email:', complexOptions);

            assert.strictEqual(result, 'test@example.com', 'Should handle complex options');
            assert.strictEqual(mockLastInputOptions?.value, 'default value', 'Should pass default value');
            assert.strictEqual(mockLastInputOptions?.placeHolder, 'Type here...', 'Should pass placeholder');
            assert.strictEqual(mockLastInputOptions?.ignoreFocusOut, true, 'Should pass ignoreFocusOut');
        });

        test('should merge prompt with options correctly', async () => {
            const options: vscode.InputBoxOptions = {
                prompt: 'Original prompt'
            };

            mockInputBoxResponse = 'result';

            await query.input('Override prompt', options);

            // Due to spread operator, options.prompt will override the parameter
            assert.strictEqual(mockLastInputOptions?.prompt, 'Original prompt', 'Should use prompt from options when provided');
        });

        test('should handle special characters in items', async () => {
            const mixedItems = ['string', '123', '', 'special@chars!'];
            mockQuickPickResponse = '123';

            const result = await query.quickPick(mixedItems, 'Pick one:');

            assert.strictEqual(result, '123', 'Should handle mixed string items');
        });
    });
});
