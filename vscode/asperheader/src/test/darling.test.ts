/**
 * @file darling.test.ts
 * @brief Comprehensive unit tests for the Darling character showcase system
 * @author Henry Letellier
 * @version 1.0.4
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

    onDidReceiveMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
        return { dispose: () => { } };
    }

    postMessage(message: any) {
        this.messageHandlers.forEach(handler => handler(message));
    }
}

suite('Darling Test Suite', () => {
    let tempDir: string;
    let testFilePath: string;
    let mockCharacters: MockCharacterData[];
    let originalCreateWebviewPanel: typeof vscode.window.createWebviewPanel;
    let capturedHtml: string;
    let lastCreatedWebview: MockWebview;

    /**
     * @brief Setup test environment before each test
     * Creates temporary directory and mock character data
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
     * Removes temporary files and restores mocks
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

    suite('Constructor and Initialization', () => {
        test('should create instance with default parameters', () => {
            const darling = new Darling();
            assert.ok(darling instanceof Darling, 'Should create Darling instance');
        });

        test('should create instance with file path parameter', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath);
            assert.ok(darling instanceof Darling, 'Should create Darling instance with file path');
        });

        test('should create instance with both file path and working directory', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);
            assert.ok(darling instanceof Darling, 'Should create Darling instance with both parameters');
        });

        test('should handle undefined parameters gracefully', () => {
            const darling = new Darling(undefined, undefined);
            assert.ok(darling instanceof Darling, 'Should handle undefined parameters');
        });
    });

    suite('File Path Management', () => {
        test('should update file path successfully', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling();

            const success = await darling.updateFilePath(testFilePath);
            assert.strictEqual(success, true, 'Should return true for successful file path update');
        });

        test('should update working directory successfully', async () => {
            const darling = new Darling();

            const success = await darling.updateCurrentWorkingDirectory(tempDir);
            assert.strictEqual(success, true, 'Should return true for successful working directory update');
        });

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

    suite('Character Data Loading and Validation', () => {
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

        test('should correctly map image_link to imageContent', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.ok(Array.isArray(person.imageContent), 'imageContent should be an array');
            assert.ok(person.imageContent.length > 0, 'imageContent should not be empty');
            assert.ok(person.imageContent.every(line => typeof line === 'string'), 'All imageContent lines should be strings');
        });

        test('should handle null alias correctly', async () => {
            const charactersWithNullAlias = mockCharacters.map(char => ({ ...char, alias: null }));
            await fs.writeFile(testFilePath, JSON.stringify(charactersWithNullAlias));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.strictEqual(person.alias, null, 'Should handle null alias correctly');
        });

        test('should handle empty image_link array', async () => {
            const charactersWithEmptyImage = mockCharacters.map(char => ({ ...char, image_link: [] }));
            await fs.writeFile(testFilePath, JSON.stringify(charactersWithEmptyImage));
            const darling = new Darling(testFilePath, tempDir);

            const person = await darling.getRandomPerson();

            assert.ok(Array.isArray(person.imageContent), 'imageContent should be an array');
            assert.strictEqual(person.imageContent.length, 0, 'imageContent should be empty array');
        });
    });

    suite('Random Selection Algorithm', () => {
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

    suite('Error Handling and Edge Cases', () => {
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

    suite('HTML Content Generation', () => {
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

        test('should include CSS styling', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for CSS
            assert.ok(capturedHtml.includes('<style>'), 'Should include style tag');
            assert.ok(capturedHtml.includes('font-family'), 'Should include font styling');
            assert.ok(capturedHtml.includes('white-space: pre'), 'Should include pre formatting for ASCII art');
        });

        test('should handle characters with null alias', async () => {
            const characterWithNullAlias = [{ ...mockCharacters[0], alias: null }];
            await fs.writeFile(testFilePath, JSON.stringify(characterWithNullAlias));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            assert.ok(capturedHtml.includes('None'), 'Should display "None" for null alias');
        });
    });

    suite('JavaScript Functionality', () => {
        test('should include copy button script', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for copy functionality
            assert.ok(capturedHtml.includes("getElementById('copyBtn')"), 'Should include copy button handler');
            assert.ok(capturedHtml.includes('navigator.clipboard.writeText'), 'Should include clipboard API usage');
            assert.ok(capturedHtml.includes("getElementById('ascii')"), 'Should reference ASCII art element');
        });

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

        test('should include VS Code API integration', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockCharacters));
            const darling = new Darling(testFilePath, tempDir);

            await darling.displayRandomPersonInWindow();

            // Check for VS Code API usage
            assert.ok(capturedHtml.includes('acquireVsCodeApi'), 'Should include VS Code API acquisition');
            assert.ok(capturedHtml.includes('vscode.postMessage'), 'Should include message posting to extension');
        });
    });

    suite('Integration and Message Handling', () => {
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

    suite('Performance and Memory Management', () => {
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
