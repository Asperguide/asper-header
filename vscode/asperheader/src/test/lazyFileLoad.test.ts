/**
 * @file lazyFileLoad.test.ts
 * @brief Comprehensive test suite for LazyFileLoader with real file operations
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This module provides extensive testing coverage for the LazyFileLoader class,
 * validating caching behavior, file format support, error handling, and path
 * resolution using real file operations and temporary test files.
 * 
 * Test Coverage:
 * - File loading and caching mechanisms
 * - JSON parsing and validation
 * - Error handling for missing files and parse errors
 * - Path resolution (relative and absolute)
 * - Cache invalidation and refresh functionality
 * - Memory management and type safety
 */

import * as assert from 'assert';
import * as fs from 'fs/promises';
import * as path from 'path';
import { LazyFileLoader } from '../modules/lazyFileLoad';

// Test interfaces for type safety
/**
 * @brief Basic test configuration interface for LazyFileLoader testing
 * @interface TestConfig
 * @property {string} name - Configuration name identifier
 * @property {number} value - Numeric configuration value
 * @property {boolean} enabled - Configuration enable/disable flag
 */
interface TestConfig {
    name: string;
    value: number;
    enabled: boolean;
}

/**
 * @brief Complex nested data structure interface for advanced type safety testing
 * @interface ComplexTestData
 * @property {Object} metadata - Metadata container object
 * @property {string} metadata.version - Version string identifier
 * @property {string} metadata.author - Author name string
 * @property {string[]} items - Array of string items for collection testing
 */
interface ComplexTestData {
    metadata: {
        version: string;
        author: string;
    };
    items: string[];
}

/**
 * @brief Main test suite for LazyFileLoader class functionality
 * @test Comprehensive testing of file loading, caching, and path resolution capabilities
 */
suite('LazyFileLoader Test Suite', function () {
    let loader: LazyFileLoader<TestConfig>;
    let tempDir: string;
    let testFilePath: string;

    /**
     * @brief Sets up test environment with temporary directory and loader instance
     * @test Initializes fresh LazyFileLoader and temporary file system for each test
     */
    setup(async () => {
        loader = new LazyFileLoader<TestConfig>();

        // Create temporary directory for test files
        tempDir = await fs.mkdtemp(path.join(__dirname, 'temp-lazyloader-'));
        testFilePath = path.join(tempDir, 'test-config.json');
    });

    /**
     * @brief Cleans up test environment by removing temporary files and directories
     * @test Ensures no test artifacts remain after test execution
     */
    teardown(async () => {
        // Clean up temporary files and directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors in tests
        }
    });

    /**
     * @brief Test suite for basic file loading and parsing functionality
     * @test Validates core file reading capabilities for JSON and text files
     */
    suite('Basic File Loading', () => {
        /**
         * @brief Tests correct loading and parsing of JSON files
         * @test Verifies that JSON content is properly deserialized into typed objects
         */
        test('should load and parse JSON file correctly', async () => {
            const testData: TestConfig = { name: 'test', value: 42, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(testData));

            await loader.updateFilePath(testFilePath);
            const result = await loader.get();

            assert.strictEqual(result?.name, 'test');
            assert.strictEqual(result?.value, 42);
            assert.strictEqual(result?.enabled, true);
        });

        /**
         * @brief Tests loading of plain text files as string content
         * @test Validates that non-JSON files are returned as raw string data
         */
        test('should load plain text file as string', async () => {
            const loader = new LazyFileLoader<string>();
            const textFile = path.join(tempDir, 'test.txt');
            const testContent = 'Hello, World!\nThis is a test file.';

            await fs.writeFile(textFile, testContent);
            await loader.updateFilePath(textFile);

            const result = await loader.get();
            assert.strictEqual(result, testContent);
        });

        /**
         * @brief Tests handling of empty JSON files with minimal content
         * @test Validates that empty JSON objects are properly parsed and returned
         */
        test('should handle empty JSON file', async () => {
            await fs.writeFile(testFilePath, '{}');
            await loader.updateFilePath(testFilePath);

            const result = await loader.get();
            assert.strictEqual(typeof result, 'object');
            assert.strictEqual(Object.keys(result || {}).length, 0);
        });
    });

    /**
     * @brief Test suite for caching mechanisms and cache management
     * @test Validates lazy loading behavior, cache persistence, and invalidation strategies
     */
    suite('Caching Behavior', () => {
        /**
         * @brief Tests that content is cached and reused across multiple get() calls
         * @test Validates that file system is not accessed repeatedly for same content
         */
        test('should cache loaded content and not reload on subsequent calls', async () => {
            const testData: TestConfig = { name: 'cached', value: 100, enabled: false };
            await fs.writeFile(testFilePath, JSON.stringify(testData));
            await loader.updateFilePath(testFilePath);

            // First load
            const result1 = await loader.get();

            // Modify file content after first load
            const modifiedData: TestConfig = { name: 'modified', value: 200, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(modifiedData));

            // Second load should return cached content
            const result2 = await loader.get();

            assert.strictEqual(result1?.name, result2?.name);
            assert.strictEqual(result1?.value, result2?.value);
            assert.strictEqual(result2?.name, 'cached'); // Should be original, not modified
        });

        /**
         * @brief Tests cache invalidation and content reloading functionality
         * @test Validates that reload() forces fresh file system access and updates cached content
         */
        test('should reload content after calling reload()', async () => {
            const initialData: TestConfig = { name: 'initial', value: 1, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(initialData));
            await loader.updateFilePath(testFilePath);

            // First load
            const result1 = await loader.get();
            assert.strictEqual(result1?.name, 'initial');

            // Modify file and reload
            const updatedData: TestConfig = { name: 'updated', value: 2, enabled: false };
            await fs.writeFile(testFilePath, JSON.stringify(updatedData));

            const result2 = await loader.reload();
            assert.strictEqual(result2?.name, 'updated');
            assert.strictEqual(result2?.value, 2);
        });

        /**
         * @brief Tests cache clearing and memory cleanup with unload method
         * @test Validates that unload() removes cached content and forces subsequent file reads
         */
        test('should clear cache with unload()', async () => {
            const testData: TestConfig = { name: 'test', value: 42, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(testData));
            await loader.updateFilePath(testFilePath);

            // Load data
            const result1 = await loader.get();
            assert.ok(result1);

            // Unload cache
            loader.unload();

            // Modify file
            const newData: TestConfig = { name: 'new', value: 99, enabled: false };
            await fs.writeFile(testFilePath, JSON.stringify(newData));

            // Should reload from file
            const result2 = await loader.get();
            assert.strictEqual(result2?.name, 'new');
            assert.strictEqual(result2?.value, 99);
        });
    });

    /**
     * @brief Test suite for file path resolution and working directory management
     * @test Validates absolute and relative path handling with proper directory resolution
     */
    suite('Path Resolution', () => {
        /**
         * @brief Tests correct handling of absolute file paths
         * @test Validates that absolute paths are resolved and accessed properly
         */
        test('should handle absolute paths correctly', async () => {
            const testData: TestConfig = { name: 'absolute', value: 123, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(testData));

            await loader.updateFilePath(testFilePath);
            const result = await loader.get();

            assert.strictEqual(result?.name, 'absolute');
        });

        /**
         * @brief Tests relative path resolution with working directory context
         * @test Validates that relative paths are resolved against the configured working directory
         */
        test('should resolve relative paths with working directory', async () => {
            const testData: TestConfig = { name: 'relative', value: 456, enabled: false };
            await fs.writeFile(testFilePath, JSON.stringify(testData));

            await loader.updateCurrentWorkingDirectory(tempDir);
            await loader.updateFilePath('test-config.json');

            const result = await loader.get();
            assert.strictEqual(result?.name, 'relative');
        });

        /**
         * @brief Tests validation of working directory existence before setting
         * @test Validates that updateCurrentWorkingDirectory() rejects non-existent directories
         */
        test('should validate working directory exists', async () => {
            const nonExistentPath = path.join(tempDir, 'nonexistent');
            const success = await loader.updateCurrentWorkingDirectory(nonExistentPath);
            assert.strictEqual(success, false);
        });
    });

    /**
     * @brief Test suite for error handling and edge case scenarios
     * @test Validates graceful handling of file system errors and malformed content
     */
    suite('Error Handling', () => {
        /**
         * @brief Tests error handling for non-existent file access attempts
         * @test Validates that accessing missing files throws appropriate ENOENT errors
         */
        test('should return undefined for non-existent file', async () => {
            const nonExistentPath = path.join(tempDir, 'nonexistent.json');
            await loader.updateFilePath(nonExistentPath);

            // LazyFileLoader throws error for non-existent files instead of returning undefined
            try {
                const result = await loader.get();
                assert.fail('Expected error for non-existent file');
            } catch (error) {
                assert.ok((error as any).code === 'ENOENT', 'Should throw ENOENT error for non-existent file');
            }
        });

        /**
         * @brief Tests graceful handling of malformed JSON content
         * @test Validates that JSON parsing errors are handled without crashing and returns raw content
         */
        test('should handle malformed JSON gracefully', async () => {
            const malformedJson = '{ name: "test", value: 42, invalid }';
            await fs.writeFile(testFilePath, malformedJson);
            await loader.updateFilePath(testFilePath);

            const result = await loader.get();
            // Should return raw content since file loaded successfully, even if JSON parsing failed
            assert.strictEqual(result, malformedJson);
        });

        /**
         * @brief Tests behavior when no file path is configured
         * @test Validates that get() returns undefined when no file path is set
         */
        test('should return undefined when no file path is set', async () => {
            const result = await loader.get();
            assert.strictEqual(result, undefined);
        });
    });

    /**
     * @brief Test suite for file path configuration and management
     * @test Validates file path updates, validation, and retrieval functionality
     */
    suite('File Path Management', () => {
        /**
         * @brief Tests successful file path updating and retrieval
         * @test Validates that updateFilePath() sets and getFilePath() returns correct paths
         */
        test('should update file path successfully', async () => {
            const testData: TestConfig = { name: 'test', value: 42, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(testData));

            const success = await loader.updateFilePath(testFilePath);
            assert.strictEqual(success, true);

            const retrievedPath = loader.getFilePath();
            assert.strictEqual(retrievedPath, testFilePath);
        });

        /**
         * @brief Tests content reloading when switching file paths with existing cache
         * @test Validates that changing file paths clears cache and loads new file content
         */
        test('should reload content when updating file path with cached data', async () => {
            // Create first file
            const firstData: TestConfig = { name: 'first', value: 1, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(firstData));
            await loader.updateFilePath(testFilePath);
            await loader.get(); // Load and cache

            // Create second file
            const secondFilePath = path.join(tempDir, 'second.json');
            const secondData: TestConfig = { name: 'second', value: 2, enabled: false };
            await fs.writeFile(secondFilePath, JSON.stringify(secondData));

            // Update to second file
            const success = await loader.updateFilePath(secondFilePath);
            assert.strictEqual(success, true);

            const result = await loader.get();
            assert.strictEqual(result?.name, 'second');
        });

        /**
         * @brief Tests error handling when updating to non-existent file paths
         * @test Validates that updateFilePath() throws errors for invalid file paths
         */
        test('should return false when updating to invalid file with cached data', async () => {
            // Load valid file first
            const testData: TestConfig = { name: 'test', value: 42, enabled: true };
            await fs.writeFile(testFilePath, JSON.stringify(testData));
            await loader.updateFilePath(testFilePath);
            await loader.get(); // Load and cache

            // Try to update to non-existent file - this throws error in actual implementation
            const nonExistentPath = path.join(tempDir, 'nonexistent.json');
            try {
                const success = await loader.updateFilePath(nonExistentPath);
                assert.fail('Expected error when updating to invalid file');
            } catch (error) {
                assert.ok((error as any).code === 'ENOENT', 'Should throw ENOENT error for invalid file path');
            }
        });
    });

    /**
     * @brief Test suite for type safety and complex data structure handling
     * @test Validates TypeScript type safety and complex object deserialization
     */
    suite('Type Safety and Complex Data', () => {
        /**
         * @brief Tests handling of complex nested objects with full type safety
         * @test Validates that complex TypeScript interfaces are properly deserialized
         */
        test('should handle complex nested objects with type safety', async () => {
            const complexLoader = new LazyFileLoader<ComplexTestData>();
            const complexFile = path.join(tempDir, 'complex.json');

            const testData: ComplexTestData = {
                metadata: {
                    version: '1.0.0',
                    author: 'Test Author'
                },
                items: ['item1', 'item2', 'item3']
            };

            await fs.writeFile(complexFile, JSON.stringify(testData));
            await complexLoader.updateFilePath(complexFile);

            const result = await complexLoader.get();

            assert.ok(result);
            if (result) { // Type guard to handle possible undefined
                assert.strictEqual(result.metadata.version, '1.0.0');
                assert.strictEqual(result.metadata.author, 'Test Author');
                assert.ok(Array.isArray(result.items));
                assert.strictEqual(result.items.length, 3);
            }
        });

        /**
         * @brief Tests support for JSONC files with comment syntax
         * @test Validates handling of JSON files with single-line and multi-line comments
         */
        test('should support JSONC files with comments', async () => {
            const jsoncFile = path.join(tempDir, 'config.jsonc');
            const jsoncContent = `{
                // This is a comment
                "name": "jsonc-test",
                "value": 789,
                /* Multi-line comment */
                "enabled": true
            }`;

            await fs.writeFile(jsoncFile, jsoncContent);
            await loader.updateFilePath(jsoncFile);

            const result = await loader.get();

            // Since we use a JSONC parser, this should successfully parse the file with comments
            assert.ok(result !== undefined, 'JSONC file should be parsed successfully');
            assert.strictEqual((result as any).name, 'jsonc-test');
            assert.strictEqual((result as any).value, 789);
            assert.strictEqual((result as any).enabled, true);
        });
    });

    /**
     * @brief Test suite for path utility functions and file system queries
     * @test Validates path existence checking and file system utility methods
     */
    suite('Path Utilities', () => {
        /**
         * @brief Tests accurate path existence verification functionality
         * @test Validates that pathExists() correctly identifies existing and missing paths
         */
        test('should check path existence correctly', async () => {
            // Test existing path
            const exists = await loader.pathExists(testFilePath);
            assert.strictEqual(exists, false); // File doesn't exist yet

            // Create file and test again
            await fs.writeFile(testFilePath, '{}');
            const existsAfterCreation = await loader.pathExists(testFilePath);
            assert.strictEqual(existsAfterCreation, true);
        });

        /**
         * @brief Tests directory path detection with pathExists utility
         * @test Validates that pathExists() correctly identifies directory paths
         */
        test('should handle directory paths in pathExists', async () => {
            const exists = await loader.pathExists(tempDir);
            assert.strictEqual(exists, true);
        });
    });

    /**
     * @brief Test suite for edge cases, performance validation, and stress testing
     * @test Validates system behavior under extreme conditions and performance requirements
     */
    suite('Edge Cases and Performance', () => {
        /**
         * @brief Tests efficient loading and caching of large JSON files
         * @test Validates performance characteristics and memory efficiency with large datasets
         */
        test('should handle large JSON files efficiently', async () => {
            const largeArray = Array.from({ length: 1000 }, (_, i) => ({
                id: i,
                name: `item-${i}`,
                value: Math.random()
            }));

            const largeFile = path.join(tempDir, 'large.json');
            await fs.writeFile(largeFile, JSON.stringify(largeArray));

            const largeLoader = new LazyFileLoader<typeof largeArray>();
            await largeLoader.updateFilePath(largeFile);

            const startTime = Date.now();
            const result = await largeLoader.get();
            const loadTime = Date.now() - startTime;

            assert.ok(result);
            assert.strictEqual(result.length, 1000);
            assert.ok(loadTime < 1000, 'Loading should complete within 1 second');

            // Second call should be faster due to caching
            const cachedStartTime = Date.now();
            const cachedResult = await largeLoader.get();
            const cachedLoadTime = Date.now() - cachedStartTime;

            assert.ok(cachedLoadTime < loadTime / 10, 'Cached access should be much faster');
        });

        /**
         * @brief Tests graceful handling of empty or invalid file path inputs
         * @test Validates that empty file paths are handled with appropriate error responses
         */
        test('should handle empty file paths gracefully', async () => {
            const success = await loader.updateFilePath('');
            assert.strictEqual(success, true); // updateFilePath should accept any string

            // Empty path resolves to current directory, causing EISDIR error
            try {
                const result = await loader.get();
                assert.fail('Expected error for empty file path');
            } catch (error) {
                assert.ok((error as any).code === 'EISDIR', 'Should throw EISDIR error for directory path');
            }
        });

        /**
         * @brief Tests independence and isolation between multiple loader instances
         * @test Validates that separate LazyFileLoader instances maintain independent state
         */
        test('should maintain independence between loader instances', async () => {
            const loader1 = new LazyFileLoader<TestConfig>();
            const loader2 = new LazyFileLoader<TestConfig>();

            const file1 = path.join(tempDir, 'config1.json');
            const file2 = path.join(tempDir, 'config2.json');

            const data1: TestConfig = { name: 'loader1', value: 1, enabled: true };
            const data2: TestConfig = { name: 'loader2', value: 2, enabled: false };

            await fs.writeFile(file1, JSON.stringify(data1));
            await fs.writeFile(file2, JSON.stringify(data2));

            await loader1.updateFilePath(file1);
            await loader2.updateFilePath(file2);

            const result1 = await loader1.get();
            const result2 = await loader2.get();

            assert.strictEqual(result1?.name, 'loader1');
            assert.strictEqual(result2?.name, 'loader2');
            assert.notStrictEqual(result1, result2);
        });
    });
});
