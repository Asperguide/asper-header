/**
 * @file querier.test.ts
 * @brief Comprehensive test suite for the Query user interaction system
 * @author Henry Letellier
 * @version 1.0.10
 * @date 2025
 * 
 * This test suite provides extensive coverage for the Query module, which manages
 * user input collection through VS Code's input box and quick pick dialogs.
 * 
 * Test Coverage Areas:
 * - Input box text collection with validation
 * - Quick pick option selection functionality
 * - User input validation and error handling
 * - VS Code UI integration and mocking
 * - Dialog configuration and behavior
 * - Promise-based user interaction patterns
 * 
 * Testing Strategy:
 * - Mocks VS Code's showInputBox and showQuickPick APIs
 * - Tests both successful and cancelled user interactions
 * - Validates input options and configuration parameters
 * - Ensures proper error handling and edge cases
 * - Verifies integration with extension workflow
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { Query, query } from '../modules/querier';

/**
 * @brief Mock state variables for VS Code UI testing
 * 
 * These variables track the mock responses and call counts for
 * VS Code's input dialog methods during testing.
 */

/** @brief Mock response for input box dialogs */
let mockInputBoxResponse: string | undefined = undefined;

/** @brief Mock response for quick pick dialogs */
let mockQuickPickResponse: string | undefined = undefined;

/** @brief Counter for input box method calls */
let mockInputBoxCallCount = 0;

/** @brief Counter for quick pick method calls */
let mockQuickPickCallCount = 0;

/** @brief Last captured input box options for validation */
let mockLastInputOptions: vscode.InputBoxOptions | undefined = undefined;

/** @brief Last captured quick pick items for validation */
let mockLastQuickPickItems: string[] = [];

/** @brief Last captured quick pick options for validation */
let mockLastQuickPickOptions: vscode.QuickPickOptions | undefined = undefined;

/**
 * @brief Storage for original VS Code API methods
 * 
 * These variables store the original implementations so they can
 * be restored after testing completes.
 */

/** @brief Original showInputBox implementation */
let originalShowInputBox: any;

/** @brief Original showQuickPick implementation */
let originalShowQuickPick: any;

/**
 * @brief Main test suite for Query user interaction functionality
 * 
 * Tests all aspects of user input collection including input boxes,
 * quick pick dialogs, validation, and VS Code integration.
 */
suite('Query Test Suite', function () {

    /**
     * @brief Setup test environment before each test
     * Resets mock state and installs VS Code API mocks
     */
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

    /**
     * @brief Cleanup test environment after each test
     * Restores original VS Code API methods
     */
    teardown(() => {
        // Restore original methods
        (vscode.window as any).showInputBox = originalShowInputBox;
        (vscode.window as any).showQuickPick = originalShowQuickPick;
    });

    /**
     * @brief Test suite for singleton pattern implementation
     * Validates that Query class follows singleton design pattern correctly
     */
    suite('Singleton Pattern', () => {
        /**
         * @brief Tests singleton instance consistency
         * @test Validates that multiple accesses return the same instance
         */
        test('should return the same instance when accessing Query.instance multiple times', () => {
            const instance1 = Query.instance;
            const instance2 = Query.instance;

            assert.strictEqual(instance1, instance2, 'Query.instance should return the same instance');
            assert.ok(instance1 instanceof Query, 'Instance should be of type Query');
        });

        /**
         * @brief Tests exported query constant consistency
         * @test Validates that exported query matches Query.instance
         */
        test('exported query constant should be the same as Query.instance', () => {
            const queryInstance = Query.instance;

            assert.strictEqual(query, queryInstance, 'Exported query should be the same as Query.instance');
        });

        /**
         * @brief Tests instance creation and method availability
         * @test Validates that instance is created with required methods
         */
        test('should create instance on first access', () => {
            const instance = Query.instance;
            assert.ok(instance, 'Instance should be created on first access');
            assert.ok(typeof instance.input === 'function', 'Instance should have input method');
            assert.ok(typeof instance.quickPick === 'function', 'Instance should have quickPick method');
            assert.ok(typeof instance.confirm === 'function', 'Instance should have confirm method');
        });
    });

    /**
     * @brief Test suite for input dialog functionality
     * Validates text input collection through VS Code input boxes
     */
    suite('Input Dialog Tests', () => {
        /**
         * @brief Tests successful user input collection
         * @test Validates that user input is properly returned and options are passed
         */
        test('should successfully return user input', async () => {
            const expectedInput = 'Test user input';
            const promptText = 'Enter your input:';

            mockInputBoxResponse = expectedInput;

            const result = await query.input(promptText);

            assert.strictEqual(result, expectedInput, 'Should return the user input');
            assert.strictEqual(mockInputBoxCallCount, 1, 'showInputBox should be called once');
            assert.strictEqual(mockLastInputOptions?.prompt, promptText, 'Should pass prompt correctly');
        });

        /**
         * @brief Tests user cancellation handling in input dialogs
         * @test Validates that undefined is returned when user cancels
         */
        test('should handle user cancellation', async () => {
            mockInputBoxResponse = undefined;

            const result = await query.input('Test prompt');

            assert.strictEqual(result, undefined, 'Should return undefined when user cancels');
            assert.strictEqual(mockInputBoxCallCount, 1, 'showInputBox should be called once');
        });

        /**
         * @brief Tests InputBoxOptions parameter passing
         * @test Validates that all options are correctly passed to VS Code API
         */
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

        /**
         * @brief Tests empty string input handling
         * @test Validates that empty strings are properly returned
         */
        test('should handle empty string input', async () => {
            mockInputBoxResponse = '';

            const result = await query.input('Enter something:');

            assert.strictEqual(result, '', 'Should return empty string if user enters empty string');
        });
    });

    /**
     * @brief Test suite for quick pick dialog functionality
     * Validates option selection through VS Code quick pick dialogs
     */
    suite('Quick Pick Dialog Tests', () => {
        /**
         * @brief Tests successful item selection from quick pick
         * @test Validates that selected item is returned and options are passed correctly
         */
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

        /**
         * @brief Tests user cancellation handling in quick pick
         * @test Validates that undefined is returned when user cancels selection
         */
        test('should handle user cancellation in quick pick', async () => {
            mockQuickPickResponse = undefined;

            const result = await query.quickPick(['Option 1'], 'Select:');

            assert.strictEqual(result, undefined, 'Should return undefined when user cancels');
            assert.strictEqual(mockQuickPickCallCount, 1, 'showQuickPick should be called once');
        });

        /**
         * @brief Tests empty items array handling
         * @test Validates graceful handling of empty option arrays
         */
        test('should handle empty items array', async () => {
            const emptyItems: string[] = [];
            mockQuickPickResponse = undefined;

            const result = await query.quickPick(emptyItems, 'No options:');

            assert.strictEqual(result, undefined, 'Should handle empty items gracefully');
            assert.deepStrictEqual(mockLastQuickPickItems, emptyItems, 'Should pass empty array');
        });

        /**
         * @brief Tests single item array handling
         * @test Validates proper behavior with only one selectable option
         */
        test('should handle single item array', async () => {
            const singleItem = ['Only Option'];
            mockQuickPickResponse = 'Only Option';

            const result = await query.quickPick(singleItem, 'Only choice:');

            assert.strictEqual(result, 'Only Option', 'Should handle single item selection');
        });
    });

    /**
     * @brief Test suite for confirmation dialog functionality
     * Validates Yes/No confirmation dialogs and user decision handling
     */
    suite('Confirmation Dialog Tests', () => {
        /**
         * @brief Tests affirmative user response in confirmation dialog
         * @test Validates that true is returned when user selects Yes
         */
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

        /**
         * @brief Tests negative user response in confirmation dialog
         * @test Validates that false is returned when user selects No
         */
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

        /**
         * @brief Tests user cancellation in confirmation dialog
         * @test Validates that false is returned when user cancels
         */
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

    /**
     * @brief Integration test suite for complex scenarios
     * Validates advanced usage patterns and option handling
     */
    suite('Integration Tests', () => {
        /**
         * @brief Tests complex input box options handling
         * @test Validates that all advanced options are properly passed through
         */
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

        /**
         * @brief Tests prompt and options parameter merging
         * @test Validates that options object overrides prompt parameter
         */
        test('should merge prompt with options correctly', async () => {
            const options: vscode.InputBoxOptions = {
                prompt: 'Original prompt'
            };

            mockInputBoxResponse = 'result';

            await query.input('Override prompt', options);

            // Due to spread operator, options.prompt will override the parameter
            assert.strictEqual(mockLastInputOptions?.prompt, 'Original prompt', 'Should use prompt from options when provided');
        });

        /**
         * @brief Tests special character handling in quick pick items
         * @test Validates that items with special characters are handled correctly
         */
        test('should handle special characters in items', async () => {
            const mixedItems = ['string', '123', '', 'special@chars!'];
            mockQuickPickResponse = '123';

            const result = await query.quickPick(mixedItems, 'Pick one:');

            assert.strictEqual(result, '123', 'Should handle mixed string items');
        });
    });
});
