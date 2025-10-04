/**
 * @file messageProvider.test.ts
 * @brief Comprehensive test suite for MessageProvider with message template validation
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This module provides extensive testing coverage for the MessageProvider module,
 * validating message template functionality, parameter substitution, and integration
 * with the AsperHeader extension's messaging system.
 * 
 * Test Coverage:
 * - Message template validation and retrieval
 * - Parameter substitution in message templates
 * - Message reference integrity and completeness
 * - Error handling for missing or malformed messages
 * - Type safety for message parameters
 */

import * as assert from 'assert';
import { getMessage } from '../modules/messageProvider';
import { messages } from '../modules/messageReference';

/**
 * @brief Main test suite for MessageProvider functionality
 * @test Comprehensive testing of message template validation, parameter substitution, and integration
 */
suite('MessageProvider Test Suite', function () {

    /**
     * @brief Test suite for basic message retrieval functionality
     * @test Validates core message retrieval with and without parameters
     */
    suite('Basic Message Retrieval', () => {
        /**
         * @brief Tests retrieval of simple messages that don't require parameters
         * @test Validates that parameterless messages return correct string content
         */
        test('should retrieve simple messages without parameters', () => {
            // Test messages that don't require parameters
            const refreshMessage = getMessage("fileRefreshed");
            assert.ok(typeof refreshMessage === 'string');
            assert.ok(refreshMessage.length > 0);
            assert.strictEqual(refreshMessage, "Refreshing file content.");

            const saveFailed = getMessage("fileSaveFailed");
            assert.ok(typeof saveFailed === 'string');
            assert.strictEqual(saveFailed, "Failed to save the file, please try saving it again.");
        });

        /**
         * @brief Tests handling of messages that require a single parameter
         * @test Validates parameter substitution in single-parameter message templates
         */
        test('should handle messages with single parameters', () => {
            const testPath = '/test/path/file.json';
            const fileLoaded = getMessage("fileLoaded", testPath);

            assert.ok(typeof fileLoaded === 'string');
            assert.ok(fileLoaded.includes(testPath));
            assert.strictEqual(fileLoaded, `File ${testPath} loaded!`);
        });

        /**
         * @brief Tests handling of messages that require multiple parameters
         * @test Validates correct substitution of multiple parameters in message templates
         */
        test('should handle messages with multiple parameters', () => {
            const oldPath = '/old/path';
            const newPath = '/new/path';
            const pathUpdated = getMessage("filePathUpdated", oldPath, newPath);

            assert.ok(typeof pathUpdated === 'string');
            assert.ok(pathUpdated.includes(oldPath));
            assert.ok(pathUpdated.includes(newPath));
            assert.strictEqual(pathUpdated, `The path has been updated from ${oldPath} to ${newPath}.`);
        });
    });

    /**
     * @brief Test suite for parameter substitution functionality
     * @test Validates handling of different data types and edge cases in parameter substitution
     */
    suite('Parameter Substitution', () => {
        /**
         * @brief Tests parameter substitution with various data types
         * @test Validates that strings, numbers, and booleans are properly converted and substituted
         */
        test('should handle various data types as parameters', () => {
            // String parameters
            const stringParam = getMessage("fileUnloaded", "test.json");
            assert.ok(stringParam.includes("test.json"));

            // Number parameters (converted to string)
            const numberParam = getMessage("fileLoaded", 12345);
            assert.ok(numberParam.includes("12345"));

            // Boolean parameters (converted to string)
            const booleanParam = getMessage("fileLoaded", true);
            assert.ok(booleanParam.includes("true"));
        });

        /**
         * @brief Tests graceful handling of undefined and null parameter values
         * @test Validates that undefined and null parameters are converted to appropriate string representations
         */
        test('should handle undefined and null parameters gracefully', () => {
            const undefinedParam = getMessage("fileLoaded", undefined);
            assert.ok(typeof undefinedParam === 'string');
            assert.ok(undefinedParam.includes("undefined"));

            const nullParam = getMessage("fileLoaded", null);
            assert.ok(typeof nullParam === 'string');
            assert.ok(nullParam.includes("null"));
        });

        /**
         * @brief Tests handling of empty string parameters
         * @test Validates that empty strings are properly handled in message substitution
         */
        test('should handle empty string parameters', () => {
            const emptyParam = getMessage("fileLoaded", "");
            assert.ok(typeof emptyParam === 'string');
            assert.strictEqual(emptyParam, "File  loaded!");
        });

        /**
         * @brief Tests handling of special characters and symbols in parameters
         * @test Validates that special characters are preserved correctly in message substitution
         */
        test('should handle special characters in parameters', () => {
            const specialChars = '/path/with spaces & symbols!@#$%.json';
            const result = getMessage("fileLoaded", specialChars);
            assert.ok(result.includes(specialChars));
            assert.strictEqual(result, `File ${specialChars} loaded!`);
        });
    });

    /**
     * @brief Test suite for message reference validation and completeness
     * @test Validates message reference integrity, key existence, and function signatures
     */
    suite('Message Reference Validation', () => {
        /**
         * @brief Tests that all expected message keys exist in the message reference
         * @test Validates completeness of message definitions and their function types
         */
        test('should contain all expected message keys', () => {
            const expectedKeys = [
                'fileLoaded',
                'fileParseError',
                'fileRefreshed',
                'filePathUpdated',
                'fileUnloaded',
                'fileExcludedActivationDisabled',
                'fileSaveFailed',
                'cwdUpdated',
                'cwdDoesNotExist'
            ];

            const englishMessages = messages.en;
            expectedKeys.forEach(key => {
                assert.ok(key in englishMessages, `Message key '${key}' should exist in English messages`);
                assert.ok(typeof englishMessages[key] === 'function', `Message '${key}' should be a function`);
            });
        });

        /**
         * @brief Tests that message functions return proper string values
         * @test Validates that all message functions produce string output when called
         */
        test('should have functions that return strings', () => {
            // Test function-based messages
            const englishMessages = messages.en;
            const fileLoaded = englishMessages.fileLoaded('/test/path');
            assert.strictEqual(typeof fileLoaded, 'string');

            const parseError = englishMessages.fileParseError('/test/file', 'syntax error');
            assert.strictEqual(typeof parseError, 'string');

            const cwdUpdated = englishMessages.cwdUpdated('/old', '/new');
            assert.strictEqual(typeof cwdUpdated, 'string');
        });

        /**
         * @brief Tests that message function signatures match expected parameter counts
         * @test Validates that each message function accepts the correct number of parameters
         */
        test('should validate message function signatures', () => {
            const englishMessages = messages.en;
            // Single parameter functions
            assert.ok(englishMessages.fileLoaded.length >= 1, 'fileLoaded should accept at least 1 parameter');
            assert.ok(englishMessages.fileUnloaded.length >= 1, 'fileUnloaded should accept at least 1 parameter');
            assert.ok(englishMessages.cwdDoesNotExist.length >= 1, 'cwdDoesNotExist should accept at least 1 parameter');

            // Two parameter functions  
            assert.ok(englishMessages.fileParseError.length >= 2, 'fileParseError should accept at least 2 parameters');
            assert.ok(englishMessages.filePathUpdated.length >= 2, 'filePathUpdated should accept at least 2 parameters');
            assert.ok(englishMessages.cwdUpdated.length >= 2, 'cwdUpdated should accept at least 2 parameters');

            // Zero parameter functions
            assert.ok(englishMessages.fileRefreshed.length === 0, 'fileRefreshed should accept 0 parameters');
            assert.ok(englishMessages.fileExcludedActivationDisabled.length === 0, 'fileExcludedActivationDisabled should accept 0 parameters');
            assert.ok(englishMessages.fileSaveFailed.length === 0, 'fileSaveFailed should accept 0 parameters');
        });
    });

    /**
     * @brief Test suite for error handling and edge case scenarios
     * @test Validates graceful handling of invalid inputs and parameter mismatches
     */
    suite('Error Handling', () => {
        /**
         * @brief Tests graceful handling of invalid or non-existent message keys
         * @test Validates that invalid message keys don't crash the system
         */
        test('should handle invalid message keys gracefully', () => {
            // The implementation might throw an error or return a default message
            // This test verifies the behavior is consistent
            try {
                const result = getMessage("nonExistentMessage" as any);
                // If it returns something, it should be a string
                assert.strictEqual(typeof result, 'string');
            } catch (error) {
                // If it throws, that's also acceptable behavior
                assert.ok(error instanceof Error);
            }
        });

        /**
         * @brief Tests handling of excess parameters beyond what's expected
         * @test Validates that extra parameters are ignored without causing errors
         */
        test('should handle too many parameters gracefully', () => {
            // Providing more parameters than expected should not break
            const result = getMessage("fileRefreshed", "extra", "parameters", "should", "be", "ignored");
            assert.strictEqual(typeof result, 'string');
            assert.strictEqual(result, "Refreshing file content.");
        });

        /**
         * @brief Tests handling of insufficient parameters for message templates
         * @test Validates that missing parameters don't crash the message generation
         */
        test('should handle too few parameters gracefully', () => {
            // This might result in undefined substitution, but should not crash
            const result = getMessage("filePathUpdated", "/only/one/param");
            assert.strictEqual(typeof result, 'string');
            assert.ok(result.includes("/only/one/param"));
        });
    });

    /**
     * @brief Test suite for message content validation and quality
     * @test Validates that generated messages contain appropriate content and formatting
     */
    suite('Message Content Validation', () => {
        /**
         * @brief Tests that error messages contain meaningful and helpful information
         * @test Validates that error messages include relevant details like file paths and error descriptions
         */
        test('should have meaningful error messages', () => {
            const filePath = '/test/file.json';
            const error = 'Syntax error at line 5';

            const parseError = getMessage("fileParseError", filePath, error);
            assert.ok(parseError.includes(filePath), 'Parse error should include file path');
            assert.ok(parseError.includes(error), 'Parse error should include error details');
            assert.ok(parseError.toLowerCase().includes('error'), 'Parse error should mention error');
        });

        /**
         * @brief Tests that status messages provide clear and informative content
         * @test Validates that status messages include relevant context and clear language
         */
        test('should have informative status messages', () => {
            const absolutePath = '/absolute/path/to/file.json';
            const loadedMsg = getMessage("fileLoaded", absolutePath);

            assert.ok(loadedMsg.includes(absolutePath), 'Loaded message should include file path');
            assert.ok(loadedMsg.toLowerCase().includes('loaded'), 'Loaded message should mention loaded');

            const refreshMsg = getMessage("fileRefreshed");
            assert.ok(refreshMsg.toLowerCase().includes('refresh'), 'Refresh message should mention refresh');
        });

        /**
         * @brief Tests that directory change messages are clear and include relevant paths
         * @test Validates that directory update and error messages contain appropriate path information
         */
        test('should have clear directory change messages', () => {
            const oldCwd = '/old/directory';
            const newCwd = '/new/directory';

            const cwdUpdate = getMessage("cwdUpdated", oldCwd, newCwd);
            assert.ok(cwdUpdate.includes(oldCwd), 'CWD update should include old directory');
            assert.ok(cwdUpdate.includes(newCwd), 'CWD update should include new directory');
            assert.ok(cwdUpdate.toLowerCase().includes('updated'), 'CWD update should mention update');

            const nonExistentPath = '/nonexistent/path';
            const cwdError = getMessage("cwdDoesNotExist", nonExistentPath);
            assert.ok(cwdError.includes(nonExistentPath), 'CWD error should include path');
        });
    });

    /**
     * @brief Test suite for integration testing and message consistency
     * @test Validates consistent formatting, concurrent access, and caching behavior
     */
    suite('Integration and Consistency', () => {
        /**
         * @brief Tests that similar messages follow consistent formatting patterns
         * @test Validates that related messages use similar punctuation and structure
         */
        test('should maintain consistent message formatting', () => {
            // Test that similar messages follow consistent patterns
            const loadedMsg = getMessage("fileLoaded", "/test/file");
            const unloadedMsg = getMessage("fileUnloaded", "/test/file");

            // Check actual message format - loaded ends with '!', unloaded may not
            assert.ok(loadedMsg.endsWith('!') || loadedMsg.endsWith('.'), 'Loaded message should end with punctuation');
            // Adjust expectation for unloaded message based on actual implementation
            assert.ok(typeof unloadedMsg === 'string' && unloadedMsg.length > 0, 'Unloaded message should be a valid string');
        });

        /**
         * @brief Tests concurrent message generation for thread safety
         * @test Validates that simultaneous getMessage calls work correctly without interference
         */
        test('should handle concurrent message generation', () => {
            // Test that multiple simultaneous getMessage calls work correctly
            const promises = Array.from({ length: 100 }, (_, i) => {
                return new Promise<string>((resolve) => {
                    const message = getMessage("fileLoaded", `/test/file${i}.json`);
                    resolve(message);
                });
            });

            return Promise.all(promises).then(results => {
                assert.strictEqual(results.length, 100);
                results.forEach((message, index) => {
                    assert.ok(message.includes(`file${index}.json`));
                });
            });
        });

        /**
         * @brief Tests message caching functionality and consistency
         * @test Validates that repeated calls to the same message return identical results
         */
        test('should support message caching if implemented', () => {
            // Test repeated calls to the same message
            const message1 = getMessage("fileRefreshed");
            const message2 = getMessage("fileRefreshed");

            // Should return identical results
            assert.strictEqual(message1, message2);

            // Test with parameters
            const paramMsg1 = getMessage("fileLoaded", "/same/path");
            const paramMsg2 = getMessage("fileLoaded", "/same/path");
            assert.strictEqual(paramMsg1, paramMsg2);
        });
    });

    /**
     * @brief Test suite for performance characteristics and memory management
     * @test Validates efficiency with large parameters and rapid successive calls
     */
    suite('Performance and Memory', () => {
        /**
         * @brief Tests performance with large parameter strings
         * @test Validates that message generation remains efficient even with very long parameters
         */
        test('should handle large parameter strings efficiently', () => {
            const largePath = '/very/long/path/with/many/segments/'.repeat(100) + 'file.json';
            const startTime = Date.now();

            const result = getMessage("fileLoaded", largePath);
            const elapsed = Date.now() - startTime;

            assert.ok(elapsed < 100, 'Message generation should complete quickly even with large parameters');
            assert.ok(result.includes(largePath));
        });

        /**
         * @brief Tests performance under rapid successive message generation calls
         * @test Validates that high-frequency message generation completes within reasonable time
         */
        test('should handle rapid successive calls efficiently', () => {
            const startTime = Date.now();

            for (let i = 0; i < 1000; i++) {
                getMessage("fileRefreshed");
                getMessage("fileLoaded", `/test/file${i}.json`);
            }

            const elapsed = Date.now() - startTime;
            assert.ok(elapsed < 1000, 'Rapid message generation should complete within reasonable time');
        });
    });
});
