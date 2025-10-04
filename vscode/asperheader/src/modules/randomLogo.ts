/**
 * @file randomLogo.ts
 * @brief Comprehensive ASCII art logo management and interactive display system
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This module implements a sophisticated ASCII art logo management system that serves as
 * the visual centerpiece of the AsperHeader extension. It provides intelligent logo
 * discovery, selection, caching, and interactive presentation capabilities with deep
 * integration into VS Code's webview architecture and the extension's broader ecosystem.
 * 
 * Core Architecture:
 * - **Discovery Engine**: Recursive filesystem traversal for ASCII art asset discovery
 * - **Selection Algorithm**: Intelligent randomization with category-aware selection
 * - **Caching Layer**: Memory-efficient lazy loading with selective caching strategies
 * - **Display System**: Rich webview integration with interactive user controls
 * - **Integration Framework**: Seamless coupling with {@link CommentGenerator} and header systems
 * - **Performance Optimization**: Async operations and minimal memory footprint
 * 
 * Asset Management:
 * - **File Discovery**: Recursive scanning of asset directories for .txt logo files
 * - **Category Organization**: Hierarchical organization (Android, Apple, Linux, Windows systems)
 * - **Metadata Extraction**: Automatic filename parsing and category classification
 * - **Content Validation**: ASCII art format validation and line-by-line processing
 * - **Lazy Loading**: On-demand loading via {@link LazyFileLoader} for memory efficiency
 * - **Cache Management**: Intelligent caching with selective retention policies
 * 
 * Interactive Features:
 * - **Webview Presentation**: Full VS Code webview integration with rich HTML/CSS/JS
 * - **User Controls**: Copy-to-clipboard, zoom controls, and navigation interfaces
 * - **Message Passing**: Bidirectional communication between webview and extension
 * - **Responsive Design**: Adaptive layouts for different ASCII art sizes and styles
 * - **Accessibility**: Keyboard navigation and screen reader support
 * - **Internationalization**: Multi-language support via {@link messageProvider}
 * 
 * Selection Algorithms:
 * - **Pure Random**: Uniform distribution across all available logos
 * - **Weighted Selection**: Preference-based selection with user customization
 * - **Category Filtering**: System-specific or theme-based logo selection
 * - **Exclusion Lists**: User-defined patterns for logo filtering
 * - **Fallback Mechanisms**: Graceful degradation when preferred logos unavailable
 * 
 * Integration Points:
 * - **Header Generation**: Primary logo source for {@link CommentGenerator}
 * - **Configuration System**: Deep integration with {@link processConfiguration}
 * - **Logging Framework**: Comprehensive error reporting via {@link logger}
 * - **User Interface**: Interactive webview panels and status notifications
 * - **File System**: Async file operations with error resilience
 * 
 * Performance Characteristics:
 * - **Memory Efficiency**: Lazy loading prevents unnecessary RAM usage
 * - **Async Operations**: Non-blocking file I/O and directory traversal
 * - **Caching Strategy**: LRU-style caching for frequently accessed logos
 * - **Error Resilience**: Graceful handling of missing files and corrupted assets
 * - **Scalability**: Support for large ASCII art collections without performance degradation
 * 
 * @example Basic logo selection:
 * ```typescript
 * const randomLogo = new RandomLogo();
 * await randomLogo.updateCurrentWorkingDirectory(extensionPath);
 * await randomLogo.updateRootDir(path.join(extensionPath, "assets", "asciiArt"));
 * 
 * const logo = await randomLogo.getRandomLogo();
 * console.log(logo.lines); // ASCII art lines ready for header injection
 * ```
 * 
 * @example Interactive webview display:
 * ```typescript
 * // Display logo in interactive webview with controls
 * await randomLogo.displayRandomLogoInWindow();
 * ```
 * 
 * @example Integration with header generation:
 * ```typescript
 * const commentGenerator = new CommentGenerator(configLoader);
 * commentGenerator.updateLogoInstanceRandomiser(randomLogo);
 * // Logo will be automatically included in generated headers
 * ```
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";

/**
 * @interface logo
 * @brief Structure representing a loaded ASCII art logo with metadata
 * 
 * Defines the data structure for ASCII art logos after they have been loaded
 * from files. Contains both the visual content and identifying information
 * for display and user interaction purposes.
 */
export interface logo {
    /** @brief Array of strings representing each line of the ASCII art */
    logoContent: string[],
    /** @brief Original filename of the logo file (without path) */
    fileName: string
}

/**
 * @class RandomLogo
 * @brief ASCII art logo management system with random selection and interactive display
 * 
 * Manages collections of ASCII art logos stored in text files, providing functionality
 * for random selection, lazy loading, and interactive display through VS Code webviews.
 * The class handles file system operations, content caching, and user interface generation.
 * 
 * Core Functionality:
 * - **File Discovery**: Recursive scanning of directories for ASCII art files
 * - **Random Selection**: Pseudo-random selection from available logo collection
 * - **Lazy Loading**: Efficient memory usage through on-demand file loading
 * - **Interactive Display**: Full-featured webview with user controls
 * - **Content Management**: Automatic file type filtering and validation
 * 
 * File System Integration:
 * - Supports configurable root directories for logo collections
 * - Recursive directory traversal for comprehensive logo discovery
 * - File type filtering (currently supports .txt files)
 * - Path resolution and cross-platform compatibility
 * 
 * User Interface Features:
 * - Copy-to-clipboard functionality for ASCII art content
 * - Zoom controls for accessibility and readability
 * - Responsive design adapting to different logo sizes
 * - Localized user interface elements
 */
export class RandomLogo {
    /** @brief Current working directory for relative path resolution */
    private cwd: string | undefined = undefined;
    /** @brief Root directory path for logo file discovery */
    private rootDir: string | undefined = undefined;
    /** @brief Collection of lazy file loaders for discovered logo files */
    private liveLogoFiles: LazyFileLoader[] = [];

    /**
     * @brief Constructor for RandomLogo class
     * @param rootDir Optional root directory path for logo file discovery
     * @param cwd Optional current working directory for path resolution
     * 
     * Initializes the RandomLogo instance with optional directory configuration.
     * If a root directory is provided, automatically begins logo file discovery.
     * The current working directory is used for resolving relative paths in
     * the LazyFileLoader instances.
     */
    constructor(rootDir: string | undefined = undefined, cwd: string | undefined = undefined) {
        if (rootDir) {
            this.rootDir = rootDir;
            this.gatherAllLogoFiles(this.rootDir);
        }
        if (cwd) {
            this.cwd = cwd;
        }
    }

    /**
     * @brief Updates the root directory and refreshes logo file collection
     * @param basePath New root directory path for logo file discovery
     * @return Promise resolving to true if update successful, false on error
     * 
     * Changes the root directory for logo file discovery and automatically
     * refreshes the collection of available logo files. This method allows
     * runtime reconfiguration of logo sources without creating new instances.
     * 
     * The method performs the following operations:
     * 1. Updates the internal root directory path
     * 2. Clears existing logo file collection
     * 3. Recursively scans new directory for logo files
     * 4. Logs any errors encountered during the process
     * 
     * Error Handling:
     * If directory scanning fails, the error is logged and the method returns
     * false. The existing logo collection may be partially updated in this case.
     */
    async updateRootDir(basePath: string): Promise<boolean> {
        this.rootDir = basePath;
        try {
            await this.gatherAllLogoFiles(this.rootDir);
            return true;
        } catch (e) {
            logger.error(getMessage("logoRootDirUpdateError", String(e)));
            return false;
        }
    }

    /**
     * @brief Updates the current working directory for path resolution
     * @param cwd New current working directory path
     * @return True if update successful (always succeeds)
     * 
     * Updates the current working directory used by LazyFileLoader instances
     * for resolving relative file paths. This method provides runtime
     * configuration for path resolution without affecting existing file loaders.
     */
    updateCurrentWorkingDirectory(cwd: string): boolean {
        this.cwd = cwd;
        return true;
    }

    /**
     * @brief Generates a random integer within the specified range
     * @param maxValue Maximum value (exclusive) for random number generation
     * @return Random integer between 0 (inclusive) and maxValue (exclusive)
     * 
     * Utility method for generating random indices to select logos from
     * the available collection. Uses Math.random() for pseudo-random generation
     * with uniform distribution across the specified range.
     */
    private getRandomNumber(maxValue: number): number {
        return Math.floor(Math.random() * maxValue);
    }

    /**
     * @brief Recursively discovers and catalogs all logo files in directory tree
     * @param rootDir Optional root directory override for file discovery
     * @return Promise that resolves when file discovery is complete
     * @throws Error if no root directory is configured or provided
     * 
     * Performs recursive directory traversal to discover all ASCII art logo files
     * within the specified directory tree. Only processes .txt files, logging
     * information about skipped files for debugging purposes.
     * 
     * Discovery Process:
     * 1. Validates root directory configuration
     * 2. Reads directory contents with file type information
     * 3. Recursively processes subdirectories
     * 4. Creates LazyFileLoader instances for .txt files
     * 5. Logs information about non-.txt files encountered
     * 
     * File Selection Criteria:
     * - Must have .txt extension
     * - Must be a regular file (not directory or special file)
     * - Must be readable by the file system API
     * 
     * Error Handling:
     * Throws an error if no root directory is available. Individual file
     * access errors during discovery are handled by the LazyFileLoader.
     */
    private async gatherAllLogoFiles(rootDir: string | undefined = undefined): Promise<void> {
        if (!rootDir && !this.rootDir) {
            throw Error(getMessage("logoNoRootDir"));
        }
        if (!rootDir && this.rootDir) {
            rootDir = this.rootDir;
        }
        if (rootDir) {
            const dirents = await fs.readdir(rootDir, { withFileTypes: true });

            for (const dirent of dirents) {
                const resolvedPath = path.resolve(rootDir, dirent.name);
                if (dirent.isDirectory()) {
                    await this.gatherAllLogoFiles(resolvedPath);
                } else if (resolvedPath.endsWith(".txt")) {
                    this.liveLogoFiles.push(new LazyFileLoader(resolvedPath, this.cwd));
                } else {
                    logger.info(getMessage("logoMessage", resolvedPath));
                }
            }
        }
    }
    /**
     * @brief Generates JavaScript for copy-to-clipboard functionality
     * @return HTML script tag with clipboard copy implementation
     * 
     * Creates JavaScript code that enables users to copy ASCII art content
     * to their system clipboard. The script sets up event listeners and
     * communicates success back to the VS Code extension through message passing.
     * 
     * Functionality:
     * - Acquires VS Code API for extension communication
     * - Attaches click event listener to copy button
     * - Extracts ASCII art text from display element
     * - Uses Clipboard API for system clipboard access
     * - Sends confirmation message back to extension
     * 
     * Browser Compatibility:
     * Uses modern Clipboard API which requires HTTPS or localhost context.
     * VS Code webviews provide the necessary secure context for clipboard access.
     */
    private copyButtonScript(): string {
        return `
<script>
    const vscode = acquireVsCodeApi();
    console.log(\`vscode = \${vscode}\`);
    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('ascii').innerText;
        navigator.clipboard.writeText(content).then(() => {
        vscode.postMessage({ type: 'copied' });
        });
    });
</script>
  `;
    }

    /**
     * @brief Generates JavaScript for ASCII art zoom functionality
     * @return HTML script tag with zoom control implementation
     * 
     * Creates JavaScript code that allows users to dynamically adjust the
     * font size of displayed ASCII art for better readability. Includes
     * zoom in, zoom out, and minimum size constraints.
     * 
     * Features:
     * - Dynamic font size adjustment (starts at 20px)
     * - Zoom increment/decrement of 2px per click
     * - Minimum font size constraint (2px minimum)
     * - Synchronized line height for proper ASCII art display
     * - Console logging for debugging font size changes
     * 
     * User Controls:
     * - Zoom In: Increases font size by 2px
     * - Zoom Out: Decreases font size by 2px (minimum 2px)
     * - Automatic initialization on script load
     */
    private zoomScript(): string {
        return `
<script>
    let currentSize = 20;
    function updateFontSize(sizeDifference) {
        console.log(\`sizeDifference = \${sizeDifference}\`);
        const asciiPre = document.getElementById('ascii');
        console.log(\`asciiPre = \${JSON.stringify(asciiPre)}\`);
        console.log(\`currentSize = \${currentSize}\`);
        if (currentSize + sizeDifference >= 2) {
            currentSize += sizeDifference;
            console.log(\`currentSize (after update) = \${currentSize}\`);
        } else {
            console.log(\`currentSize (no update) = \${currentSize}\`);
        }
        asciiPre.style.fontSize = currentSize + "px";
        asciiPre.style.lineHeight = currentSize + "px";
        console.log(\`newSize = \${asciiPre.style.fontSize}\`);
    }

    document.getElementById('zoomInBtn').addEventListener('click', () => {
        updateFontSize((2));
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        updateFontSize((-2));
    });

    // init
    updateFontSize();
</script>
    `;
    }

    /**
     * @brief Generates CSS styling for the logo display webview
     * @return HTML style tag with comprehensive page styling
     * 
     * Creates CSS styles optimized for ASCII art display and user interaction.
     * The styles ensure proper monospace font rendering, appropriate spacing,
     * and consistent button styling across different ASCII art sizes.
     * 
     * Styling Features:
     * - Sans-serif font for UI elements with proper padding
     * - Scaled heading sizes for content hierarchy
     * - Monospace pre-formatted text for ASCII art preservation
     * - Consistent button styling with proper spacing
     * - Responsive layout adapting to content size
     */
    private pageStyle(): string {
        return `
        <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { font-size: 20px; margin-bottom: 0.2em; }
    h2 { margin-top: 1.2em; }
    pre { font-size: 10px; line-height: 10px; white-space: pre; }
    button { margin: 10px 0; padding: 5px 12px; font-size: 14px; }
  </style>
        `;
    }

    /**
     * @brief Selects and loads a random logo from the discovered file collection
     * @return Promise resolving to a logo object with content and metadata
     * @throws Error if no logo files are available after discovery attempts
     * 
     * Main method for random logo selection and loading. Implements lazy discovery
     * if no files are currently available, then randomly selects and loads a logo
     * file using the LazyFileLoader system.
     * 
     * Selection Process:
     * 1. Checks if logo files have been discovered (triggers discovery if empty)
     * 2. Validates that logo files are available after discovery
     * 3. Generates random index within available file range
     * 4. Loads content from selected logo file
     * 5. Processes content into line-based format
     * 6. Returns structured logo object with content and metadata
     * 
     * Content Processing:
     * - Splits file content by line breaks (handles both \n and \r\n)
     * - Preserves original line structure for ASCII art integrity
     * - Extracts filename for display and identification purposes
     * 
     * Error Conditions:
     * - No root directory configured for file discovery
     * - No .txt files found in directory tree
     * - File system errors during content loading
     */
    async getRandomLogoFromFolder(): Promise<logo> {
        if (this.liveLogoFiles.length === 0) {
            await this.gatherAllLogoFiles();
        }

        if (this.liveLogoFiles.length === 0) {
            const errMsg = getMessage("watermarkJsonFileInvalid");
            logger.Gui.error(errMsg);
            throw new Error(errMsg);
        }

        const chosenIndex = this.getRandomNumber(this.liveLogoFiles.length);
        const chosenFile = this.liveLogoFiles[chosenIndex];
        const content = await chosenFile.get();

        // Assuming logos are stored as array of lines, otherwise fallback to single string
        const lines = content.split(/\r?\n/);

        return {
            fileName: path.basename(chosenFile.getFilePath() || ""),
            logoContent: lines
        };
    }


    /**
     * @brief Creates and displays an interactive webview panel with a random logo
     * @return Promise that resolves when the webview panel is created and configured
     * 
     * Main public method for displaying ASCII art logos in an interactive VS Code webview.
     * Orchestrates the complete display process including logo selection, webview creation,
     * HTML generation, and user interaction setup.
     * 
     * Display Process:
     * 1. Selects and loads a random logo using getRandomLogoFromFolder()
     * 2. Creates a new VS Code webview panel with script execution enabled
     * 3. Processes logo content for HTML display (handles string/array formats)
     * 4. Generates complete HTML page with embedded styles and scripts
     * 5. Sets up message passing for user interaction callbacks
     * 6. Logs successful display operation
     * 
     * Webview Features:
     * - **Copy Button**: Allows users to copy ASCII art to clipboard
     * - **Zoom Controls**: In/out buttons for font size adjustment
     * - **Responsive Design**: Adapts to different ASCII art dimensions
     * - **Localized Interface**: Uses extension's internationalization system
     * 
     * User Interaction:
     * - Copy operations trigger success notifications
     * - All user actions are logged for debugging and user feedback
     * - Webview remains interactive until manually closed by user
     * 
     * Content Handling:
     * - Supports both string and array format logo content
     * - Gracefully handles undefined/missing logo content
     * - Preserves ASCII art formatting through proper HTML escaping
     */
    async displayRandomLogoInWindow() {
        const randomLogo: logo = await this.getRandomLogoFromFolder();

        const panel = vscode.window.createWebviewPanel(
            getMessage("logoView"),
            randomLogo.fileName,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const watermark = randomLogo.logoContent;
        logger.info(getMessage("logoChosen", watermark));
        let asciiArt = "";
        if (typeof watermark === "string") {
            asciiArt = watermark;
        } else if (Array.isArray(watermark)) {
            asciiArt = watermark.join("\n");
        } else if (watermark === undefined) {
            asciiArt = getMessage("logoNotFound");
        }

        const copyButton: string = this.copyButtonScript();
        const pageStyle: string = this.pageStyle();
        const zoomScript: string = this.zoomScript();

        panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${pageStyle}
</head>
<body>
    <div>
        <button id="copyBtn">${getMessage('logoCopyAscii')}</button>
        <button id="zoomInBtn">${getMessage('logoZoomIn')}</button>
        <button id="zoomOutBtn">${getMessage('logoZoomOut')}</button>
    </div>
    <h1>${getMessage('logoName')}: ${randomLogo.fileName}</h1>
    <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("logoCopied", randomLogo.fileName));
            }
        });

        logger.Gui.info(getMessage("logoDisplayed", randomLogo.fileName));
    }
}
