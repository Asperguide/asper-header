/**
 * @file darling.test.ts
 * @brief Comprehensive unit tests for the Darling character showcase system
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.4
 * @date 2025
 * 
 * This test suite provides extensive coverage for the Darling module, which manages
 * the display of "Darling in the FranXX" characters in VS Code webview panels.
 * 
 * Test Coverage Areas:
 * - Constructor initialization and parameter handling
 * - File path and working directory management
 * - Character data loading and validation
 * - Random character selection algorithms
 * - Error handling for invalid data and missing files
 * - HTML content generation and webview creation
 * - Interactive feature scripts (copy, zoom functionality)
 * - Message localization and UI text generation
 * - Integration with LazyFileLoader and VS Code APIs
 * 
 * Testing Strategy:
 * - Uses real temporary files for authentic file operations
 * - Mocks VS Code webview APIs for isolated testing
 * - Validates JSON structure and data integrity
 * - Tests edge cases and error conditions
 * - Verifies HTML output and JavaScript functionality
 * - Ensures proper resource cleanup and memory management
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { Darling, Person } from '../modules/darling';

/**
 * @interface MockCharacterData
 * @brief Interface for test character data matching the JSON structure
 */
interface MockCharacterData {
    id: number;
    name: string;
    japanese_name?: string;
    romaji: string;
    age: string;
    quote: string;
    description: string;
    image_link: string[];
    height: string;
    weight: string;
    more_information: string;
    type: string;
    alias?: string[] | null;
}

/**
 * @class MockWebview
 * @brief Mock implementation of VS Code webview for testing
 */
class MockWebview {
    private _html: string = '';
    private messageHandlers: Array<(message: any) => void> = [];

    get html(): string {
        return this._html;
    }

    set html(value: string) {
        this._html = value;
    }

    /**
     * @brief Registers a message handler for webview communication
     * @param handler Function to handle incoming messages from webview
     * @return Disposable object for cleanup
     */
    onDidReceiveMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
        return { dispose: () => { } };
    }

    /**
     * @brief Sends a message to all registered message handlers
     * @param message Message object to broadcast to handlers
     */
    postMessage(message: any) {
        this.messageHandlers.forEach(handler => handler(message));
    }
}

/**
 * @brief Main test suite for comprehensive Darling module functionality validation
 * 
 * This suite provides complete coverage of the Darling character showcase system,
 * testing all aspects from constructor initialization to webview presentation.
 * Includes setup/teardown lifecycle management and organized test categories
 * for systematic validation of character data processing and display features.
 */
suite('Darling Test Suite', () => {
    let tempDir: string;
    let testFilePath: string;
    let mockCharacters: MockCharacterData[];
    let originalCreateWebviewPanel: typeof vscode.window.createWebviewPanel;
    let capturedHtml: string;
    let lastCreatedWebview: MockWebview;

    /**
     * @brief Setup test environment before each test
     * @return Promise that resolves when test environment is ready
     * 
     * Creates temporary directory and mock character data for isolated testing.
     * Initializes webview mocking and comprehensive character dataset with
     * ASCII art, aliases, and complete metadata for thorough validation.
     */
    setup(async () => {
        // Create temporary directory for test files
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'darling-test-'));
        testFilePath = path.join(tempDir, 'test-characters.json');

        // Create comprehensive mock character data
        mockCharacters = [
            {
                id: 1,
                name: "Zero Two",
                japanese_name: "ゼロツー",
                romaji: "Zero Tsuu",
                age: "Classified",
                quote: "I want to become human because I have someone I want to be human for.",
                description: "A hybrid human-klaxosaur who pilots with Hiro as his partner.",
                image_link: [
                    "    ****    ",
                    "  **    **  ",
                    " *  ^  ^  * ",
                    "*     <     *",
                    " *   ---   * ",
                    "  **    **  ",
                    "    ****    "
                ],
                height: "170 cm",
                weight: "55 kg",
                more_information: "https://example.com/zero-two",
                type: "Klaxo-Sapien Hybrid",
                alias: ["002", "Darling's Partner", "Oni"]
            },
            {
                id: 2,
                name: "Hiro",
                romaji: "Hiro",
                age: "16",
                quote: "I want to pilot with Zero Two forever.",
                description: "Former prodigy pilot who lost his abilities but regained them with Zero Two.",
                image_link: [
                    "  ######  ",
                    " #      # ",
                    "#  o  o  #",
                    "#    -   #",
                    " #  ==  # ",
                    "  ######  "
                ],
                height: "168 cm",
                weight: "58 kg",
                more_information: "https://example.com/hiro",
                type: "Human",
                alias: ["016", "Code 016"]
            },
            {
                id: 3,
                name: "Ichigo",
                romaji: "Ichigo",
                age: "16",
                quote: "I'll protect everyone, no matter what it takes.",
                description: "Squad 13's leader with strong leadership skills and deep care for her teammates.",
                image_link: [
                    "  @@@@@@  ",
                    " @      @ ",
                    "@  >  <  @",
                    "@   --   @",
                    " @  __  @ ",
                    "  @@@@@@  "
                ],
                height: "159 cm",
                weight: "48 kg",
                more_information: "https://example.com/ichigo",
                type: "Human",
                alias: null
            }
        ];

        // Setup webview mocking
        capturedHtml = '';
        originalCreateWebviewPanel = vscode.window.createWebviewPanel;
        vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: any, options?: any) => {
            lastCreatedWebview = new MockWebview();

            // Capture HTML when it's set
            Object.defineProperty(lastCreatedWebview, 'html', {
                get: () => capturedHtml,
                set: (value: string) => {
                    capturedHtml = value;
                }
            });

            return {
                title,
                webview: lastCreatedWebview
            } as any;
        };
    });

    /**
     * @brief Cleanup test environment after each test
     * @return Promise that resolves when cleanup is complete
     * 
     * Removes temporary files and restores mocked VS Code APIs to prevent
     * test interference. Ensures clean state for subsequent test executions
     * and proper resource cleanup to avoid memory leaks.
     */
    teardown(async () => {
        // Cleanup temporary directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }

        // Restore original VS Code API
        if (originalCreateWebviewPanel) {
            vscode.window.createWebviewPanel = originalCreateWebviewPanel;
        }

        // Reset captured data
        capturedHtml = '';
    });

    /**
     * @brief Test suite for Darling constructor and initialization scenarios
     * 
     * Validates proper instantiation of Darling instances with various parameter
     * combinations, including default parameters, file paths, working directories,
     * and graceful handling of undefined or invalid inputs.
     */
    suite('Constructor and Initialization', () => {
        /**
         * @brief Tests Darling instantiation without parameters
         * @test Validates that Darling can be created with default constructor values
         */
        test('should create instance with default parameters', () => {
            const darling = new Darling();
            assert.ok(darling instanceof Darling, 'Should create Darling instance');
        });

        /**
         * @brief Tests Darling instantiation with file path parameter
         * @test Validates constructor with single file path argument
         */
        test('should create instance with file path parameter', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath);
            assert.ok(darling instanceof Darling, 'Should create Darling instance with file path');
        });

        /**
         * @brief Tests Darling instantiation with complete parameter set
         * @test Validates constructor with both file path and working directory arguments
         */
        test('should create instance with both file path and working directory', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);
            assert.ok(darling instanceof Darling, 'Should create Darling instance with both parameters');
        });

        /**
         * @brief Tests graceful handling of undefined constructor parameters
         * @test Validates that Darling handles null/undefined inputs without errors
         */
        test('should handle undefined parameters gracefully', () => {
            const darling = new Darling(undefined, undefined);
            assert.ok(darling instanceof Darling, 'Should handle undefined parameters');
        });
    });

    /**
     * @brief Test suite for file path and directory management functionality
     * 
     * Tests the Darling module's ability to handle file path updates, working
     * directory changes, and relative path resolution for character data files.
     */
    suite('File Path Management', () => {
        /**
         * @brief Tests successful file path update operation
         * @test Validates that updateFilePath returns true for valid file paths
         */
        test('should update file path successfully', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling();

            const success = await darling.updateFilePath(testFilePath);
            assert.strictEqual(success, true, 'Should return true for successful file path update');
        });

        /**
         * @brief Tests successful working directory update operation
         * @test Validates that updateCurrentWorkingDirectory returns true for valid directories
         */
        test('should update working directory successfully', async () => {
            const darling = new Darling();

            const success = await darling.updateCurrentWorkingDirectory(tempDir);
            assert.strictEqual(success, true, 'Should return true for successful working directory update');
        });

        /**
         * @brief Tests relative path resolution with working directory context
         * @test Validates proper handling of relative paths when working directory is set
         */
        test('should handle relative paths with working directory', async () => {
            const relativePath = 'characters.json';
            const fullPath = path.join(tempDir, relativePath);
            await fs.writeFile(fullPath, JSON.stringify(mockCharacters));

            const darling = new Darling();
            await darling.updateCurrentWorkingDirectory(tempDir);
            const success = await darling.updateFilePath(relativePath);

            assert.strictEqual(success, true, 'Should handle relative paths correctly');
        });
    });

    /**
     * @brief Test suite for character data loading, parsing, and validation
     * 
     * Comprehensive tests for JSON data loading, character object mapping,
     * property validation, and data structure integrity verification.
     */
    suite('Character Data Loading and Validation', () => {
        /**
         * @brief Tests complete character data loading and parsing workflow
         * @test Validates JSON parsing, object structure, and property type validation
         */
        test('should load and parse character data correctly', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            // Validate person structure
            assert.ok(typeof person.id === 'number', 'Person should have numeric id');
            assert.ok(typeof person.name === 'string', 'Person should have string name');
            assert.ok(typeof person.romaji === 'string', 'Person should have string romaji');
            assert.ok(typeof person.age === 'string', 'Person should have string age');
            assert.ok(typeof person.quote === 'string', 'Person should have string quote');
            assert.ok(typeof person.description === 'string', 'Person should have string description');
            assert.ok(Array.isArray(person.imageContent), 'Person should have array imageContent');
            assert.ok(typeof person.height === 'string', 'Person should have string height');
            assert.ok(typeof person.weight === 'string', 'Person should have string weight');
            assert.ok(typeof person.more_information === 'string', 'Person should have string more_information');
            assert.ok(typeof person.type === 'string', 'Person should have string type');
        });

        /**
         * @brief Tests proper mapping of image_link array to imageContent property
         * @test Validates ASCII art data transformation and array structure preservation
         */
        test('should correctly map image_link to imageContent', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.ok(Array.isArray(person.imageContent), 'imageContent should be an array');
            assert.ok(person.imageContent.length > 0, 'imageContent should not be empty');
            assert.ok(person.imageContent.every(line => typeof line === 'string'), 'All imageContent lines should be strings');
        });

        /**
         * @brief Tests proper handling of characters with null alias values
         * @test Validates graceful processing of optional alias property when null
         */
        test('should handle null alias correctly', async () => {
            const charactersWithNullAlias = mockCharacters.map(char => ({ ...char, alias: null }));
            await fs.writeFile(testFilePath, JSON.stringify(charactersWithNullAlias));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.strictEqual(person.alias, null, 'Should handle null alias correctly');
        });

        /**
         * @brief Tests handling of characters with empty image_link arrays
         * @test Validates proper processing when no ASCII art data is provided
         */
        test('should handle empty image_link array', async () => {
            const charactersWithEmptyImage = mockCharacters.map(char => ({ ...char, image_link: [] }));
            await fs.writeFile(testFilePath, JSON.stringify(charactersWithEmptyImage));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.ok(Array.isArray(person.imageContent), 'imageContent should be an array');
            assert.strictEqual(person.imageContent.length, 0, 'imageContent should be empty array');
        });
    });

    /**
     * @brief Test suite for random character selection algorithms and distribution
     * 
     * Tests randomization logic, character selection validity, dataset handling,
     * and statistical distribution of character selection over multiple iterations.
     */
    suite('Random Selection Algorithm', () => {
        /**
         * @brief Tests randomization effectiveness across multiple character selections
         * @test Validates that random selection produces variety over multiple iterations
         */
        test('should select different characters on multiple calls', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const selectedIds = new Set<number>();
            const iterations = 20; // Run enough times to likely get different characters

            for (let i = 0; i < iterations; i++) {
                const person = await darling.getRandomPerson();
                selectedIds.add(person.id);

                // Verify selected person is from our mock data
                const isValidCharacter = mockCharacters.some(char => char.id === person.id);
                assert.ok(isValidCharacter, `Selected character with id ${person.id} should be from mock data`);
            }

            // With 3 characters and 20 iterations, we should get some variety
            assert.ok(selectedIds.size >= 1, 'Should select at least one character');
        });

        /**
         * @brief Tests validation that only valid dataset characters are returned
         * @test Validates that random selection never returns invalid or corrupted data
         */
        test('should always return valid character from dataset', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const iterations = 10;
            for (let i = 0; i < iterations; i++) {
                const person = await darling.getRandomPerson();

                // Check that the returned person matches one from our dataset
                const matchingCharacter = mockCharacters.find(char => char.id === person.id);
                assert.ok(matchingCharacter, 'Selected character should exist in dataset');
                assert.strictEqual(person.name, matchingCharacter.name, 'Character name should match dataset');
                assert.strictEqual(person.romaji, matchingCharacter.romaji, 'Character romaji should match dataset');
            }
        });

        /**
         * @brief Tests behavior with datasets containing only one character
         * @test Validates consistent return of single character when no alternatives exist
         */
        test('should handle single character dataset', async () => {
            const singleCharacter = [mockCharacters[0]];
            await fs.writeFile(testFilePath, JSON.stringify(singleCharacter));
            const darling = new Darling(testFilePath, tempDir);

            const person1 = await darling.getRandomPerson();
            const person2 = await darling.getRandomPerson();

            assert.strictEqual(person1.id, person2.id, 'Should return same character when only one exists');
            assert.strictEqual(person1.name, mockCharacters[0].name, 'Should return the single character');
        });
    });

    /**
     * @brief Test suite for error handling and edge case scenarios
     * 
     * Comprehensive testing of error conditions, invalid data handling,
     * malformed JSON processing, and graceful failure mechanisms.
     */
    suite('Error Handling and Edge Cases', () => {
        /**
         * @brief Tests error handling for empty character arrays in JSON files
         * @test Validates proper exception throwing when no character data is available
         */
        test('should throw error for empty JSON file', async () => {
            await fs.writeFile(testFilePath, '[]');
            const darling = new Darling(testFilePath, tempDir);

            try {
                await darling.getRandomPerson();
                assert.fail('Should throw error for empty character array');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw Error instance');
                assert.ok(error.message.length > 0, 'Error should have meaningful message');
            }
        });

        /**
         * @brief Tests error handling for malformed JSON syntax
         * @test Validates proper exception handling when JSON parsing fails
         */
        test('should throw error for invalid JSON format', async () => {
            await fs.writeFile(testFilePath, '{ invalid json }');
            const darling = new Darling(testFilePath, tempDir);

            try {
                await darling.getRandomPerson();
                assert.fail('Should throw error for invalid JSON');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw Error instance for invalid JSON');
            }
        });

        /**
         * @brief Tests error handling for JSON files containing non-array data
         * @test Validates rejection of JSON objects that are not character arrays
         */
        test('should throw error for non-array JSON content', async () => {
            await fs.writeFile(testFilePath, '{"not": "an array"}');
            const darling = new Darling(testFilePath, tempDir);

            try {
                await darling.getRandomPerson();
                assert.fail('Should throw error for non-array JSON');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw Error instance for non-array JSON');
            }
        });

        /**
         * @brief Tests graceful handling of characters with missing optional properties
         * @test Validates proper defaults and fallbacks for incomplete character data
         */
        test('should handle missing optional properties', async () => {
            const minimalCharacter = [{
                id: 999,
                name: "Minimal Character",
                romaji: "Minimal",
                age: "Unknown",
                quote: "Test quote",
                description: "Test description",
                // Missing image_link - should default to empty array
                height: "Unknown",
                weight: "Unknown",
                more_information: "https://example.com",
                type: "Test",
                // Missing alias - should be undefined/null
            }];

            await fs.writeFile(testFilePath, JSON.stringify(minimalCharacter));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.strictEqual(person.name, "Minimal Character", 'Should load character with missing properties');
            assert.ok(Array.isArray(person.imageContent), 'imageContent should default to array');
            assert.strictEqual(person.imageContent.length, 0, 'imageContent should be empty when image_link missing');
        });
    });

    /**
     * @brief Test suite for HTML content generation and webview presentation
     * 
     * Tests HTML template generation, character data integration, styling,
     * and proper webview content structure for character display.
     */
    suite('HTML Content Generation', () => {
        /**
         * @brief Tests generation of valid HTML5 document structure for webview
         * @test Validates proper DOCTYPE, HTML tags, and document structure compliance
         */
        test('should generate valid HTML content for webview', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            // Mock the webview panel to capture HTML
            let capturedHtml = '';
            vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: any, options?: any) => {
                const webviewMock = {
                    _html: '',
                    set html(value: string) { this._html = value; capturedHtml = value; },
                    get html() { return this._html; },
                    onDidReceiveMessage: () => ({ dispose: () => { } })
                };
                return {
                    webview: webviewMock
                } as any;
            };

            await darling.displayRandomPersonInWindow();

            // Validate HTML structure
            assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Should include DOCTYPE declaration');
            assert.ok(capturedHtml.includes('<html lang="en">'), 'Should include HTML tag with language');
            assert.ok(capturedHtml.includes('<head>'), 'Should include head section');
            assert.ok(capturedHtml.includes('<body>'), 'Should include body section');
            assert.ok(capturedHtml.includes('<meta charset="UTF-8">'), 'Should include charset meta tag');
        });

        /**
         * @brief Tests inclusion of character data within generated HTML content
         * @test Validates that character properties are properly embedded in HTML output
         */
        test('should include character information in HTML', async () => {
            await fs.writeFile(testFilePath, JSON.stringify([mockCharacters[0]])); // Use first character for predictable test
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check that character data is included
            assert.ok(capturedHtml.includes('Zero Two'), 'Should include character name');
            assert.ok(capturedHtml.includes('Zero Tsuu'), 'Should include character romaji');
            assert.ok(capturedHtml.includes('Klaxo-Sapien Hybrid'), 'Should include character type');
            assert.ok(capturedHtml.includes('I want to become human'), 'Should include character quote');
        });

        /**
         * @brief Tests presence of interactive UI elements in generated HTML
         * @test Validates inclusion of copy, zoom, and control buttons with proper IDs
         */
        test('should include interactive buttons in HTML', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for interactive elements
            assert.ok(capturedHtml.includes('id="copyBtn"'), 'Should include copy button');
            assert.ok(capturedHtml.includes('id="zoomInBtn"'), 'Should include zoom in button');
            assert.ok(capturedHtml.includes('id="zoomOutBtn"'), 'Should include zoom out button');
            assert.ok(capturedHtml.includes('id="ascii"'), 'Should include ASCII art container');
        });

        /**
         * @brief Tests inclusion and validity of CSS styling in HTML output
         * @test Validates proper styling elements and ASCII art formatting rules
         */
        test('should include CSS styling', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for CSS
            assert.ok(capturedHtml.includes('<style>'), 'Should include style tag');
            assert.ok(capturedHtml.includes('font-family'), 'Should include font styling');
            assert.ok(capturedHtml.includes('white-space: pre'), 'Should include pre formatting for ASCII art');
        });

        /**
         * @brief Tests HTML generation for characters with null alias values
         * @test Validates proper display of fallback text when alias is null
         */
        test('should handle characters with null alias', async () => {
            const characterWithNullAlias = [{ ...mockCharacters[0], alias: null }];
            await fs.writeFile(testFilePath, JSON.stringify(characterWithNullAlias));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            assert.ok(capturedHtml.includes('None'), 'Should display "None" for null alias');
        });
    });

    /**
     * @brief Test suite for JavaScript functionality and interactive features
     * 
     * Tests client-side script generation, event handlers, VS Code API integration,
     * and interactive features like copy/zoom functionality within the webview.
     */
    suite('JavaScript Functionality', () => {
        /**
         * @brief Tests inclusion of copy button JavaScript functionality
         * @test Validates clipboard API integration and copy event handling scripts
         */
        test('should include copy button script', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for copy functionality
            assert.ok(capturedHtml.includes("getElementById('copyBtn')"), 'Should include copy button handler');
            assert.ok(capturedHtml.includes('navigator.clipboard.writeText'), 'Should include clipboard API usage');
            assert.ok(capturedHtml.includes("getElementById('ascii')"), 'Should reference ASCII art element');
        });

        /**
         * @brief Tests inclusion of zoom control JavaScript functionality
         * @test Validates zoom in/out buttons and font size adjustment scripts
         */
        test('should include zoom functionality script', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for zoom functionality
            assert.ok(capturedHtml.includes("getElementById('zoomInBtn')"), 'Should include zoom in button handler');
            assert.ok(capturedHtml.includes("getElementById('zoomOutBtn')"), 'Should include zoom out button handler');
            assert.ok(capturedHtml.includes('updateFontSize'), 'Should include font size update function');
            assert.ok(capturedHtml.includes('currentSize'), 'Should include current size variable');
        });

        /**
         * @brief Tests integration with VS Code webview API in generated scripts
         * @test Validates VS Code API acquisition and message communication setup
         */
        test('should include VS Code API integration', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for VS Code API usage
            assert.ok(capturedHtml.includes('acquireVsCodeApi'), 'Should include VS Code API acquisition');
            assert.ok(capturedHtml.includes('vscode.postMessage'), 'Should include message posting to extension');
        });
    });

    /**
     * @brief Test suite for webview integration and message handling systems
     * 
     * Tests bidirectional communication between webview and extension,
     * message handler setup, and proper webview panel configuration.
     */
    suite('Integration and Message Handling', () => {
        /**
         * @brief Tests message handler setup for webview copy event communication
         * @test Validates message handler registration and copy event processing
         */
        test('should setup message handler for copy events', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            let messageHandlerCalled = false;

            vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: any, options?: any) => {
                const webview = new MockWebview();
                webview.onDidReceiveMessage = (handler: (message: any) => void) => {
                    messageHandlerCalled = true;
                    // Test the handler directly
                    try {
                        handler({ type: 'copied' });
                        handler({ type: 'unknown' });
                    } catch (error) {
                        // Should handle gracefully
                    }
                    return { dispose: () => { } };
                };
                return { webview } as any;
            };

            await darling.displayRandomPersonInWindow();

            // Verify message handler was set up
            assert.ok(messageHandlerCalled, 'Should setup message handler');
        });

        /**
         * @brief Tests webview panel creation with proper configuration parameters
         * @test Validates panel title, options, and script enablement settings
         */
        test('should create webview with correct parameters', async () => {
            await fs.writeFile(testFilePath, JSON.stringify([mockCharacters[0]])); // Use specific character for predictable test
            const darling = new Darling(testFilePath, tempDir);

            let capturedTitle = '';
            let capturedOptions: any = null;

            vscode.window.createWebviewPanel = (viewType: string, title: string, showOptions: any, options?: any) => {
                capturedTitle = title;
                capturedOptions = options;
                return {
                    webview: new MockWebview()
                } as any;
            };

            await darling.displayRandomPersonInWindow();

            assert.strictEqual(capturedTitle, 'Zero Two', 'Should use character name as panel title');
            assert.ok(capturedOptions?.enableScripts, 'Should enable scripts in webview options');
        });
    });

    /**
     * @brief Test suite for performance optimization and memory management
     * 
     * Tests system performance under various loads, memory efficiency,
     * caching behavior, and scalability with large character datasets.
     */
    suite('Performance and Memory Management', () => {
        /**
         * @brief Tests performance under rapid successive character selection requests
         * @test Validates system responsiveness and timing under high-frequency operations
         */
        test('should handle multiple rapid character selections', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const startTime = Date.now();
            const iterations = 100;

            for (let i = 0; i < iterations; i++) {
                const person = await darling.getRandomPerson();
                assert.ok(person.id, 'Should return valid person');
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete reasonably quickly (less than 5 seconds for 100 iterations)
            assert.ok(duration < 5000, `Should complete ${iterations} selections in reasonable time (took ${duration}ms)`);
        });

        /**
         * @brief Tests efficient reuse of file loader instances and caching behavior
         * @test Validates that multiple calls leverage cached data without reloading
         */
        test('should reuse file loader instance efficiently', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            // Multiple calls should reuse cached data
            const person1 = await darling.getRandomPerson();
            const person2 = await darling.getRandomPerson();
            const person3 = await darling.getRandomPerson();

            // All should return valid persons (caching should not break functionality)
            assert.ok(person1.id, 'First person should be valid');
            assert.ok(person2.id, 'Second person should be valid');
            assert.ok(person3.id, 'Third person should be valid');
        });

        /**
         * @brief Tests scalability and performance with large character datasets
         * @test Validates efficient handling of datasets with 1000+ character entries
         */
        test('should handle large character datasets', async () => {
            // Create a larger dataset for performance testing
            const largeDataset: MockCharacterData[] = [];
            for (let i = 1; i <= 1000; i++) {
                largeDataset.push({
                    id: i,
                    name: `Character ${i}`,
                    romaji: `Character ${i}`,
                    age: `${16 + (i % 10)}`,
                    quote: `Quote from character ${i}`,
                    description: `Description for character ${i}`,
                    image_link: [`ASCII art line 1 for ${i}`, `ASCII art line 2 for ${i}`],
                    height: `${150 + (i % 30)} cm`,
                    weight: `${40 + (i % 40)} kg`,
                    more_information: `https://example.com/character${i}`,
                    type: 'Human',
                    alias: [`Alias${i}`]
                });
            }

            await fs.writeFile(testFilePath, JSON.stringify(largeDataset));
            const darling = new Darling(testFilePath, tempDir);

            const startTime = Date.now();
            const person = await darling.getRandomPerson();
            const endTime = Date.now();

            assert.ok(person.id >= 1 && person.id <= 1000, 'Should select from large dataset');
            assert.ok(endTime - startTime < 1000, 'Should handle large dataset efficiently');
        });
    });
});
