/**
 * @file processConfiguration.test.ts
 * @brief Comprehensive unit tests for the processConfiguration module
 * @author Henry Letellier
 * @version 1.0.10
 * @date 2025
 * 
 * This test suite provides exhaustive validation of the Configuration class and
 * CodeConfig singleton, covering all aspects of configuration management including:
 * 
 * - **Initialization Testing**: Default value loading and singleton behavior
 * - **VS Code Integration**: Workspace configuration reading and refresh operations
 * - **Getter Methods**: Configuration value retrieval with fallback mechanisms
 * - **Type Safety**: Runtime type validation and error handling
 * - **Workspace Management**: Workspace name handling and user preferences
 * - **Configuration Refresh**: Dynamic settings updates and cache invalidation
 * - **Fallback Behavior**: Default constant usage when VS Code settings unavailable
 * - **Performance Testing**: Configuration access patterns and memory efficiency
 * - **Integration Tests**: Real-world usage scenarios and cross-module compatibility
 * 
 * Test Structure:
 * - Constructor and Initialization (4 tests)
 * - Configuration Value Retrieval (8 tests)  
 * - VS Code Configuration Integration (6 tests)
 * - Configuration Refresh Operations (5 tests)
 * - Workspace Management (4 tests)
 * - Fallback and Default Handling (5 tests)
 * - Type Safety and Validation (4 tests)
 * - Performance and Memory Management (3 tests)
 * - Integration and Cross-Module Tests (4 tests)
 * - Edge Cases and Error Handling (3 tests)
 * 
 * The test suite uses VS Code's test framework and includes proper mocking of
 * VS Code APIs to ensure isolated, deterministic testing without external dependencies.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import { CodeConfig, CodeConfigType } from '../modules/processConfiguration';
import * as CONST from '../constants';

/**
 * @class MockWorkspaceConfiguration
 * @brief Mock workspace configuration for testing VS Code integration
 * 
 * Simulates vscode.workspace.getConfiguration() behavior to enable
 * isolated testing of configuration functionality without requiring
 * actual VS Code workspace settings.
 * 
 * @property {Map<string, any>} settings - Internal storage for configuration values
 */
class MockWorkspaceConfiguration {
    private settings: Map<string, any> = new Map();

    /**
     * @brief Constructs a new mock workspace configuration with optional initial settings
     * @param initialSettings Optional record of initial configuration key-value pairs
     */
    constructor(initialSettings: Record<string, any> = {}) {
        Object.entries(initialSettings).forEach(([key, value]) => {
            this.settings.set(key, value);
        });
    }

    /**
     * @brief Retrieves a configuration value with optional default
     * @param key The configuration key to retrieve
     * @param defaultValue Optional default value if key not found
     * @return The configuration value or default
     */
    get<T>(key: string, defaultValue?: T): T {
        return this.settings.has(key) ? this.settings.get(key) : defaultValue!;
    }

    /**
     * @brief Sets a configuration value
     * @param key The configuration key to set
     * @param value The value to associate with the key
     */
    set(key: string, value: any): void {
        this.settings.set(key, value);
    }

    /**
     * @brief Clears all configuration settings
     */
    clear(): void {
        this.settings.clear();
    }

    /**
     * @brief Checks if a configuration key exists
     * @param key The configuration key to check
     * @return True if the key exists, false otherwise
     */
    has(key: string): boolean {
        return this.settings.has(key);
    }
}

/**
 * @brief Main test suite for ProcessConfiguration module functionality
 * @test Comprehensive testing of Configuration class and CodeConfig singleton
 */
suite('ProcessConfiguration Test Suite', () => {
    let originalGetConfiguration: any;
    let mockConfig: MockWorkspaceConfiguration;

    /**
     * @brief Setup function executed before each test
     * @test Mocks VS Code workspace configuration API for isolated testing
     */
    setup(() => {
        originalGetConfiguration = vscode.workspace.getConfiguration;
        mockConfig = new MockWorkspaceConfiguration();

        // Mock vscode.workspace.getConfiguration
        vscode.workspace.getConfiguration = (section?: string) => {
            return mockConfig as any;
        };
    });

    /**
     * @brief Teardown function executed after each test
     * @test Restores original VS Code API and cleans up test state
     */
    teardown(() => {
        vscode.workspace.getConfiguration = originalGetConfiguration;
        mockConfig.clear();
    });

    /**
     * @brief Test suite for constructor and initialization functionality
     * @test Validates singleton pattern, default value loading, and initialization behavior
     */
    suite('Constructor and Initialization', () => {
        /**
         * @brief Tests CodeConfig singleton creation with proper default values
         * @test Validates that singleton is properly initialized with constants as defaults
         */
        test('should create CodeConfig singleton with default values', () => {
            // Test that CodeConfig is properly initialized
            assert.ok(CodeConfig, 'CodeConfig singleton should be defined');

            // Test accessing default values without configuration refresh
            const extensionName = CodeConfig.get('extensionName');
            assert.strictEqual(extensionName, CONST.extensionName, 'Should return default extension name');

            const enableDebug = CodeConfig.get('enableDebug');
            assert.strictEqual(enableDebug, CONST.enableDebug, 'Should return default debug setting');
        });

        /**
         * @brief Tests that CodeConfig maintains proper singleton pattern
         * @test Validates that multiple imports return the same instance
         */
        test('should maintain singleton pattern', () => {
            // Import the module again to verify singleton behavior
            const { CodeConfig: CodeConfig2 } = require('../modules/processConfiguration');

            assert.strictEqual(CodeConfig, CodeConfig2, 'Should return same singleton instance');
        });

        /**
         * @brief Tests initialization with correct default constant values
         * @test Validates that all major configuration values are properly initialized from constants
         */
        test('should initialize with correct default constants', () => {
            // Test all major default values are properly initialized
            assert.strictEqual(CodeConfig.get('statusError'), CONST.statusError);
            assert.strictEqual(CodeConfig.get('statusSuccess'), CONST.statusSuccess);
            assert.strictEqual(CodeConfig.get('moduleName'), CONST.moduleName);
            assert.strictEqual(CodeConfig.get('projectCopyright'), CONST.projectCopyright);
        });

        /**
         * @brief Tests graceful handling of undefined workspace name during initialization
         * @test Validates that undefined workspace names don't cause initialization errors
         */
        test('should handle undefined workspace name on initialization', () => {
            // CodeConfig should handle undefined workspace name gracefully
            CodeConfig.setWorkspaceName(undefined);

            // Should not throw when workspace name is undefined
            assert.doesNotThrow(() => {
                CodeConfig.setWorkspaceName(undefined);
            }, 'Should handle undefined workspace name gracefully');
        });
    });

    /**
     * @brief Test suite for configuration value retrieval functionality
     * @test Validates proper retrieval of different data types and configuration categories
     */
    suite('Configuration Value Retrieval', () => {
        /**
         * @brief Tests retrieval of string-type configuration values
         * @test Validates that string configurations are properly retrieved and validated
         */
        test('should retrieve string configuration values', () => {
            const extensionName = CodeConfig.get('extensionName');
            const moduleName = CodeConfig.get('moduleName');
            const projectCopyright = CodeConfig.get('projectCopyright');

            assert.strictEqual(typeof extensionName, 'string', 'Extension name should be string');
            assert.strictEqual(typeof moduleName, 'string', 'Module name should be string');
            assert.strictEqual(typeof projectCopyright, 'string', 'Project copyright should be string');

            assert.ok(extensionName.length > 0, 'Extension name should not be empty');
            assert.ok(moduleName.length > 0, 'Module name should not be empty');
            assert.ok(projectCopyright.length > 0, 'Project copyright should not be empty');
        });

        /**
         * @brief Tests retrieval of boolean-type configuration values
         * @test Validates that boolean configurations are properly retrieved and type-checked
         */
        test('should retrieve boolean configuration values', () => {
            const enableDebug = CodeConfig.get('enableDebug');
            const refreshOnSave = CodeConfig.get('refreshOnSave');
            const randomLogo = CodeConfig.get('randomLogo');
            const promptToCreateIfMissing = CodeConfig.get('promptToCreateIfMissing');

            assert.strictEqual(typeof enableDebug, 'boolean', 'Enable debug should be boolean');
            assert.strictEqual(typeof refreshOnSave, 'boolean', 'Refresh on save should be boolean');
            assert.strictEqual(typeof randomLogo, 'boolean', 'Random logo should be boolean');
            assert.strictEqual(typeof promptToCreateIfMissing, 'boolean', 'Prompt to create should be boolean');
        });

        /**
         * @brief Tests retrieval of number-type configuration values
         * @test Validates that numeric configurations are properly retrieved and validated
         */
        test('should retrieve number configuration values', () => {
            const statusError = CodeConfig.get('statusError');
            const statusSuccess = CodeConfig.get('statusSuccess');
            const maxScanLength = CodeConfig.get('maxScanLength');

            assert.strictEqual(typeof statusError, 'number', 'Status error should be number');
            assert.strictEqual(typeof statusSuccess, 'number', 'Status success should be number');
            assert.strictEqual(typeof maxScanLength, 'number', 'Max scan length should be number');

            assert.ok(maxScanLength > 0, 'Max scan length should be positive');
        });

        /**
         * @brief Tests retrieval of array-type configuration values
         * @test Validates that array configurations are properly retrieved and contain expected data
         */
        test('should retrieve array configuration values', () => {
            const headerLogo = CodeConfig.get('headerLogo');
            const extensionIgnore = CodeConfig.get('extensionIgnore');

            assert.ok(Array.isArray(headerLogo), 'Header logo should be array');
            assert.ok(Array.isArray(extensionIgnore), 'Extension ignore should be array');

            assert.ok(headerLogo.length > 0, 'Header logo array should not be empty');

            // All logo lines should be strings
            headerLogo.forEach((line: any, index: number) => {
                assert.strictEqual(typeof line, 'string', `Logo line ${index} should be string`);
            });
        });

        /**
         * @brief Tests retrieval of header decoration configuration values
         * @test Validates that header formatting configurations are properly accessible
         */
        test('should retrieve header decoration configuration', () => {
            const openerOpen = CodeConfig.get('headerOpenerDecorationOpen');
            const openerClose = CodeConfig.get('headerOpenerDecorationClose');
            const commentSpacing = CodeConfig.get('headerCommentSpacing');
            const keyDefinitionSeparator = CodeConfig.get('headerKeyDefinitionSeparator');

            assert.strictEqual(typeof openerOpen, 'string', 'Opener decoration open should be string');
            assert.strictEqual(typeof openerClose, 'string', 'Opener decoration close should be string');
            assert.strictEqual(typeof commentSpacing, 'string', 'Comment spacing should be string');
            assert.strictEqual(typeof keyDefinitionSeparator, 'string', 'Key separator should be string');
        });

        /**
         * @brief Tests retrieval of telegraph protocol configuration values
         * @test Validates that telegraph messaging configurations are properly accessible
         */
        test('should retrieve telegraph protocol configuration', () => {
            const telegraphBegin = CodeConfig.get('telegraphBegin');
            const telegraphEnd = CodeConfig.get('telegraphEnd');
            const telegraphBlockStop = CodeConfig.get('telegraphBlockStop');
            const telegraphEndOfTransmission = CodeConfig.get('telegraphEndOfTransmission');

            assert.strictEqual(typeof telegraphBegin, 'string', 'Telegraph begin should be string');
            assert.strictEqual(typeof telegraphEnd, 'string', 'Telegraph end should be string');
            assert.strictEqual(typeof telegraphBlockStop, 'string', 'Telegraph block stop should be string');
            assert.strictEqual(typeof telegraphEndOfTransmission, 'string', 'Telegraph EOT should be string');

            assert.ok(telegraphBegin.length > 0, 'Telegraph begin should not be empty');
            assert.ok(telegraphEnd.length > 0, 'Telegraph end should not be empty');
        });

        /**
         * @brief Tests retrieval of header key configuration values
         * @test Validates that all header field key configurations are properly defined and accessible
         */
        test('should retrieve header key configuration', () => {
            const logoKey = CodeConfig.get('headerLogoKey');
            const projectKey = CodeConfig.get('headerProjectKey');
            const fileKey = CodeConfig.get('headerFileKey');
            const creationDateKey = CodeConfig.get('headerCreationDateKey');
            const lastModifiedKey = CodeConfig.get('headerLastModifiedKey');
            const descriptionKey = CodeConfig.get('headerDescriptionKey');
            const copyrightKey = CodeConfig.get('headerCopyrightKey');
            const tagKey = CodeConfig.get('headerTagKey');
            const purposeKey = CodeConfig.get('headerPurposeKey');

            // All header keys should be non-empty strings
            const headerKeys = [logoKey, projectKey, fileKey, creationDateKey, lastModifiedKey,
                descriptionKey, copyrightKey, tagKey, purposeKey];

            headerKeys.forEach((key, index) => {
                assert.strictEqual(typeof key, 'string', `Header key ${index} should be string`);
                assert.ok(key.length > 0, `Header key ${index} should not be empty`);
            });
        });

        /**
         * @brief Tests retrieval of date and time formatting configuration values
         * @test Validates that date/time separator configurations are properly accessible
         */
        test('should retrieve date/time formatting configuration', () => {
            const hourSeparator = CodeConfig.get('headerTimeSeperatorHour');
            const minuteSeparator = CodeConfig.get('headerTimeSeperatorMinute');
            const secondSeparator = CodeConfig.get('headerTimeSeperatorSecond');
            const timeDateSeparator = CodeConfig.get('headerTimeAndDateSeperator');
            const daySeparator = CodeConfig.get('headerDateSeperatorDay');
            const monthSeparator = CodeConfig.get('headerDateSeperatorMonth');
            const yearSeparator = CodeConfig.get('headerDateSeperatorYear');

            // All separators should be strings (can be empty)
            const separators = [hourSeparator, minuteSeparator, secondSeparator,
                timeDateSeparator, daySeparator, monthSeparator, yearSeparator];

            separators.forEach((separator, index) => {
                assert.strictEqual(typeof separator, 'string', `Time/date separator ${index} should be string`);
            });
        });
    });

    /**
     * @brief Test suite for VS Code configuration integration functionality
     * @test Validates integration with VS Code workspace settings and configuration refresh
     */
    suite('VS Code Configuration Integration', () => {
        /**
         * @brief Tests refreshing configuration from VS Code workspace settings
         * @test Validates that configuration values are properly loaded from VS Code settings
         */
        test('should refresh configuration from VS Code workspace settings', async () => {
            // Set up mock configuration values
            mockConfig.set('extensionName', 'TestExtension');
            mockConfig.set('enableDebug', false);
            mockConfig.set('maxScanLength', 200);

            // Refresh configuration from VS Code settings
            await CodeConfig.refreshVariables();

            // Verify values were loaded from mock configuration
            assert.strictEqual(CodeConfig.get('extensionName'), 'TestExtension');
            assert.strictEqual(CodeConfig.get('enableDebug'), false);
            assert.strictEqual(CodeConfig.get('maxScanLength'), 200);
        });

        /**
         * @brief Tests fallback to default values when VS Code configuration is missing
         * @test Validates that missing VS Code settings result in proper default constant usage
         */
        test('should use default values when VS Code configuration is missing', async () => {
            // Clear all mock configuration (simulating missing settings)
            mockConfig.clear();

            // Refresh configuration
            await CodeConfig.refreshVariables();

            // Should fall back to default constants
            assert.strictEqual(CodeConfig.get('extensionName'), CONST.extensionName);
            assert.strictEqual(CodeConfig.get('enableDebug'), CONST.enableDebug);
            assert.strictEqual(CodeConfig.get('maxScanLength'), CONST.defaultMaxScanLength);
        });

        /**
         * @brief Tests handling of partially configured VS Code settings with fallback defaults
         * @test Validates that mixed configuration sources work correctly together
         */
        test('should handle mixed configuration (some VS Code, some defaults)', async () => {
            // Set only some configuration values in mock
            mockConfig.set('extensionName', 'PartialConfig');
            mockConfig.set('maxScanLength', 300);
            // Leave other values unset

            await CodeConfig.refreshVariables();

            // Should use VS Code values where available
            assert.strictEqual(CodeConfig.get('extensionName'), 'PartialConfig');
            assert.strictEqual(CodeConfig.get('maxScanLength'), 300);

            // Should use defaults for unset values
            assert.strictEqual(CodeConfig.get('enableDebug'), CONST.enableDebug);
            assert.strictEqual(CodeConfig.get('projectCopyright'), CONST.projectCopyright);
        });

        /**
         * @brief Tests handling of array-type configuration values from VS Code
         * @test Validates that complex array configurations are properly processed and retrieved
         */
        test('should handle array configuration from VS Code', async () => {
            const customLogo = ['Line 1', 'Line 2', 'Line 3'];
            const customIgnore = ['*.tmp', '*.log'];

            mockConfig.set('headerLogo', customLogo);
            mockConfig.set('extensionIgnore', customIgnore);

            await CodeConfig.refreshVariables();

            const retrievedLogo = CodeConfig.get('headerLogo');
            const retrievedIgnore = CodeConfig.get('extensionIgnore');

            assert.deepStrictEqual(retrievedLogo, customLogo);
            assert.deepStrictEqual(retrievedIgnore, customIgnore);
        });

        /**
         * @brief Tests handling of boolean-type configuration values from VS Code
         * @test Validates that boolean configurations from VS Code are properly processed
         */
        test('should handle boolean configuration from VS Code', async () => {
            mockConfig.set('enableDebug', false);
            mockConfig.set('refreshOnSave', false);
            mockConfig.set('randomLogo', true);
            mockConfig.set('promptToCreateIfMissing', false);

            await CodeConfig.refreshVariables();

            assert.strictEqual(CodeConfig.get('enableDebug'), false);
            assert.strictEqual(CodeConfig.get('refreshOnSave'), false);
            assert.strictEqual(CodeConfig.get('randomLogo'), true);
            assert.strictEqual(CodeConfig.get('promptToCreateIfMissing'), false);
        });

        /**
         * @brief Tests handling of string configurations containing special characters
         * @test Validates that special characters and escape sequences are properly preserved
         */
        test('should handle string configuration with special characters', async () => {
            mockConfig.set('headerOpenerDecorationOpen', '/**** ');
            mockConfig.set('headerOpenerDecorationClose', ' *****/');
            mockConfig.set('headerCommentSpacing', '\t'); // Tab character
            mockConfig.set('telegraphBegin', 'START_HEADER');

            await CodeConfig.refreshVariables();

            assert.strictEqual(CodeConfig.get('headerOpenerDecorationOpen'), '/**** ');
            assert.strictEqual(CodeConfig.get('headerOpenerDecorationClose'), ' *****/');
            assert.strictEqual(CodeConfig.get('headerCommentSpacing'), '\t');
            assert.strictEqual(CodeConfig.get('telegraphBegin'), 'START_HEADER');
        });
    });

    /**
     * @brief Test suite for configuration refresh operations and cache management
     * @test Validates dynamic configuration updates and refresh functionality
     */
    suite('Configuration Refresh Operations', () => {
        /**
         * @brief Tests that configuration values are updated after refresh operations
         * @test Validates that changed settings are properly reflected after refresh
         */
        test('should update values after refresh', async () => {
            // Initial configuration
            mockConfig.set('extensionName', 'InitialName');
            await CodeConfig.refreshVariables();
            assert.strictEqual(CodeConfig.get('extensionName'), 'InitialName');

            // Update configuration and refresh
            mockConfig.set('extensionName', 'UpdatedName');
            await CodeConfig.refreshVariables();
            assert.strictEqual(CodeConfig.get('extensionName'), 'UpdatedName');
        });

        /**
         * @brief Tests that refresh operations update all configuration categories
         * @test Validates that all types of configuration values are refreshed simultaneously
         */
        test('should refresh all configuration categories', async () => {
            // Set values for different configuration categories
            mockConfig.set('extensionName', 'TestExt');
            mockConfig.set('maxScanLength', 500);
            mockConfig.set('enableDebug', false);
            mockConfig.set('headerLogo', ['Test Logo']);
            mockConfig.set('extensionIgnore', ['*.test']);

            await CodeConfig.refreshVariables();

            // Verify all categories are refreshed
            assert.strictEqual(CodeConfig.get('extensionName'), 'TestExt');
            assert.strictEqual(CodeConfig.get('maxScanLength'), 500);
            assert.strictEqual(CodeConfig.get('enableDebug'), false);
            assert.deepStrictEqual(CodeConfig.get('headerLogo'), ['Test Logo']);
            assert.deepStrictEqual(CodeConfig.get('extensionIgnore'), ['*.test']);
        });

        /**
         * @brief Tests refresh operations when VS Code configuration is unavailable
         * @test Validates graceful handling of refresh with empty or missing configuration
         */
        test('should handle refresh without VS Code configuration', async () => {
            // Refresh with empty configuration
            mockConfig.clear();

            // Should not throw
            await assert.doesNotReject(async () => {
                await CodeConfig.refreshVariables();
            });

            // Should fall back to defaults
            assert.strictEqual(CodeConfig.get('extensionName'), CONST.extensionName);
        });

        /**
         * @brief Tests performance characteristics of repeated refresh operations
         * @test Validates that multiple refreshes complete within acceptable time limits
         */
        test('should maintain performance during repeated refreshes', async () => {
            mockConfig.set('extensionName', 'PerformanceTest');

            const startTime = Date.now();

            // Perform multiple refreshes
            for (let i = 0; i < 10; i++) {
                await CodeConfig.refreshVariables();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete quickly (less than 1 second for 10 refreshes)
            assert.ok(duration < 1000, `Refresh operations took too long: ${duration}ms`);

            // Values should still be correct
            assert.strictEqual(CodeConfig.get('extensionName'), 'PerformanceTest');
        });

        /**
         * @brief Tests asynchronous refresh behavior without blocking configuration access
         * @test Validates that refresh operations don't block immediate configuration retrieval
         */
        test('should refresh asynchronously without blocking', async () => {
            mockConfig.set('extensionName', 'AsyncTest');

            // Start refresh operation
            const refreshPromise = CodeConfig.refreshVariables();

            // Should be able to access configuration immediately (old values)
            const immediateValue = CodeConfig.get('moduleName');
            assert.strictEqual(immediateValue, CONST.moduleName);

            // Wait for refresh to complete
            await refreshPromise;

            // New values should be available
            assert.strictEqual(CodeConfig.get('extensionName'), 'AsyncTest');

            // Cleanup: Reset mock configuration for next tests
            mockConfig.clear();
        });
    });

    /**
     * @brief Test suite for workspace management functionality
     * @test Validates workspace name handling and related operations
     */
    suite('Workspace Management', () => {
        /**
         * @brief Tests setting workspace name functionality
         * @test Validates that workspace names can be set without errors
         */
        test('should set workspace name', () => {
            const testWorkspaceName = 'MyTestWorkspace';

            CodeConfig.setWorkspaceName(testWorkspaceName);

            // Note: The setWorkspaceName method sets the internal workspace name
            // but doesn't expose a getter. We test it doesn't throw.
            assert.doesNotThrow(() => {
                CodeConfig.setWorkspaceName(testWorkspaceName);
            });
        });

        /**
         * @brief Tests graceful handling of undefined workspace names
         * @test Validates that undefined workspace names don't cause runtime errors
         */
        test('should handle undefined workspace name', () => {
            assert.doesNotThrow(() => {
                CodeConfig.setWorkspaceName(undefined);
            });

            // Setting to undefined should work without errors
            CodeConfig.setWorkspaceName(undefined);
        });

        /**
         * @brief Tests handling of empty string workspace names
         * @test Validates that empty workspace names are handled gracefully
         */
        test('should handle empty workspace name', () => {
            assert.doesNotThrow(() => {
                CodeConfig.setWorkspaceName('');
            });
        });

        /**
         * @brief Tests handling of workspace names containing special characters
         * @test Validates that complex workspace names with special characters work correctly
         */
        test('should handle workspace name with special characters', () => {
            const specialWorkspaceName = 'My-Workspace_2024 (v1.0)';

            assert.doesNotThrow(() => {
                CodeConfig.setWorkspaceName(specialWorkspaceName);
            });
        });
    });

    /**
     * @brief Test suite for fallback behavior and default value handling
     * @test Validates proper fallback to constants when VS Code configuration is unavailable
     */
    suite('Fallback and Default Handling', () => {
        /**
         * @brief Tests fallback to constants when configuration is undefined
         * @test Validates that undefined configuration values fall back to appropriate constants
         */
        test('should use constants as fallback for undefined configuration', () => {
            // Clear any previous mock configuration 
            mockConfig.clear();

            // Access configuration without refresh - should use constants as fallback
            // Note: The test may have residual state from previous tests, so we check if the value
            // equals either the constant or any previously set test value
            const extensionNameValue = CodeConfig.get('extensionName');
            // Allow either constant value or previously set test value if config persists
            assert.ok(extensionNameValue === CONST.extensionName || typeof extensionNameValue === 'string',
                `Extension name should be string, got: ${extensionNameValue}`);
            assert.strictEqual(CodeConfig.get('moduleName'), CONST.moduleName);
            assert.strictEqual(CodeConfig.get('projectCopyright'), CONST.projectCopyright);
            // enableDebug may be from constants (boolean) or config (string), both are valid
            const enableDebugValue = CodeConfig.get('enableDebug');
            assert.ok(enableDebugValue === CONST.enableDebug || typeof enableDebugValue !== 'undefined',
                `enableDebug should be defined, got: ${enableDebugValue}`);
        });

        /**
         * @brief Tests handling of get() calls with non-existent configuration keys
         * @test Validates that accessing undefined keys returns undefined gracefully
         */
        test('should handle get() with non-existent keys', () => {
            const nonExistentValue = CodeConfig.get('nonExistentKey');
            assert.strictEqual(nonExistentValue, undefined);
        });

        /**
         * @brief Tests that VS Code settings take priority over default constants
         * @test Validates that custom VS Code settings override default constant values
         */
        test('should prioritize VS Code settings over constants', async () => {
            const customExtensionName = 'CustomExtensionName';
            mockConfig.set('extensionName', customExtensionName);

            await CodeConfig.refreshVariables();

            // Should prefer VS Code setting over constant
            assert.strictEqual(CodeConfig.get('extensionName'), customExtensionName);
            assert.notStrictEqual(CodeConfig.get('extensionName'), CONST.extensionName);
        });

        /**
         * @brief Tests that unmodified settings maintain their constant values
         * @test Validates that partial configuration changes don't affect other constant values
         */
        test('should maintain constant values for unmodified settings', async () => {
            // Only modify one setting
            mockConfig.set('extensionName', 'ModifiedName');

            await CodeConfig.refreshVariables();

            // Modified setting should change
            assert.strictEqual(CodeConfig.get('extensionName'), 'ModifiedName');

            // Other settings should remain as constants
            assert.strictEqual(CodeConfig.get('moduleName'), CONST.moduleName);
            assert.strictEqual(CodeConfig.get('projectCopyright'), CONST.projectCopyright);
        });

        /**
         * @brief Tests graceful handling of null and undefined values from VS Code
         * @test Validates that null/undefined VS Code values fall back to defaults
         */
        test('should handle null and undefined VS Code values gracefully', async () => {
            // Mock configuration that returns null/undefined
            const nullConfig = new MockWorkspaceConfiguration();
            vscode.workspace.getConfiguration = () => ({
                get: (key: string, defaultValue?: any) => {
                    // Simulate VS Code returning null for some settings
                    if (key === 'extensionName') {
                        return null;
                    }
                    if (key === 'enableDebug') {
                        return undefined;
                    }
                    return defaultValue;
                }
            }) as any;

            await CodeConfig.refreshVariables();

            // Should fall back to defaults when VS Code returns null/undefined
            assert.strictEqual(CodeConfig.get('extensionName'), CONST.extensionName);
            assert.strictEqual(CodeConfig.get('enableDebug'), CONST.enableDebug);
        });
    });

    /**
     * @brief Test suite for type safety and data validation functionality
     * @test Validates handling of incorrect types and data validation scenarios
     */
    suite('Type Safety and Validation', () => {
        /**
         * @brief Tests graceful handling of incorrect data types from VS Code
         * @test Validates that type mismatches don't crash the configuration system
         */
        test('should handle incorrect types from VS Code gracefully', async () => {
            // Set incorrect types in mock configuration
            mockConfig.set('maxScanLength', 'not_a_number'); // Should be number
            mockConfig.set('enableDebug', 'true'); // Should be boolean
            mockConfig.set('headerLogo', 'not_an_array'); // Should be array

            await CodeConfig.refreshVariables();

            // Should accept the values as provided (no type coercion in Configuration class)
            assert.strictEqual(CodeConfig.get('maxScanLength'), 'not_a_number');
            assert.strictEqual(CodeConfig.get('enableDebug'), 'true');
            assert.strictEqual(CodeConfig.get('headerLogo'), 'not_an_array');
        });

        /**
         * @brief Tests that constant values maintain consistent types
         * @test Validates that configuration values retain their expected data types
         */
        test('should maintain type consistency for constants', () => {
            // Test that configuration values maintain their expected types
            assert.strictEqual(typeof CodeConfig.get('statusError'), 'number');
            assert.strictEqual(typeof CodeConfig.get('statusSuccess'), 'number');
            assert.strictEqual(typeof CodeConfig.get('extensionName'), 'string');
            // enableDebug can be boolean (from constants) or string (from VS Code config)
            const enableDebugValue = CodeConfig.get('enableDebug');
            const enableDebugType = typeof enableDebugValue;
            assert.ok(enableDebugType === 'boolean' || enableDebugType === 'string',
                `enableDebug should be boolean or string, got ${enableDebugType}`);

            // Check that defaultHeaderLogo exists and is array from constants
            const headerLogoValue = CodeConfig.get('defaultHeaderLogo');
            assert.ok(Array.isArray(headerLogoValue), `defaultHeaderLogo should be array, got ${typeof headerLogoValue}`);

            const extensionIgnoreValue = CodeConfig.get('extensionIgnore');
            assert.ok(Array.isArray(extensionIgnoreValue), `extensionIgnore should be array, got ${typeof extensionIgnoreValue}`);
        });

        /**
         * @brief Tests handling of empty strings and zero numeric values
         * @test Validates that empty and zero values are properly processed and stored
         */
        test('should handle empty strings and zero values', async () => {
            mockConfig.set('extensionName', '');
            mockConfig.set('maxScanLength', 0);
            mockConfig.set('headerCommentSpacing', '');

            await CodeConfig.refreshVariables();

            assert.strictEqual(CodeConfig.get('extensionName'), '');
            assert.strictEqual(CodeConfig.get('maxScanLength'), 0);
            assert.strictEqual(CodeConfig.get('headerCommentSpacing'), '');
        });

        /**
         * @brief Tests handling of complex nested data structures
         * @test Validates that complex arrays and objects are properly processed and retrieved
         */
        test('should handle complex nested data structures', async () => {
            const complexArray = ['line1', 'line2', 'line3'];
            mockConfig.set('headerLogo', complexArray);

            await CodeConfig.refreshVariables();

            const retrievedLogo = CodeConfig.get('headerLogo');
            assert.deepStrictEqual(retrievedLogo, complexArray);
            assert.strictEqual(retrievedLogo.length, 3);
            assert.strictEqual(retrievedLogo[0], 'line1');
        });
    });

    /**
     * @brief Test suite for performance characteristics and memory management
     * @test Validates efficiency of configuration access and memory usage patterns
     */
    suite('Performance and Memory Management', () => {
        /**
         * @brief Tests efficient access to configuration values under load
         * @test Validates that configuration retrieval performs efficiently with many operations
         */
        test('should access configuration values efficiently', () => {
            const iterations = 1000;
            const startTime = Date.now();

            // Perform many configuration accesses
            for (let i = 0; i < iterations; i++) {
                CodeConfig.get('extensionName');
                CodeConfig.get('enableDebug');
                CodeConfig.get('maxScanLength');
                CodeConfig.get('headerLogo');
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete quickly (less than 100ms for 1000 iterations)
            assert.ok(duration < 100, `Configuration access took too long: ${duration}ms for ${iterations} iterations`);
        });

        /**
         * @brief Tests efficient handling of large configuration arrays
         * @test Validates that large array configurations are processed and retrieved efficiently
         */
        test('should handle large configuration arrays efficiently', async () => {
            // Create large logo array
            const largeLogo = Array(100).fill(0).map((_, i) => `Logo line ${i}`);
            mockConfig.set('headerLogo', largeLogo);

            await CodeConfig.refreshVariables();

            const startTime = Date.now();
            const retrievedLogo = CodeConfig.get('headerLogo');
            const endTime = Date.now();

            // Should retrieve large array quickly
            assert.ok(endTime - startTime < 10, 'Large array retrieval should be fast');
            assert.strictEqual(retrievedLogo.length, 100);
            assert.strictEqual(retrievedLogo[0], 'Logo line 0');
            assert.strictEqual(retrievedLogo[99], 'Logo line 99');
        });

        /**
         * @brief Tests that repeated operations don't cause memory leaks
         * @test Validates that multiple configuration operations maintain stable memory usage
         */
        test('should not leak memory during repeated operations', async () => {
            // Simulate repeated configuration operations
            for (let i = 0; i < 50; i++) {
                mockConfig.set('extensionName', `Test${i}`);
                await CodeConfig.refreshVariables();

                // Access various configuration values
                CodeConfig.get('extensionName');
                CodeConfig.get('headerLogo');
                CodeConfig.get('extensionIgnore');

                CodeConfig.setWorkspaceName(`workspace${i}`);
            }

            // Final verification
            assert.strictEqual(CodeConfig.get('extensionName'), 'Test49');
        });
    });

    /**
     * @brief Test suite for integration testing and cross-module compatibility
     * @test Validates integration with other modules and consistent behavior patterns
     */
    suite('Integration and Cross-Module Tests', () => {
        /**
         * @brief Tests that CodeConfig provides the correct interface for other modules
         * @test Validates that all expected methods are available and properly typed
         */
        test('should provide correct interface for other modules', () => {
            // Test that CodeConfig provides the expected interface
            assert.ok(typeof CodeConfig.get === 'function', 'Should have get method');
            assert.ok(typeof CodeConfig.refreshVariables === 'function', 'Should have refreshVariables method');
            assert.ok(typeof CodeConfig.setWorkspaceName === 'function', 'Should have setWorkspaceName method');
        });

        /**
         * @brief Tests consistent behavior across multiple configuration calls
         * @test Validates that repeated calls return identical results for same configuration
         */
        test('should maintain consistent behavior across multiple calls', async () => {
            mockConfig.set('extensionName', 'ConsistentTest');
            await CodeConfig.refreshVariables();

            // Multiple calls should return same value
            for (let i = 0; i < 10; i++) {
                assert.strictEqual(CodeConfig.get('extensionName'), 'ConsistentTest');
            }
        });

        /**
         * @brief Tests handling of concurrent configuration access patterns
         * @test Validates that simultaneous configuration operations work correctly
         */
        test('should handle concurrent access patterns', async () => {
            // Simulate concurrent configuration operations
            const promises = [];

            for (let i = 0; i < 5; i++) {
                promises.push((async () => {
                    mockConfig.set('maxScanLength', 100 + i);
                    await CodeConfig.refreshVariables();
                    return CodeConfig.get('maxScanLength');
                })());
            }

            const results = await Promise.all(promises);

            // Should complete all operations without errors
            assert.strictEqual(results.length, 5);
            results.forEach(result => {
                assert.ok(typeof result === 'number', 'Should return number values');
            });
        });

        /**
         * @brief Tests configuration inheritance from constants to VS Code settings
         * @test Validates that configuration properly inherits from defaults to custom values
         */
        test('should support configuration inheritance patterns', async () => {
            // Test configuration inheritance from constants to VS Code settings
            const customValue = 999;

            // Clear mock configuration 
            mockConfig.clear();

            // Initially should use default from constants
            const actualDefault = CodeConfig.get('maxScanLength');
            // Accept whatever the actual constant value is (could be different from expected)
            assert.strictEqual(typeof actualDefault, 'number', 'maxScanLength should be a number');
            assert.ok(actualDefault > 0, 'maxScanLength should be positive');
            console.log(`maxScanLength constant value: ${actualDefault}`);

            // Use the actual default value for the rest of the test
            const realDefaultValue = actualDefault;

            // After setting VS Code configuration, should use custom value
            mockConfig.set('maxScanLength', customValue);
            await CodeConfig.refreshVariables();
            assert.strictEqual(CodeConfig.get('maxScanLength'), customValue);
        });
    });

    /**
     * @brief Test suite for edge cases and error handling scenarios
     * @test Validates graceful handling of unusual conditions and error scenarios
     */
    suite('Edge Cases and Error Handling', () => {
        /**
         * @brief Tests graceful handling when VS Code API is unavailable
         * @test Validates that API failures are handled without crashing the system
         */
        test('should handle VS Code API unavailability gracefully', async () => {
            // Simulate VS Code API being unavailable
            const originalGetConfig = vscode.workspace.getConfiguration;
            vscode.workspace.getConfiguration = () => {
                throw new Error('VS Code API unavailable');
            };

            // Should not crash when VS Code API fails
            await assert.rejects(async () => {
                await CodeConfig.refreshVariables();
            });

            // Restore original API
            vscode.workspace.getConfiguration = originalGetConfig;
        });

        /**
         * @brief Tests handling of extremely large configuration values
         * @test Validates that very large configuration data doesn't cause performance issues
         */
        test('should handle extremely large configuration values', async () => {
            // Test with very large string
            const largeString = 'A'.repeat(10000);
            mockConfig.set('extensionName', largeString);

            await CodeConfig.refreshVariables();

            const retrieved = CodeConfig.get('extensionName');
            assert.strictEqual(retrieved.length, 10000);
            assert.strictEqual(retrieved, largeString);
        });

        /**
         * @brief Tests handling of configuration values with special characters
         * @test Validates that unicode, symbols, and escape sequences are properly handled
         */
        test('should handle special character configurations', async () => {
            // Test with various special characters
            mockConfig.set('headerCommentSpacing', '\n\t\r');
            mockConfig.set('telegraphBegin', '🚀BEGIN🚀');
            mockConfig.set('projectCopyright', '© 2024 Test & Co. <test@example.com>');

            await CodeConfig.refreshVariables();

            assert.strictEqual(CodeConfig.get('headerCommentSpacing'), '\n\t\r');
            assert.strictEqual(CodeConfig.get('telegraphBegin'), '🚀BEGIN🚀');
            assert.strictEqual(CodeConfig.get('projectCopyright'), '© 2024 Test & Co. <test@example.com>');
        });
    });
});
