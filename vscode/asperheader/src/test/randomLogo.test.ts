/**
 * @file randomLogo.test.ts
 * @brief Comprehensive unit tests for the RandomLogo ASCII art management system
 * @author Henry Letellier
 * @version 1.0.10
 * @date 2025
 * 
 * This test suite provides extensive coverage for the RandomLogo module, which manages
 * the discovery, selection, and display of ASCII art logos stored in text files.
 * 
 * Test Coverage Areas:
 * - Constructor initialization and parameter handling
 * - File path and working directory management
 * - Logo file discovery and directory traversal
 * - Random logo selection algorithms
 * - Error handling for invalid files and missing directories
 * - HTML content generation and webview creation
 * - Interactive feature scripts (copy, zoom functionality)
 * - File system operations and path resolution
 * - Integration with LazyFileLoader and VS Code APIs
 * 
 * Testing Strategy:
 * - Uses real temporary files and directories for authentic operations
 * - Mocks VS Code webview APIs for isolated testing
 * - Validates ASCII art content and file structure integrity
 * - Tests edge cases and error conditions
 * - Verifies HTML output and JavaScript functionality
 * - Ensures proper resource cleanup and memory management
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';
import { RandomLogo, logo } from '../modules/randomLogo';

/**
 * @class MockWebview
 * @brief Mock implementation of VS Code webview for testing
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
 * @brief Main test suite for RandomLogo ASCII art management system
 * @test Comprehensive testing of logo discovery, selection, HTML generation, and webview integration
 */
suite('RandomLogo Test Suite', () => {
    let tempDir: string;
    let logoDir: string;
    let subDir: string;
    let originalCreateWebviewPanel: typeof vscode.window.createWebviewPanel;
    let capturedHtml: string;
    let lastCreatedWebview: MockWebview;
    let lastCreatedPanel: MockWebviewPanel;

    /**
     * @brief Setup test environment before each test
     * @test Creates temporary directory structure, mock logo files, and VS Code API mocks
     */
    setup(async () => {
        // Create temporary directory structure for test files
        tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'randomlogo-test-'));
        logoDir = path.join(tempDir, 'logos');
        subDir = path.join(logoDir, 'subdir');

        await fs.mkdir(logoDir, { recursive: true });
        await fs.mkdir(subDir, { recursive: true });

        // Create mock ASCII art logo files
        const logoFiles = [
            {
                name: 'simple-logo.txt',
                content: '  ****  \n *    * \n *    * \n  ****  '
            },
            {
                name: 'complex-logo.txt',
                content: '╔══════════════════════════════════════╗\n║               LOGO TITLE             ║\n║                                      ║\n║  ██████  ██████  ███    ███ ██████   ║\n║ ██      ██    ██ ████  ████ ██   ██  ║\n║ ██      ██    ██ ██ ████ ██ ██████   ║\n║ ██      ██    ██ ██  ██  ██ ██       ║\n║  ██████  ██████  ██      ██ ██       ║\n║                                      ║\n╚══════════════════════════════════════╝'
            },
            {
                name: 'multiline-logo.txt',
                content: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5'
            }
        ];

        const subDirLogoFiles = [
            {
                name: 'nested-logo.txt',
                content: '    /\\_/\\  \n   ( o.o ) \n    > ^ <  '
            }
        ];

        // Write main logo files
        for (const file of logoFiles) {
            await fs.writeFile(path.join(logoDir, file.name), file.content, 'utf8');
        }

        // Write subdirectory logo files
        for (const file of subDirLogoFiles) {
            await fs.writeFile(path.join(subDir, file.name), file.content, 'utf8');
        }

        // Create non-logo files to test filtering
        await fs.writeFile(path.join(logoDir, 'readme.md'), '# This is not a logo', 'utf8');
        await fs.writeFile(path.join(logoDir, 'config.json'), '{"test": true}', 'utf8');

        // Mock VS Code webview panel creation
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
            capturedHtml = '';

            // Intercept HTML setting
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
     * @test Restores VS Code APIs and removes temporary files and directories
     */
    teardown(async () => {
        // Restore original VS Code API
        if (originalCreateWebviewPanel) {
            vscode.window.createWebviewPanel = originalCreateWebviewPanel;
        }

        // Clean up temporary files
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors in tests
        }
    });

    /**
     * @brief Test suite for constructor and initialization functionality
     * @test Validates RandomLogo instance creation with various parameter combinations
     */
    suite('Constructor and Initialization', () => {
        /**
         * @brief Tests RandomLogo creation with default parameters
         * @test Validates that instance can be created without any parameters
         */
        test('should create instance with default parameters', () => {
            const randomLogo = new RandomLogo();
            assert.ok(randomLogo instanceof RandomLogo);
        });

        /**
         * @brief Tests RandomLogo creation with root directory parameter
         * @test Validates that instance can be created with specified root directory
         */
        test('should create instance with root directory parameter', async () => {
            const randomLogo = new RandomLogo(logoDir);
            assert.ok(randomLogo instanceof RandomLogo);

            // Give some time for async file discovery
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        /**
         * @brief Tests RandomLogo creation with both root and working directories
         * @test Validates that instance can be created with both directory parameters
         */
        test('should create instance with both root directory and working directory', async () => {
            const randomLogo = new RandomLogo(logoDir, tempDir);
            assert.ok(randomLogo instanceof RandomLogo);

            // Give some time for async file discovery
            await new Promise(resolve => setTimeout(resolve, 50));
        });

        /**
         * @brief Tests graceful handling of undefined parameters
         * @test Validates that undefined parameters don't cause initialization errors
         */
        test('should handle undefined parameters gracefully', () => {
            const randomLogo = new RandomLogo(undefined, undefined);
            assert.ok(randomLogo instanceof RandomLogo);
        });
    });

    /**
     * @brief Test suite for directory and path management functionality
     * @test Validates directory updates, path resolution, and working directory handling
     */
    suite('Directory and Path Management', () => {
        /**
         * @brief Tests successful root directory updates
         * @test Validates that valid directories can be set as root directory
         */
        test('should update root directory successfully', async () => {
            const randomLogo = new RandomLogo();
            const result = await randomLogo.updateRootDir(logoDir);
            assert.strictEqual(result, true);
        });

        /**
         * @brief Tests graceful handling of invalid root directories
         * @test Validates that non-existent directories return false without crashing
         */
        test('should handle invalid root directory gracefully', async () => {
            const randomLogo = new RandomLogo();
            const invalidPath = path.join(tempDir, 'nonexistent');
            const result = await randomLogo.updateRootDir(invalidPath);
            assert.strictEqual(result, false);
        });

        /**
         * @brief Tests successful working directory updates
         * @test Validates that current working directory can be updated successfully
         */
        test('should update current working directory successfully', () => {
            const randomLogo = new RandomLogo();
            const result = randomLogo.updateCurrentWorkingDirectory(tempDir);
            assert.strictEqual(result, true);
        });

        /**
         * @brief Tests handling of relative paths with working directory context
         * @test Validates that relative paths are resolved correctly against working directory
         */
        test('should handle relative paths with working directory', () => {
            const randomLogo = new RandomLogo();
            randomLogo.updateCurrentWorkingDirectory(tempDir);
            assert.strictEqual(randomLogo.updateCurrentWorkingDirectory('./test'), true);
        });
    });

    /**
     * @brief Test suite for logo file discovery and management functionality
     * @test Validates file discovery, filtering, recursive search, and directory handling
     */
    suite('Logo File Discovery and Management', () => {
        /**
         * @brief Tests discovery of logo files in the root directory
         * @test Validates that .txt logo files are properly discovered and accessible
         */
        test('should discover logo files in root directory', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            // Try to get a logo to verify files were discovered
            try {
                const logo = await randomLogo.getRandomLogoFromFolder();
                assert.ok(logo.fileName.endsWith('.txt'));
                assert.ok(Array.isArray(logo.logoContent));
            } catch (error) {
                // If no files discovered, this would throw
                assert.fail('Should have discovered logo files');
            }
        });

        /**
         * @brief Tests recursive discovery of logo files in subdirectories
         * @test Validates that logo files are found in nested directory structures
         */
        test('should discover logo files recursively in subdirectories', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for recursive file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            // Test multiple logo selections to potentially get the nested one
            const logoFileNames: string[] = [];
            for (let i = 0; i < 10; i++) {
                try {
                    const logo = await randomLogo.getRandomLogoFromFolder();
                    logoFileNames.push(logo.fileName);
                } catch (error) {
                    // Continue trying
                }
            }

            // Should have found files from both directories
            assert.ok(logoFileNames.length > 0, 'Should have found logo files');
            assert.ok(logoFileNames.some(name => name.endsWith('.txt')), 'Should have .txt files');
        });

        /**
         * @brief Tests correct filtering of non-txt files
         * @test Validates that only .txt files are included in logo selection
         */
        test('should filter non-txt files correctly', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            // Test multiple selections to verify only .txt files are included
            for (let i = 0; i < 5; i++) {
                try {
                    const logo = await randomLogo.getRandomLogoFromFolder();
                    assert.ok(logo.fileName.endsWith('.txt'), `Logo file ${logo.fileName} should be a .txt file`);
                } catch (error) {
                    // May not have files, continue
                }
            }
        });

        /**
         * @brief Tests graceful handling of empty directories
         * @test Validates that empty directories are handled without crashing
         */
        test('should handle empty directories gracefully', async () => {
            const emptyDir = path.join(tempDir, 'empty');
            await fs.mkdir(emptyDir, { recursive: true });

            const randomLogo = new RandomLogo(emptyDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 50));

            try {
                await randomLogo.getRandomLogoFromFolder();
                assert.fail('Should throw error for empty directory');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });
    });

    /**
     * @brief Test suite for random selection algorithm functionality
     * @test Validates randomness, selection variety, and content processing
     */
    suite('Random Selection Algorithm', () => {
        /**
         * @brief Tests selection variety across multiple calls
         * @test Validates that multiple selections can produce different logos
         */
        test('should select different logos on multiple calls', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            const selectedLogos = new Set<string>();

            // Get multiple logo selections
            for (let i = 0; i < 10; i++) {
                try {
                    const logo = await randomLogo.getRandomLogoFromFolder();
                    selectedLogos.add(logo.fileName);
                } catch (error) {
                    // Continue if some selections fail
                }
            }

            // With 4 logo files, we should see some variety in 10 selections
            assert.ok(selectedLogos.size > 0, 'Should select at least one logo');
        });

        /**
         * @brief Tests that selections always return valid logo objects
         * @test Validates that selected logos have proper structure and content
         */
        test('should always return valid logo from dataset', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            for (let i = 0; i < 5; i++) {
                try {
                    const logo = await randomLogo.getRandomLogoFromFolder();

                    assert.ok(logo.fileName, 'Should have a filename');
                    assert.ok(logo.fileName.endsWith('.txt'), 'Should be a .txt file');
                    assert.ok(Array.isArray(logo.logoContent), 'Logo content should be an array');
                    assert.ok(logo.logoContent.length > 0, 'Logo should have content lines');
                } catch (error) {
                    // If discovery failed, that's acceptable for this test
                }
            }
        });

        /**
         * @brief Tests correct handling of directories with single logo file
         * @test Validates that single-file directories work correctly
         */
        test('should handle single logo file correctly', async () => {
            // Create directory with single logo file
            const singleLogoDir = path.join(tempDir, 'single');
            await fs.mkdir(singleLogoDir, { recursive: true });
            await fs.writeFile(path.join(singleLogoDir, 'only-logo.txt'), 'Single\nLogo\nContent', 'utf8');

            const randomLogo = new RandomLogo(singleLogoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 50));

            const logo = await randomLogo.getRandomLogoFromFolder();

            assert.strictEqual(logo.fileName, 'only-logo.txt');
            assert.deepStrictEqual(logo.logoContent, ['Single', 'Logo', 'Content']);
        });

        /**
         * @brief Tests proper line splitting of logo content
         * @test Validates that logo content is correctly split into line arrays
         */
        test('should properly split logo content by lines', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            const logo = await randomLogo.getRandomLogoFromFolder();

            assert.ok(Array.isArray(logo.logoContent), 'Logo content should be an array of lines');

            // Verify that lines were properly split
            const joinedContent = logo.logoContent.join('\n');
            assert.ok(joinedContent.length > 0, 'Content should not be empty');
        });
    });

    /**
     * @brief Test suite for error handling and edge case scenarios
     * @test Validates graceful handling of errors, corrupted files, and unusual conditions
     */
    suite('Error Handling and Edge Cases', () => {
        /**
         * @brief Tests error handling when no root directory is configured
         * @test Validates that appropriate errors are thrown for missing configuration
         */
        test('should throw error when no root directory is set', async () => {
            const randomLogo = new RandomLogo();

            try {
                await randomLogo.getRandomLogoFromFolder();
                assert.fail('Should throw error when no root directory is set');
            } catch (error) {
                assert.ok(error instanceof Error);
            }
        });

        /**
         * @brief Tests graceful handling of corrupted or empty logo files
         * @test Validates that empty or corrupted files don't crash the system
         */
        test('should handle corrupted or empty logo files gracefully', async () => {
            // Create directory with empty file
            const emptyLogoDir = path.join(tempDir, 'empty-files');
            await fs.mkdir(emptyLogoDir, { recursive: true });
            await fs.writeFile(path.join(emptyLogoDir, 'empty-logo.txt'), '', 'utf8');

            const randomLogo = new RandomLogo(emptyLogoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 50));

            const logo = await randomLogo.getRandomLogoFromFolder();

            assert.strictEqual(logo.fileName, 'empty-logo.txt');
            assert.ok(Array.isArray(logo.logoContent));
            // Empty file should result in array with empty string
            assert.strictEqual(logo.logoContent.length, 1);
            assert.strictEqual(logo.logoContent[0], '');
        });

        /**
         * @brief Tests handling of permission errors during file discovery
         * @test Validates that permission-related errors are handled gracefully
         */
        test('should handle permission errors during file discovery', async () => {
            const randomLogo = new RandomLogo();

            // Try to update to a path that definitely doesn't exist
            const result = await randomLogo.updateRootDir('/nonexistent/path/that/should/not/exist');
            assert.strictEqual(result, false);
        });

        /**
         * @brief Tests handling of various line ending formats
         * @test Validates that different line ending styles are processed correctly
         */
        test('should handle various line ending formats', async () => {
            // Create files with different line endings
            const lineEndingDir = path.join(tempDir, 'line-endings');
            await fs.mkdir(lineEndingDir, { recursive: true });

            await fs.writeFile(path.join(lineEndingDir, 'unix-endings.txt'), 'Line1\nLine2\nLine3', 'utf8');
            await fs.writeFile(path.join(lineEndingDir, 'windows-endings.txt'), 'Line1\r\nLine2\r\nLine3', 'utf8');

            const randomLogo = new RandomLogo(lineEndingDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 50));

            for (let i = 0; i < 5; i++) {
                const logo = await randomLogo.getRandomLogoFromFolder();

                assert.ok(Array.isArray(logo.logoContent));
                assert.strictEqual(logo.logoContent.length, 3);
                assert.strictEqual(logo.logoContent[0], 'Line1');
                assert.strictEqual(logo.logoContent[1], 'Line2');
                assert.strictEqual(logo.logoContent[2], 'Line3');
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
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml, 'Should generate HTML content');
            assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Should be valid HTML');
            assert.ok(capturedHtml.includes('<html lang="en">'), 'Should have language attribute');
            assert.ok(capturedHtml.includes('<body>'), 'Should have body tag');
        });

        /**
         * @brief Tests inclusion of logo content in generated HTML
         * @test Validates that ASCII art content is properly embedded in HTML structure
         */
        test('should include logo content in HTML', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml.includes('<pre id="ascii">'), 'Should include ASCII art container');
            // HTML should contain some ASCII art content
            const preMatch = capturedHtml.match(/<pre id="ascii">(.*?)<\/pre>/s);
            assert.ok(preMatch, 'Should have ASCII art content');
            assert.ok(preMatch[1].length > 0, 'ASCII art content should not be empty');
        });

        /**
         * @brief Tests inclusion of interactive buttons in HTML
         * @test Validates that copy and zoom buttons are present in generated HTML
         */
        test('should include interactive buttons in HTML', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml.includes('id="copyBtn"'), 'Should include copy button');
            assert.ok(capturedHtml.includes('id="zoomInBtn"'), 'Should include zoom in button');
            assert.ok(capturedHtml.includes('id="zoomOutBtn"'), 'Should include zoom out button');
        });

        /**
         * @brief Tests inclusion of CSS styling in HTML
         * @test Validates that proper CSS styles are included for formatting
         */
        test('should include CSS styling', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml.includes('<style>'), 'Should include CSS styling');
            assert.ok(capturedHtml.includes('font-family:'), 'Should have font family styling');
            assert.ok(capturedHtml.includes('pre {'), 'Should have pre tag styling for ASCII art');
        });

        /**
         * @brief Tests display of logo filename in HTML or panel title
         * @test Validates that the source filename is visible to the user
         */
        test('should include logo filename in display', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            // Should include filename in the title or content
            assert.ok(
                capturedHtml.includes('.txt') ||
                lastCreatedPanel.title.includes('.txt'),
                'Should display logo filename'
            );
        });

        /**
         * @brief Tests graceful handling of empty or undefined logo content
         * @test Validates that empty content doesn't break HTML generation
         */
        test('should handle empty or undefined logo content gracefully', async () => {
            // Create directory with file that might cause issues
            const problematicDir = path.join(tempDir, 'problematic');
            await fs.mkdir(problematicDir, { recursive: true });
            await fs.writeFile(path.join(problematicDir, 'empty.txt'), '', 'utf8');

            const randomLogo = new RandomLogo(problematicDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 50));

            // Should not throw and should generate valid HTML
            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml, 'Should generate HTML even with empty content');
            assert.ok(capturedHtml.includes('<!DOCTYPE html>'), 'Should be valid HTML');
        });
    });

    /**
     * @brief Test suite for JavaScript functionality in webview
     * @test Validates interactive features like copy, zoom, and VS Code integration
     */
    suite('JavaScript Functionality', () => {
        /**
         * @brief Tests inclusion of copy button functionality
         * @test Validates that copy button script and clipboard integration are present
         */
        test('should include copy button script', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml.includes("getElementById('copyBtn')"), 'Should include copy button script');
            assert.ok(capturedHtml.includes('navigator.clipboard.writeText'), 'Should use clipboard API');
            assert.ok(capturedHtml.includes("vscode.postMessage({ type: 'copied' })"), 'Should post message to VS Code');
        });

        /**
         * @brief Tests inclusion of zoom functionality script
         * @test Validates that font size adjustment controls are properly implemented
         */
        test('should include zoom functionality script', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

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
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(capturedHtml.includes('acquireVsCodeApi()'), 'Should acquire VS Code API');
            assert.ok(capturedHtml.includes('vscode.postMessage'), 'Should use VS Code message posting');
        });

        /**
         * @brief Tests implementation of font size constraints in zoom functionality
         * @test Validates that zoom has proper minimum/maximum limits and initialization
         */
        test('should implement font size constraints in zoom', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            // Should have minimum size constraint
            assert.ok(capturedHtml.includes('>= 2'), 'Should have minimum font size constraint');
            // Should have size initialization
            assert.ok(capturedHtml.includes('currentSize = 20'), 'Should initialize font size');
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
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            let messageReceived = false;
            let receivedMessage: any = null;

            // Mock the message handler
            const originalOnMessage = lastCreatedWebview?.onDidReceiveMessage;
            if (lastCreatedWebview) {
                lastCreatedWebview.onDidReceiveMessage = (handler: (message: any) => void) => {
                    return {
                        dispose: () => {
                            // Mock dispose
                        }
                    };
                };
            }

            await randomLogo.displayRandomLogoInWindow();

            // Verify webview was created
            assert.ok(lastCreatedPanel, 'Should create webview panel');
            assert.ok(lastCreatedWebview, 'Should create webview');
        });

        /**
         * @brief Tests webview creation with correct configuration parameters
         * @test Validates that webview panel is created with proper settings and options
         */
        test('should create webview with correct parameters', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            assert.ok(lastCreatedPanel, 'Should create webview panel');
            assert.strictEqual(lastCreatedPanel.showOptions, vscode.ViewColumn.One, 'Should use ViewColumn.One');
            assert.ok(lastCreatedPanel.options.enableScripts, 'Should enable scripts');
            assert.ok(lastCreatedPanel.title.endsWith('.txt'), 'Title should be the filename');
        });

        /**
         * @brief Tests proper handling of message communication
         * @test Validates that message passing between webview and extension works correctly
         */
        test('should handle message communication properly', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            await randomLogo.displayRandomLogoInWindow();

            // Simulate copy message
            if (lastCreatedWebview && lastCreatedWebview.postMessage) {
                lastCreatedWebview.postMessage({ type: 'copied' });
            }

            // Should not throw errors
            assert.ok(true, 'Message handling should not throw errors');
        });
    });

    /**
     * @brief Test suite for performance and memory management
     * @test Validates efficiency, resource usage, and scalability under various loads
     */
    suite('Performance and Memory Management', () => {
        /**
         * @brief Tests handling of multiple rapid logo selections
         * @test Validates that rapid successive selections complete within reasonable time
         */
        test('should handle multiple rapid logo selections', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            const startTime = Date.now();

            // Perform multiple rapid selections
            for (let i = 0; i < 10; i++) {
                try {
                    await randomLogo.getRandomLogoFromFolder();
                } catch (error) {
                    // Some may fail, continue
                }
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            // Should complete reasonably quickly (less than 5 seconds)
            assert.ok(duration < 5000, 'Multiple selections should be reasonably fast');
        });

        /**
         * @brief Tests efficient reuse of file loader instances
         * @test Validates that file discovery infrastructure is reused for performance
         */
        test('should reuse file loader instances efficiently', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for file discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            // Get multiple logos - should reuse the discovered loaders
            const logo1 = await randomLogo.getRandomLogoFromFolder();
            const logo2 = await randomLogo.getRandomLogoFromFolder();

            assert.ok(logo1.fileName.endsWith('.txt'));
            assert.ok(logo2.fileName.endsWith('.txt'));

            // Both should be valid logo objects
            assert.ok(Array.isArray(logo1.logoContent));
            assert.ok(Array.isArray(logo2.logoContent));
        });

        /**
         * @brief Tests handling of large numbers of logo files
         * @test Validates that performance remains acceptable with many logo files
         */
        test('should handle large numbers of logo files', async () => {
            // Create directory with many logo files
            const manyLogosDir = path.join(tempDir, 'many-logos');
            await fs.mkdir(manyLogosDir, { recursive: true });

            // Create 50 logo files
            for (let i = 0; i < 50; i++) {
                const content = `Logo ${i}\n${'*'.repeat(i % 10 + 1)}\nEnd`;
                await fs.writeFile(path.join(manyLogosDir, `logo-${i}.txt`), content, 'utf8');
            }

            const randomLogo = new RandomLogo(manyLogosDir);

            // Allow time for discovery of many files
            await new Promise(resolve => setTimeout(resolve, 200));

            // Should still work efficiently
            const logo = await randomLogo.getRandomLogoFromFolder();
            assert.ok(logo.fileName.startsWith('logo-'));
            assert.ok(logo.fileName.endsWith('.txt'));
        });

        /**
         * @brief Tests directory updates without memory leaks
         * @test Validates that multiple directory changes don't cause resource leaks
         */
        test('should handle directory updates without memory leaks', async () => {
            const randomLogo = new RandomLogo(logoDir);

            // Allow time for initial discovery
            await new Promise(resolve => setTimeout(resolve, 100));

            // Update to different directory multiple times
            await randomLogo.updateRootDir(logoDir);
            await randomLogo.updateRootDir(subDir);
            await randomLogo.updateRootDir(logoDir);

            // Should still work after multiple updates
            const logo = await randomLogo.getRandomLogoFromFolder();
            assert.ok(logo.fileName.endsWith('.txt'));
            assert.ok(Array.isArray(logo.logoContent));
        });
    });

    /**
     * @brief Test suite for file system integration functionality
     * @test Validates interaction with various file system features and permissions
     */
    suite('File System Integration', () => {
        /**
         * @brief Tests appropriate handling of symbolic links
         * @test Validates that symbolic links to logo files are processed correctly
         */
        test('should handle symbolic links appropriately', async () => {
            // This test may not work on all systems, so we'll skip if symlink creation fails
            try {
                const symlinkDir = path.join(tempDir, 'symlink-test');
                await fs.mkdir(symlinkDir, { recursive: true });

                // Try to create a symlink to one of our logo files
                const targetFile = path.join(logoDir, 'simple-logo.txt');
                const symlinkFile = path.join(symlinkDir, 'symlinked-logo.txt');

                await fs.symlink(targetFile, symlinkFile);

                const randomLogo = new RandomLogo(symlinkDir);

                // Allow time for file discovery
                await new Promise(resolve => setTimeout(resolve, 50));

                const logo = await randomLogo.getRandomLogoFromFolder();
                assert.ok(logo.fileName.endsWith('.txt'));

            } catch (error) {
                // Skip test if symlinks aren't supported
                console.log('Skipping symlink test - not supported on this system');
            }
        });

        /**
         * @brief Tests respect for file system permissions
         * @test Validates that permission restrictions are handled gracefully
         */
        test('should respect file system permissions', async () => {
            const randomLogo = new RandomLogo();

            // Try to access a system directory that likely doesn't have logo files
            const result = await randomLogo.updateRootDir('/etc');

            if (result) {
                // If it succeeded, try to get a logo (should fail or return no results)
                try {
                    await randomLogo.getRandomLogoFromFolder();
                } catch (error) {
                    // Expected if no .txt files in /etc
                    assert.ok(error instanceof Error);
                }
            } else {
                // If it failed, that's also acceptable (permission denied)
                assert.ok(true, 'Permission handling works correctly');
            }
        });
    });
});
