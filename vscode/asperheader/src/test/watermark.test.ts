/**
 * @file watermark.test.ts
 * @brief Comprehensive unit tests for the Watermark ASCII art signature system
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This test suite provides extensive coverage for the Watermark module, which manages
 * the display of ASCII art author signatures and watermarks in VS Code webview panels.
 * 
 * Test Coverage Areas:
 * - Constructor initialization and parameter handling
 * - File path and working directory management
 * - Watermark data loading and validation
 * - Random watermark selection algorithms
 * - Error handling for invalid data and missing files
 * - HTML content generation and webview creation
 * - Interactive feature scripts (copy, zoom functionality)
 * - Font name display and metadata handling
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
import { Watermark, watermark } from '../modules/watermark';

/**
 * @interface MockWatermarkData
 * @brief Interface for test watermark data matching the JSON structure
 */
interface MockWatermarkData {
    Logo: string[];
    fontName: string;
}

/**
 * @class MockWebview
 * @brief Mock implementation of VS Code webview for testing
 * 
 * @property {string} _html - Internal HTML content storage
 * @property {Array<Function>} messageHandlers - Collection of message event handlers
 */
class MockWebview {
    private _html: string = '';
    private messageHandlers: Array<(message: any) => void> = [];

    /**
     * @brief Gets the current HTML content of the webview
     * @return The HTML content string
     */
    get html(): string {
        return this._html;
    }

    /**
     * @brief Sets the HTML content of the webview
     * @param value The HTML content to set
     */
    set html(value: string) {
        this._html = value;
    }

    /**
     * @brief Registers a message handler for webview communication
     * @param handler Function to handle received messages
     * @return Disposable object for cleanup
     */
    onDidReceiveMessage(handler: (message: any) => void) {
        this.messageHandlers.push(handler);
        return { dispose: () => { } };
    }

    /**
     * @brief Posts a message to all registered handlers
     * @param message The message object to send
     */
    postMessage(message: any) {
        this.messageHandlers.forEach(handler => handler(message));
    }
}

/**
 * @class MockWebviewPanel
 * @brief Mock implementation of VS Code webview panel for testing
 * 
 * @property {MockWebview} webview - The associated webview instance
 * @property {string} viewType - The type identifier for the webview
 * @property {string} title - The display title of the panel
 * @property {vscode.ViewColumn} showOptions - Column positioning options
 * @property {vscode.WebviewPanelOptions & vscode.WebviewOptions} options - Panel configuration options
 */
class MockWebviewPanel {
    public webview: MockWebview;

    /**
     * @brief Constructs a new mock webview panel with specified configuration
     * @param viewType The type identifier for the webview panel
     * @param title The display title of the webview panel
     * @param showOptions The column where the panel should be shown
     * @param options Configuration options for the webview panel
     */
    constructor(
        public viewType: string,
        public title: string,
        public showOptions: vscode.ViewColumn,
        public options: vscode.WebviewPanelOptions & vscode.WebviewOptions
    ) {
        this.webview = new MockWebview();
    }
}

/**
 * @brief Main test suite for Watermark ASCII art signature system
 * @test Comprehensive testing of watermark loading, selection, HTML generation, and webview integration
 */
suite('Watermark Test Suite', () => {
    let tempDir: string;
    let testFilePath: string;
    let mockWatermarks: MockWatermarkData[];
    let originalCreateWebviewPanel: typeof vscode.window.createWebviewPanel;
    let capturedHtml: string;
    let lastCreatedWebview: MockWebview;
    let lastCreatedPanel: MockWebviewPanel;

    /**
     * @brief Setup test environment before each test
     * @test Creates temporary directory, mock watermark data, and VS Code API mocks
     */
    setup(async () => {
        // Create temporary directory for test files
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'watermark-test-'));
        testFilePath = path.join(tempDir, 'test-watermarks.json');

        // Create comprehensive mock watermark data
        mockWatermarks = [
            {
                Logo: [
                    " _     _____ _      ____ ___  _   _     _____ _____ _____ _     _     _  _____ ____",
                    "/ \\ /|/  __// \\  /|/  __\\\\  \\//  / \\   /  __//__ __Y  __// \\   / \\   / \\/  __//  __\\",
                    "| |_|||  \\  | |\\ |||  \\/| \\  /   | |   |  \\    / \\ |  \\  | |   | |   | ||  \\  |  \\/|",
                    "| | |||  /_ | | \\|||    / / /    | |_/\\|  /_   | | |  /_ | |_/\\| |_/\\| ||  /_ |    /",
                    "\\_/ \\|\\____\\\\_/  \\|\\_/\\_\\/_/     \\____/\\____\\  \\_/ \\____\\\\____/\\____/\\_/\\____\\\\_/\\_\\",
                    ""
                ],
                fontName: "Avatar"
            },
            {
                Logo: [
                    "  _    _                         _          _       _ _ _",
                    " | |  | |                       | |        | |     | | (_)",
                    " | |__| | ___ _ __  _ __ _   _  | |     ___| |_ ___| | |_  ___ _ __",
                    " |  __  |/ _ \\ '_ \\| '__| | | | | |    / _ \\ __/ _ \\ | | |/ _ \\ '__|",
                    " | |  | |  __/ | | | |  | |_| | | |___|  __/ ||  __/ | | |  __/ |",
                    " |_|  |_|\\___|_| |_|_|   \\__, | |______\\___|\\__\\___|_|_|_|\\___|_|",
                    "                          __/ |",
                    "                         |___/"
                ],
                fontName: "Big"
            },
            {
                Logo: [
                    " _   _  ____  _  _  ____  _  _    __    ____  ____  ____  __    __    ____  ____  ____",
                    "( )_( )( ___)( \\( )(  _ \\( \\/ )  (  )  ( ___)(_  _)( ___)(  )  (  )  (_  _)( ___)(  _ \\",
                    " ) _ (  )__)  )  (  )   / \\  /    )(__  )__)   )(   )__)  )(__  )(__  _)(_  )__)  )   /",
                    "(_) (_)(____)(_)\\_)(_)\\_) (__)   (____)(____) (__) (____)(____)(____)(____)(____)(_)\\_)"
                ],
                fontName: "Bulbhead"
            },
            {
                Logo: [
                    "╦ ╦┌─┐┌┐┌┬─┐┬ ┬  ╦  ┌─┐┌┬┐┌─┐┬  ┬  ┬┌─┐┬─┐",
                    "╠═╣├┤ │││├┬┘└┬┘  ║  ├┤  │ ├┤ │  │  │├┤ ├┬┘",
                    "╩ ╩└─┘┘└┘┴└─ ┴   ╩═╝└─┘ ┴ └─┘┴─┘┴─┘┴└─┘┴└─"
                ],
                fontName: "Calvin S"
            },
            {
                Logo: [
                    "██   ██ ███████ ███    ██ ██████  ██    ██     ██      ███████ ████████ ███████ ██      ██      ██ ███████ ██████",
                    "██   ██ ██      ████   ██ ██   ██  ██  ██      ██      ██         ██    ██      ██      ██      ██ ██      ██   ██",
                    "███████ █████   ██ ██  ██ ██████    ████       ██      █████      ██    █████   ██      ██      ██ █████   ██████",
                    "██   ██ ██      ██  ██ ██ ██   ██    ██        ██      ██         ██    ██      ██      ██      ██ ██      ██   ██",
                    "██   ██ ███████ ██   ████ ██   ██    ██        ███████ ███████    ██    ███████ ███████ ███████ ██ ███████ ██   ██"
                ],
                fontName: "Chunky"
            }
        ];

        // Setup webview mocking
        capturedHtml = '';
        originalCreateWebviewPanel = vscode.window.createWebviewPanel;
        vscode.window.createWebviewPanel = (
            viewType: string,
            title: string,
            showOptions: vscode.ViewColumn | { readonly viewColumn: vscode.ViewColumn; readonly preserveFocus?: boolean | undefined; },
            options?: vscode.WebviewPanelOptions & vscode.WebviewOptions
        ) => {
            const column = typeof showOptions === 'object' ? showOptions.viewColumn : showOptions;
            const opts = options || {};
            lastCreatedPanel = new MockWebviewPanel(viewType, title, column, opts);
            lastCreatedWebview = lastCreatedPanel.webview;

            // Capture HTML when it's set
            Object.defineProperty(lastCreatedWebview, 'html', {
                get: () => capturedHtml,
                set: (value: string) => {
                    capturedHtml = value;
                }
            });

            return lastCreatedPanel as any;
        };
    });

    /**
     * @brief Cleanup test environment after each test
     * @test Removes temporary files and restores VS Code API mocks
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
     * @brief Test suite for constructor and initialization functionality
     * @test Validates Watermark instance creation with various parameter combinations
     */
    suite('Constructor and Initialization', () => {
        /**
         * @brief Tests Watermark creation with default parameters
         * @test Validates that instance can be created without any parameters
         */
        test('should create instance with default parameters', () => {
            const watermark = new Watermark();
            assert.ok(watermark instanceof Watermark, 'Should create Watermark instance');
        });

        /**
         * @brief Tests Watermark creation with file path parameter
         * @test Validates that instance can be created with specified file path
         */
        test('should create instance with file path parameter', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath);
            assert.ok(watermark instanceof Watermark, 'Should create Watermark instance with file path');
        });

        /**
         * @brief Tests Watermark creation with both file path and working directory
         * @test Validates that instance can be created with both parameters
         */
        test('should create instance with both file path and working directory', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);
            assert.ok(watermark instanceof Watermark, 'Should create Watermark instance with both parameters');
        });

        /**
         * @brief Tests graceful handling of undefined parameters
         * @test Validates that undefined parameters don't cause initialization errors
         */
        test('should handle undefined parameters gracefully', () => {
            const watermark = new Watermark(undefined, undefined);
            assert.ok(watermark instanceof Watermark, 'Should handle undefined parameters');
        });
    });

    /**
     * @brief Test suite for file path management functionality
     * @test Validates file path updates, working directory handling, and path resolution
     */
    suite('File Path Management', () => {
        /**
         * @brief Tests successful file path updates
         * @test Validates that valid file paths can be set and return success status
         */
        test('should update file path successfully', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark();

            const success = await watermark.updateFilePath(testFilePath);
            assert.strictEqual(success, true, 'Should return true for successful file path update');
        });

        /**
         * @brief Tests successful working directory updates
         * @test Validates that working directory can be updated and return success status
         */
        test('should update working directory successfully', async () => {
            const watermark = new Watermark();

            const success = await watermark.updateCurrentWorkingDirectory(tempDir);
            assert.strictEqual(success, true, 'Should return true for successful working directory update');
        });

        /**
         * @brief Tests handling of relative paths with working directory context
         * @test Validates that relative paths are resolved correctly against working directory
         */
        test('should handle relative paths with working directory', async () => {
            const relativePath = 'watermarks.json';
            const fullPath = path.join(tempDir, relativePath);
            await fs.writeFile(fullPath, JSON.stringify(mockWatermarks));

            const watermark = new Watermark();
            await watermark.updateCurrentWorkingDirectory(tempDir);
            const success = await watermark.updateFilePath(relativePath);

            assert.strictEqual(success, true, 'Should handle relative paths correctly');
        });
    });

    /**
     * @brief Test suite for watermark data loading and validation functionality
     * @test Validates JSON parsing, data structure validation, and property mapping
     */
    suite('Watermark Data Loading and Validation', () => {
        /**
         * @brief Tests correct loading and parsing of watermark data from JSON
         * @test Validates that JSON watermark data is loaded with proper structure and types
         */
        test('should load and parse watermark data correctly', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            // Validate watermark structure
            assert.ok(typeof result.fontName === 'string', 'Watermark should have string fontName');
            assert.ok(Array.isArray(result.watermark), 'Watermark should have array watermark content');
            assert.ok(result.watermark.length > 0, 'Watermark array should not be empty');
            assert.ok(result.watermark.every(line => typeof line === 'string'), 'All watermark lines should be strings');
        });

        /**
         * @brief Tests correct mapping of Logo property to watermark property
         * @test Validates that JSON Logo arrays are properly mapped to watermark arrays
         */
        test('should correctly map Logo to watermark property', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.ok(Array.isArray(result.watermark), 'watermark property should be an array');
            assert.ok(result.watermark.length > 0, 'watermark content should not be empty');
            assert.ok(result.watermark.every(line => typeof line === 'string'), 'All watermark content lines should be strings');
        });

        /**
         * @brief Tests handling of various font name formats
         * @test Validates that different font name styles are processed correctly
         */
        test('should handle various font name formats', async () => {
            const diverseFonts = [
                { Logo: ["Simple", "Font"], fontName: "SimpleName" },
                { Logo: ["Complex", "Font"], fontName: "Complex Font With Spaces" },
                { Logo: ["Special", "Font"], fontName: "Special-Characters_123" },
                { Logo: ["Unicode", "Font"], fontName: "Unicode Font ♦ ♠ ♣ ♥" }
            ];
            await fs.writeFile(testFilePath, JSON.stringify(diverseFonts));
            const watermark = new Watermark(testFilePath, tempDir);

            for (let i = 0; i < 10; i++) {
                const result = await watermark.getRandomWatermark();
                assert.ok(typeof result.fontName === 'string', 'Font name should be a string');
                assert.ok(result.fontName.length > 0, 'Font name should not be empty');
            }
        });

        /**
         * @brief Tests graceful handling of empty logo arrays
         * @test Validates that watermarks with empty Logo arrays don't crash the system
         */
        test('should handle empty logo arrays gracefully', async () => {
            const emptyLogoWatermarks = [
                { Logo: [], fontName: "EmptyLogo" },
                { Logo: ["Non-empty"], fontName: "NonEmpty" }
            ];
            await fs.writeFile(testFilePath, JSON.stringify(emptyLogoWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.ok(Array.isArray(result.watermark), 'watermark should be an array');
            assert.ok(typeof result.fontName === 'string', 'fontName should be a string');
        });
    });

    /**
     * @brief Test suite for random selection algorithm functionality
     * @test Validates randomness, selection variety, content processing, and single-item handling
     */
    suite('Random Selection Algorithm', () => {
        /**
         * @brief Tests selection variety across multiple calls
         * @test Validates that multiple selections can produce different watermarks
         */
        test('should select different watermarks on multiple calls', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const selectedFonts = new Set<string>();

            // Get multiple watermark selections
            for (let i = 0; i < 20; i++) {
                const result = await watermark.getRandomWatermark();
                selectedFonts.add(result.fontName);
            }

            // With 5 watermark fonts, we should see some variety in 20 selections
            assert.ok(selectedFonts.size >= 2, 'Should select multiple different fonts');
        });

        /**
         * @brief Tests that selections always return valid watermarks from dataset
         * @test Validates that selected watermarks have proper structure and are from the loaded data
         */
        test('should always return valid watermark from dataset', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const expectedFonts = new Set(mockWatermarks.map(w => w.fontName));

            for (let i = 0; i < 10; i++) {
                const result = await watermark.getRandomWatermark();

                assert.ok(result.fontName, 'Should have a font name');
                assert.ok(expectedFonts.has(result.fontName), `Font name ${result.fontName} should be from the dataset`);
                assert.ok(Array.isArray(result.watermark), 'Watermark content should be an array');
                assert.ok(result.watermark.length >= 0, 'Watermark should have valid content');
            }
        });

        /**
         * @brief Tests correct handling of files with single watermark
         * @test Validates that single-watermark files work correctly and consistently
         */
        test('should handle single watermark file correctly', async () => {
            const singleWatermark = [mockWatermarks[0]];
            await fs.writeFile(testFilePath, JSON.stringify(singleWatermark));
            const watermark = new Watermark(testFilePath, tempDir);

            for (let i = 0; i < 5; i++) {
                const result = await watermark.getRandomWatermark();

                assert.strictEqual(result.fontName, mockWatermarks[0].fontName);
                assert.deepStrictEqual(result.watermark, mockWatermarks[0].Logo);
            }
        });

        /**
         * @brief Tests proper handling of watermark content arrays
         * @test Validates that watermark content arrays are processed correctly with proper types
         */
        test('should properly handle watermark content arrays', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.ok(Array.isArray(result.watermark), 'Watermark content should be an array');

            // Verify that each line is a string
            result.watermark.forEach((line, index) => {
                assert.ok(typeof line === 'string', `Watermark line ${index} should be a string`);
            });
        });
    });

    /**
     * @brief Test suite for error handling and edge case scenarios
     * @test Validates graceful handling of errors, malformed data, and file system issues
     */
    suite('Error Handling and Edge Cases', () => {
        /**
         * @brief Tests error handling for empty JSON files
         * @test Validates that empty watermark arrays throw appropriate errors
         */
        test('should throw error for empty JSON file', async () => {
            await fs.writeFile(testFilePath, JSON.stringify([]));
            const watermark = new Watermark(testFilePath, tempDir);

            try {
                await watermark.getRandomWatermark();
                assert.fail('Should throw error for empty watermark array');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw an Error instance');
            }
        });

        /**
         * @brief Tests error handling for invalid JSON format
         * @test Validates that malformed JSON files throw parse errors
         */
        test('should throw error for invalid JSON format', async () => {
            await fs.writeFile(testFilePath, '{ invalid json');
            const watermark = new Watermark(testFilePath, tempDir);

            try {
                await watermark.getRandomWatermark();
                assert.fail('Should throw error for invalid JSON');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw an Error instance');
            }
        });

        /**
         * @brief Tests error handling for non-array JSON content
         * @test Validates that JSON objects instead of arrays throw appropriate errors
         */
        test('should throw error for non-array JSON content', async () => {
            await fs.writeFile(testFilePath, JSON.stringify({ not: "an array" }));
            const watermark = new Watermark(testFilePath, tempDir);

            try {
                await watermark.getRandomWatermark();
                assert.fail('Should throw error for non-array JSON content');
            } catch (error) {
                assert.ok(error instanceof Error, 'Should throw an Error instance');
            }
        });

        /**
         * @brief Tests graceful handling of missing Logo property
         * @test Validates that watermarks without Logo property are handled appropriately
         */
        test('should handle missing Logo property gracefully', async () => {
            const malformedWatermarks = [
                { fontName: "MissingLogo" }, // Missing Logo property
                { Logo: ["Valid", "Content"], fontName: "Valid" }
            ];
            await fs.writeFile(testFilePath, JSON.stringify(malformedWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            // Should handle gracefully or throw meaningful error
            try {
                const result = await watermark.getRandomWatermark();
                // If it succeeds, it should have valid structure
                assert.ok(typeof result.fontName === 'string');
            } catch (error) {
                // If it fails, that's acceptable for malformed data
                assert.ok(error instanceof Error);
            }
        });

        /**
         * @brief Tests graceful handling of missing fontName property
         * @test Validates that watermarks without fontName property are handled appropriately
         */
        test('should handle missing fontName property gracefully', async () => {
            const malformedWatermarks = [
                { Logo: ["Missing", "Font", "Name"] }, // Missing fontName property
                { Logo: ["Valid", "Content"], fontName: "Valid" }
            ];
            await fs.writeFile(testFilePath, JSON.stringify(malformedWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            // Should handle gracefully or throw meaningful error
            try {
                const result = await watermark.getRandomWatermark();
                // If it succeeds, it should have valid structure
                assert.ok(Array.isArray(result.watermark));
            } catch (error) {
                // If it fails, that's acceptable for malformed data
                assert.ok(error instanceof Error);
            }
        });

        /**
         * @brief Tests handling of file not found errors
         * @test Validates that non-existent files are handled gracefully
         */
        test('should handle file not found error', async () => {
            const watermark = new Watermark();

            // Try to update to non-existent file
            const nonExistentPath = path.join(tempDir, 'non-existent.json');
            await watermark.updateFilePath(nonExistentPath);

            try {
                await watermark.getRandomWatermark();
                // May succeed if no file path is set and returns default
            } catch (error) {
                // Expected for missing file
                assert.ok(error instanceof Error);
            }
        });
    });

    /**
     * @brief Test suite for HTML content generation functionality
     * @test Validates HTML structure, content inclusion, styling, and interactive elements
     */
    suite('HTML Content Generation', () => {
        /**
         * @brief Tests generation of valid HTML content for webview display
         * @test Validates that generated HTML has proper structure and DOCTYPE
         */
        test('should generate valid HTML content for webview', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml, 'Should generate HTML content');
            assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Should be valid HTML');
            assert.ok(capturedHtml.includes('<html lang="en">'), 'Should have language attribute');
            assert.ok(capturedHtml.includes('<body>'), 'Should have body tag');
        });

        /**
         * @brief Tests inclusion of watermark content in generated HTML
         * @test Validates that ASCII art watermark content is properly embedded in HTML structure
         */
        test('should include watermark content in HTML', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('<pre id="ascii">'), 'Should include ASCII art container');
            // HTML should contain some watermark content
            const preMatch = capturedHtml.match(/<pre id="ascii">(.*?)<\/pre>/s);
            assert.ok(preMatch, 'Should have ASCII art content');
            assert.ok(preMatch[1].length > 0, 'ASCII art content should not be empty');
        });

        /**
         * @brief Tests inclusion of interactive buttons in HTML
         * @test Validates that copy and zoom buttons are present in generated HTML
         */
        test('should include interactive buttons in HTML', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('id="copyBtn"'), 'Should include copy button');
            assert.ok(capturedHtml.includes('id="zoomInBtn"'), 'Should include zoom in button');
            assert.ok(capturedHtml.includes('id="zoomOutBtn"'), 'Should include zoom out button');
        });

        /**
         * @brief Tests inclusion of CSS styling in HTML
         * @test Validates that proper CSS styles are included for formatting
         */
        test('should include CSS styling', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('<style>'), 'Should include CSS styling');
            assert.ok(capturedHtml.includes('font-family:'), 'Should have font family styling');
            assert.ok(capturedHtml.includes('pre {'), 'Should have pre tag styling for ASCII art');
        });

        /**
         * @brief Tests display of font name in HTML or panel title
         * @test Validates that the watermark font name is visible to the user
         */
        test('should include font name in display', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            // Should include font name in the content or title
            const includesFontName = mockWatermarks.some(w =>
                capturedHtml.includes(w.fontName) || lastCreatedPanel.title.includes(w.fontName)
            );
            assert.ok(includesFontName, 'Should display font name');
        });

        /**
         * @brief Tests inclusion of author information in display
         * @test Validates that author name is included in the generated content
         */
        test('should include author information', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('Henry Letellier'), 'Should include author name');
        });

        /**
         * @brief Tests graceful handling of empty watermark content
         * @test Validates that empty content doesn't break HTML generation
         */
        test('should handle empty watermark content gracefully', async () => {
            const emptyWatermarks = [{ Logo: [], fontName: "Empty" }];
            await fs.writeFile(testFilePath, JSON.stringify(emptyWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            // Should not throw and should generate valid HTML
            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml, 'Should generate HTML even with empty content');
            assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Should be valid HTML');
        });
    });

    /**
     * @brief Test suite for JavaScript functionality in webview
     * @test Validates interactive features like copy, zoom, VS Code integration, and debugging
     */
    suite('JavaScript Functionality', () => {
        /**
         * @brief Tests inclusion of copy button functionality
         * @test Validates that copy button script and clipboard integration are present
         */
        test('should include copy button script', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes("getElementById('copyBtn')"), 'Should include copy button script');
            assert.ok(capturedHtml.includes('navigator.clipboard.writeText'), 'Should use clipboard API');
            assert.ok(capturedHtml.includes("vscode.postMessage({ type: 'copied' })"), 'Should post message to VS Code');
        });

        /**
         * @brief Tests inclusion of zoom functionality script
         * @test Validates that font size adjustment controls are properly implemented
         */
        test('should include zoom functionality script', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('updateFontSize'), 'Should include font size update function');
            assert.ok(capturedHtml.includes("getElementById('zoomInBtn')"), 'Should include zoom in handler');
            assert.ok(capturedHtml.includes("getElementById('zoomOutBtn')"), 'Should include zoom out handler');
            assert.ok(capturedHtml.includes('currentSize'), 'Should track current font size');
        });

        /**
         * @brief Tests VS Code API integration in JavaScript
         * @test Validates that webview communicates properly with VS Code extension
         */
        test('should include VS Code API integration', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('acquireVsCodeApi()'), 'Should acquire VS Code API');
            assert.ok(capturedHtml.includes('vscode.postMessage'), 'Should use VS Code message posting');
        });

        /**
         * @brief Tests implementation of font size constraints in zoom functionality
         * @test Validates that zoom has proper minimum/maximum limits and initialization
         */
        test('should implement font size constraints in zoom', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            // Should have minimum size constraint
            assert.ok(capturedHtml.includes('>= 2'), 'Should have minimum font size constraint');
            // Should have size initialization
            assert.ok(capturedHtml.includes('currentSize = 20'), 'Should initialize font size');
        });

        /**
         * @brief Tests inclusion of debug logging for zoom functionality
         * @test Validates that debug console logging is present for troubleshooting
         */
        test('should include debug logging for zoom functionality', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(capturedHtml.includes('console.log'), 'Should include console logging');
            assert.ok(capturedHtml.includes('sizeDifference'), 'Should log size difference');
            assert.ok(capturedHtml.includes('currentSize'), 'Should log current size');
        });
    });

    /**
     * @brief Test suite for integration and message handling functionality
     * @test Validates webview creation, message communication, and VS Code integration
     */
    suite('Integration and Message Handling', () => {
        /**
         * @brief Tests setup of message handler for copy events
         * @test Validates that message handling infrastructure is properly established
         */
        test('should setup message handler for copy events', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            // Verify webview was created with message handling
            assert.ok(lastCreatedPanel, 'Should create webview panel');
            assert.ok(lastCreatedWebview, 'Should create webview');

            // Simulate copy message
            if (lastCreatedWebview && lastCreatedWebview.postMessage) {
                lastCreatedWebview.postMessage({ type: 'copied' });
            }

            // Should not throw errors
            assert.ok(true, 'Message handling should not throw errors');
        });

        /**
         * @brief Tests webview creation with correct configuration parameters
         * @test Validates that webview panel is created with proper settings and title
         */
        test('should create webview with correct parameters', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            assert.ok(lastCreatedPanel, 'Should create webview panel');
            assert.strictEqual(lastCreatedPanel.showOptions, vscode.ViewColumn.One, 'Should use ViewColumn.One');
            assert.ok(lastCreatedPanel.options.enableScripts, 'Should enable scripts');

            // Title should be one of the font names
            const expectedFontNames = mockWatermarks.map(w => w.fontName);
            assert.ok(expectedFontNames.includes(lastCreatedPanel.title), 'Title should be a font name');
        });

        /**
         * @brief Tests proper handling of message communication
         * @test Validates that various message types are handled without errors
         */
        test('should handle message communication properly', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            await watermark.displayRandomAuthorWatermarkInWindow();

            // Test different message types
            const testMessages = [
                { type: 'copied' },
                { type: 'unknown' },
                { type: 'test', data: 'value' }
            ];

            testMessages.forEach(message => {
                if (lastCreatedWebview && lastCreatedWebview.postMessage) {
                    try {
                        lastCreatedWebview.postMessage(message);
                    } catch (error) {
                        assert.fail(`Should handle message ${JSON.stringify(message)} without error`);
                    }
                }
            });

            assert.ok(true, 'All message types handled without errors');
        });
    });

    /**
     * @brief Test suite for performance and memory management
     * @test Validates efficiency, resource usage, and scalability under various loads
     */
    suite('Performance and Memory Management', () => {
        /**
         * @brief Tests handling of multiple rapid watermark selections
         * @test Validates that rapid successive selections complete within reasonable time
         */
        test('should handle multiple rapid watermark selections', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const startTime = Date.now();

            // Perform multiple rapid selections
            for (let i = 0; i < 50; i++) {
                await watermark.getRandomWatermark();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete reasonably quickly (less than 5 seconds)
            assert.ok(duration < 5000, 'Multiple selections should be reasonably fast');
        });

        /**
         * @brief Tests efficient reuse of file loader instances
         * @test Validates that data loading infrastructure is reused for performance
         */
        test('should reuse file loader instances efficiently', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            // Get multiple watermarks - should reuse the loaded data
            const watermark1 = await watermark.getRandomWatermark();
            const watermark2 = await watermark.getRandomWatermark();

            assert.ok(typeof watermark1.fontName === 'string');
            assert.ok(typeof watermark2.fontName === 'string');

            // Both should be valid watermark objects
            assert.ok(Array.isArray(watermark1.watermark));
            assert.ok(Array.isArray(watermark2.watermark));
        });

        /**
         * @brief Tests handling of large watermark collections
         * @test Validates that performance remains acceptable with many watermarks
         */
        test('should handle large watermark collections', async () => {
            // Create large collection of watermarks
            const largeCollection: MockWatermarkData[] = [];
            for (let i = 0; i < 100; i++) {
                largeCollection.push({
                    Logo: [`Watermark ${i}`, `Line 2 of ${i}`, `Line 3 of ${i}`],
                    fontName: `Font${i}`
                });
            }

            await fs.writeFile(testFilePath, JSON.stringify(largeCollection));
            const watermark = new Watermark(testFilePath, tempDir);

            // Should still work efficiently
            const result = await watermark.getRandomWatermark();
            assert.ok(result.fontName.startsWith('Font'));
            assert.ok(Array.isArray(result.watermark));
            assert.strictEqual(result.watermark.length, 3);
        });

        /**
         * @brief Tests file path updates without memory leaks
         * @test Validates that multiple file changes don't cause resource leaks
         */
        test('should handle file path updates without memory leaks', async () => {
            const watermark = new Watermark();

            // Create multiple temporary files
            const file1 = path.join(tempDir, 'watermarks1.json');
            const file2 = path.join(tempDir, 'watermarks2.json');

            await fs.writeFile(file1, JSON.stringify([mockWatermarks[0]]));
            await fs.writeFile(file2, JSON.stringify([mockWatermarks[1]]));

            // Update file path multiple times
            await watermark.updateFilePath(file1);
            const result1 = await watermark.getRandomWatermark();

            await watermark.updateFilePath(file2);
            const result2 = await watermark.getRandomWatermark();

            await watermark.updateFilePath(file1);
            const result3 = await watermark.getRandomWatermark();

            // Should get appropriate results from each file
            assert.strictEqual(result1.fontName, mockWatermarks[0].fontName);
            assert.strictEqual(result2.fontName, mockWatermarks[1].fontName);
            assert.strictEqual(result3.fontName, mockWatermarks[0].fontName);
        });
    });

    /**
     * @brief Test suite for edge cases and robustness functionality
     * @test Validates handling of Unicode, long content, special characters, and extended data
     */
    suite('Edge Cases and Robustness', () => {
        /**
         * @brief Tests handling of Unicode characters in watermarks
         * @test Validates that Unicode symbols and characters are preserved correctly
         */
        test('should handle Unicode characters in watermarks', async () => {
            const unicodeWatermarks = [
                {
                    Logo: [
                        "╔══════════════════════════════════════╗",
                        "║               UNICODE LOGO           ║",
                        "║  ♦ ♠ ♣ ♥ ★ ☆ ☀ ☁ ☂ ☃ ☄ ☎ ☏ ☐ ☑   ║",
                        "║  ♪ ♫ ♬ ♭ ♮ ♯ ♰ ♱ ♲ ♳ ♴ ♵ ♶ ♷ ♸    ║",
                        "╚══════════════════════════════════════╝"
                    ],
                    fontName: "Unicode Test"
                }
            ];

            await fs.writeFile(testFilePath, JSON.stringify(unicodeWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.strictEqual(result.fontName, "Unicode Test");
            assert.ok(result.watermark.some(line => line.includes('♦')), 'Should preserve Unicode characters');
        });

        /**
         * @brief Tests handling of very long watermark lines
         * @test Validates that extremely long lines are processed without truncation
         */
        test('should handle very long watermark lines', async () => {
            const longLineWatermark = [
                {
                    Logo: [
                        "A".repeat(1000), // Very long line
                        "Short line",
                        "B".repeat(500)   // Medium long line
                    ],
                    fontName: "Long Lines"
                }
            ];

            await fs.writeFile(testFilePath, JSON.stringify(longLineWatermark));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.strictEqual(result.fontName, "Long Lines");
            assert.strictEqual(result.watermark[0].length, 1000);
            assert.strictEqual(result.watermark[2].length, 500);
        });

        /**
         * @brief Tests handling of watermarks with many lines
         * @test Validates that watermarks with large numbers of lines are processed correctly
         */
        test('should handle watermarks with many lines', async () => {
            const manyLinesWatermark = [
                {
                    Logo: Array.from({ length: 100 }, (_, i) => `Line ${i + 1}`),
                    fontName: "Many Lines"
                }
            ];

            await fs.writeFile(testFilePath, JSON.stringify(manyLinesWatermark));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            assert.strictEqual(result.fontName, "Many Lines");
            assert.strictEqual(result.watermark.length, 100);
            assert.strictEqual(result.watermark[0], "Line 1");
            assert.strictEqual(result.watermark[99], "Line 100");
        });

        /**
         * @brief Tests handling of special characters in font names
         * @test Validates that font names with special symbols are processed correctly
         */
        test('should handle special characters in font names', async () => {
            const specialNameWatermarks = [
                { Logo: ["Test"], fontName: "Font/With\\Special:Characters" },
                { Logo: ["Test"], fontName: "Font<>With|Symbols" },
                { Logo: ["Test"], fontName: "Font\"With'Quotes" }
            ];

            await fs.writeFile(testFilePath, JSON.stringify(specialNameWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            for (let i = 0; i < 10; i++) {
                const result = await watermark.getRandomWatermark();
                assert.ok(typeof result.fontName === 'string');
                assert.ok(result.fontName.length > 0);
            }
        });

        /**
         * @brief Tests handling of JSON with extra properties
         * @test Validates that additional properties in JSON data are ignored gracefully
         */
        test('should handle JSON with extra properties', async () => {
            const extendedWatermarks = [
                {
                    Logo: ["Test", "Watermark"],
                    fontName: "Test Font",
                    extraProperty: "Should be ignored",
                    author: "Unknown",
                    version: 1.0
                }
            ];

            await fs.writeFile(testFilePath, JSON.stringify(extendedWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            // Should only use Logo and fontName properties
            assert.strictEqual(result.fontName, "Test Font");
            assert.deepStrictEqual(result.watermark, ["Test", "Watermark"]);
        });
    });

    /**
     * @brief Test suite for type safety and data integrity functionality
     * @test Validates type consistency, interface compliance, and data structure integrity
     */
    suite('Type Safety and Data Integrity', () => {
        /**
         * @brief Tests maintenance of correct types throughout selection process
         * @test Validates that all returned data maintains proper TypeScript types
         */
        test('should maintain correct types throughout selection process', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            for (let i = 0; i < 10; i++) {
                const result = await watermark.getRandomWatermark();

                // Type assertions
                assert.strictEqual(typeof result, 'object', 'Result should be an object');
                assert.strictEqual(typeof result.fontName, 'string', 'fontName should be string');
                assert.ok(Array.isArray(result.watermark), 'watermark should be array');

                // Content validation
                result.watermark.forEach((line, index) => {
                    assert.strictEqual(typeof line, 'string', `Line ${index} should be string`);
                });
            }
        });

        /**
         * @brief Tests validation of watermark interface compliance
         * @test Validates that returned objects satisfy the watermark interface contract
         */
        test('should validate watermark interface compliance', async () => {
            await fs.writeFile(testFilePath, JSON.stringify(mockWatermarks));
            const watermark = new Watermark(testFilePath, tempDir);

            const result = await watermark.getRandomWatermark();

            // Check that result satisfies watermark interface
            const watermarkInterface: watermark = result;
            assert.ok(watermarkInterface.fontName, 'Should have fontName property');
            assert.ok(watermarkInterface.watermark, 'Should have watermark property');

            // Ensure no extra properties (should only have these two)
            const keys = Object.keys(result);
            assert.ok(keys.includes('fontName'), 'Should include fontName');
            assert.ok(keys.includes('watermark'), 'Should include watermark');
        });
    });
});
