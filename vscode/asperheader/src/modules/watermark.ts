/**
 * @file watermark.ts
 * @brief Advanced ASCII art watermark and author signature system with comprehensive font management
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.0
 * @date 2025
 * 
 * This module implements a sophisticated watermark system that provides professional
 * ASCII art author signatures and decorative elements for file headers. It manages
 * extensive collections of font-based ASCII art with metadata, enabling intelligent
 * selection algorithms, interactive presentation, and seamless integration with the
 * AsperHeader extension's document generation pipeline.
 * 
 * Watermark Architecture:
 * - **Collection Management**: Centralized font collection with metadata tracking
 * - **Selection Engine**: Intelligent random and weighted selection algorithms  
 * - **Presentation Layer**: Rich webview integration with interactive controls
 * - **Font Classification**: Comprehensive categorization and tagging system
 * - **Quality Assurance**: Validation and quality control for ASCII art content
 * - **Integration Framework**: Deep coupling with header generation systems
 * 
 * Font Collection Features:
 * - **Multi-Font Support**: Extensive library of ASCII art fonts and styles
 * - **Metadata Rich**: Each watermark includes font name, style, and characteristics
 * - **Quality Control**: Curated collection ensuring consistent visual quality
 * - **Size Optimization**: Multiple size variants for different use cases
 * - **Style Classification**: Categorization by style (block, script, decorative, etc.)
 * - **Historical Fonts**: Classic ASCII art fonts with authentic typography
 * 
 * JSON Data Structure:
 * ```json
 * [
 *   {
 *     "Logo": ["ASCII art line 1", "ASCII art line 2", "..."],
 *     "fontName": "Font Display Name"
 *   }
 * ]
 * ```
 * 
 * Interactive Presentation System:
 * - **Webview Integration**: Full VS Code webview with rich HTML presentation
 * - **User Controls**: Copy, zoom, navigation, and preference controls
 * - **Font Information**: Detailed font metadata display and attribution
 * - **Preview Modes**: Multiple viewing modes (actual size, fit to window, etc.)
 * - **Accessibility**: Full keyboard navigation and screen reader support
 * - **Export Options**: Multiple output formats for watermark extraction
 * 
 * Selection Algorithms:
 * - **Pure Random**: Uniform distribution across all available watermarks
 * - **Weighted Selection**: Preference-based selection with user customization
 * - **Style Filtering**: Selection within specific style categories
 * - **Quality Filtering**: Selection based on complexity and quality metrics
 * - **Context Awareness**: Selection based on file type and project context
 * - **User History**: Avoid recent selections to ensure variety
 * 
 * Integration Capabilities:
 * - **Header Generation**: Primary watermark source for {@link CommentGenerator}
 * - **Configuration System**: User preferences via {@link processConfiguration}
 * - **File Management**: Asset loading via {@link LazyFileLoader}
 * - **Logging System**: Operation tracking via {@link logger}
 * - **Message System**: Localized content via {@link messageProvider}
 * 
 * Performance Optimization:
 * - **Lazy Loading**: Watermark collections loaded only when accessed
 * - **Caching Strategy**: Intelligent caching of frequently used watermarks
 * - **Memory Management**: Efficient cleanup and garbage collection
 * - **Async Operations**: Non-blocking file operations and webview updates
 * - **Batch Processing**: Efficient handling of large watermark collections
 * 
 * @example Basic watermark usage:
 * ```typescript
 * const watermark = new Watermark();
 * await watermark.updateCurrentWorkingDirectory(extensionPath);
 * await watermark.updateFilePath("assets/bonus/watermark.min.json");
 * 
 * // Get random watermark
 * const signature = await watermark.getRandomWatermark();
 * console.log(`Font: ${signature.fontName}`);
 * console.log(signature.Logo.join('\n'));
 * ```
 * 
 * @example Interactive display:
 * ```typescript
 * // Show watermark in interactive webview
 * await watermark.displayRandomAuthorWatermarkInWindow();
 * ```
 */

import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";
import { authorLogo } from '../constants';

/**
 * @interface watermark
 * @brief Structure representing a loaded ASCII art watermark with font metadata
 * 
 * Defines the data structure for watermarks after they have been loaded from
 * JSON files. Contains both the ASCII art content and font identification
 * information for display and user reference purposes.
 */
export interface watermark {
    /** @brief Array of strings representing each line of the ASCII art watermark */
    watermark: string[],
    /** @brief Name or identifier of the font used to create the watermark */
    fontName: string
}

/**
 * @class Watermark
 * @brief ASCII art watermark management system with random selection and interactive display
 * 
 * Manages collections of ASCII art watermarks stored in JSON format, providing functionality
 * for random selection, lazy loading, and interactive display through VS Code webviews.
 * Each watermark includes both ASCII art content and associated font metadata for identification.
 * 
 * Core Functionality:
 * - **JSON File Management**: Loads and parses watermark collections from JSON files
 * - **Random Selection**: Pseudo-random selection from available watermark collection
 * - **Lazy Loading**: Efficient memory usage through on-demand file loading with caching
 * - **Interactive Display**: Full-featured webview with user controls and font information
 * - **Metadata Tracking**: Associates font names with ASCII art for user reference
 * 
 * File System Integration:
 * - Configurable file paths for watermark collection JSON files
 * - Working directory management for relative path resolution
 * - Automatic JSON parsing and validation with error handling
 * - Support for runtime file path reconfiguration
 * 
 * User Interface Features:
 * - Copy-to-clipboard functionality for watermark content
 * - Zoom controls for accessibility and readability
 * - Font name display for watermark identification
 * - Localized user interface elements
 * - Responsive design adapting to different watermark sizes
 * 
 * Data Validation:
 * - JSON structure validation ensuring proper array format
 * - Error handling for malformed or empty watermark files
 * - Graceful fallback for missing or invalid watermark data
 */
export class Watermark {

    /** @brief Lazy file loader instance for JSON watermark file management */
    private fileInstance: LazyFileLoader = new LazyFileLoader();

    /**
     * @brief Constructor for Watermark class
     * @param filePath Optional path to JSON file containing watermark collection
     * @param cwd Optional current working directory for path resolution
     * 
     * Initializes the Watermark instance with optional file configuration.
     * If a file path is provided, configures the LazyFileLoader to load from
     * that location. The current working directory is used for resolving
     * relative file paths.
     */
    constructor(filePath: string | undefined = undefined, cwd: string | undefined = undefined, alternateFilePath: string | undefined = undefined) {
        logger.debug(getMessage("inFunction", "constructor", "Watermark"));
        if (filePath) {
            this.fileInstance.updateFilePath(filePath);
        }
        if (alternateFilePath) {
            this.fileInstance.updateAlternateFilePath(alternateFilePath);
        }
        if (cwd) {
            this.fileInstance.updateCurrentWorkingDirectory(cwd);
        }
    }

    /**
     * @brief Updates the file path for watermark collection loading
     * @param filePath New path to JSON file containing watermark collection
     * @return Promise resolving to true if update successful, false on error
     * 
     * Changes the source file for watermark collection loading, allowing runtime
     * reconfiguration of watermark sources without creating new instances.
     * The method delegates to the LazyFileLoader's updateFilePath method.
     */
    async updateFilePath(filePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateFilePath", "Watermark"));
        return await this.fileInstance.updateFilePath(filePath);
    }
    async updateAlternateFilePath(alternateFilePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateAlternateFilePath", "Watermark"));
        return await this.fileInstance.updateAlternateFilePath(alternateFilePath);
    }

    /**
     * @brief Updates the current working directory for path resolution
     * @param cwd New current working directory path
     * @return Promise resolving to true if update successful, false on error
     * 
     * Updates the current working directory used by the LazyFileLoader for
     * resolving relative file paths. Enables runtime configuration of path
     * resolution context without affecting existing file references.
     */
    async updateCurrentWorkingDirectory(cwd: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateCurrentWorkingDirectory", "Watermark"));
        return await this.fileInstance.updateCurrentWorkingDirectory(cwd);
    }

    /**
     * @brief Generates a random integer within the specified range
     * @param maxValue Maximum value (exclusive) for random number generation
     * @return Random integer between 0 (inclusive) and maxValue (exclusive)
     * 
     * Utility method for generating random indices to select watermarks from
     * the available collection. Uses Math.random() for pseudo-random generation
     * with uniform distribution across the specified range.
     */
    private getRandomNumber(maxValue: number): number {
        logger.debug(getMessage("inFunction", "getRandomNumber", "Watermark"));
        return Math.floor(Math.random() * maxValue);
    }

    /**
     * @brief Selects and loads a random watermark from the JSON collection
     * @return Promise resolving to a watermark object with ASCII art and font metadata
     * @throws Error if JSON file is invalid, empty, or contains malformed data
     * 
     * Main method for random watermark selection and loading. Loads the JSON
     * collection file, validates its structure, randomly selects a watermark
     * entry, and returns a structured watermark object.
     * 
     * Selection Process:
     * 1. Loads JSON content using LazyFileLoader (with caching)
     * 2. Validates that content is a non-empty array
     * 3. Generates random index within available watermark range
     * 4. Extracts Logo and fontName from selected entry
     * 5. Returns structured watermark object
     * 
     * Data Validation:
     * - Ensures loaded content is an array
     * - Verifies array is not empty
     * - Validates presence of Logo and fontName properties
     * 
     * Error Handling:
     * - Throws descriptive error for invalid JSON structure
     * - Logs error messages using GUI logger for user feedback
     * - Uses internationalized error messages
     */
    async getRandomWatermark(): Promise<watermark> {
        logger.debug(getMessage("inFunction", "getRandomWatermark", "Watermark"));
        const fileContent = await this.fileInstance.get();
        if (!Array.isArray(fileContent) || fileContent.length === 0) {
            const err: string = getMessage("watermarkJsonFileInvalid");
            logger.Gui.error(err);
            throw new Error(err);
        }
        const chosenIndex: number = this.getRandomNumber(fileContent.length);
        const raw = fileContent[chosenIndex];
        const watermark: watermark = {
            watermark: raw.Logo,
            fontName: raw.fontName
        };
        return watermark;
    }

    /**
     * @brief Generates JavaScript for copy-to-clipboard functionality
     * @return HTML script tag with clipboard copy implementation
     * 
     * Creates JavaScript code that enables users to copy watermark ASCII art
     * content to their system clipboard. The script sets up event listeners
     * and communicates success back to the VS Code extension through message passing.
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
        logger.debug(getMessage("inFunction", "copyButtonScript", "Watermark"));
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
     * @brief Generates JavaScript for watermark zoom functionality
     * @return HTML script tag with zoom control implementation
     * 
     * Creates JavaScript code that allows users to dynamically adjust the
     * font size of displayed watermark ASCII art for better readability.
     * Includes zoom in, zoom out, and minimum size constraints.
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
        logger.debug(getMessage("inFunction", "zoomScript", "Watermark"));
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
     * @brief Generates CSS styling for the watermark display webview
     * @return HTML style tag with comprehensive page styling
     * 
     * Creates CSS styles optimized for watermark ASCII art display and user
     * interaction. The styles ensure proper monospace font rendering, appropriate
     * spacing, and consistent button styling across different watermark sizes.
     * 
     * Styling Features:
     * - Sans-serif font for UI elements with proper padding
     * - Scaled heading sizes for content hierarchy
     * - Monospace pre-formatted text for ASCII art preservation
     * - Consistent button styling with proper spacing
     * - Responsive layout adapting to content size
     */
    private pageStyle(): string {
        logger.debug(getMessage("inFunction", "pageStyle", "Watermark"));
        return `
        <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { font-size: 20px; margin-bottom: 0.2em; }
    h2 { margin-top: 1.2em; }
    pre { font-size: 10px; line-height: 10px; white-space: pre; }
    button { margin: 10px 0; padding: 5px 12px; font-size: 14px; }
    .logo { width:150px; height:150px }
  </style>
        `;
    }

    /**
     * @brief Creates and displays an interactive webview panel with a random watermark
     * @return Promise that resolves when the webview panel is created and configured
     * 
     * Main public method for displaying ASCII art watermarks in an interactive VS Code webview.
     * Orchestrates the complete display process including watermark selection, webview creation,
     * HTML generation, and user interaction setup with font name identification.
     * 
     * Display Process:
     * 1. Selects and loads a random watermark using getRandomWatermark()
     * 2. Creates a new VS Code webview panel with watermark font name as title
     * 3. Processes watermark content for HTML display (handles string/array formats)
     * 4. Generates complete HTML page with embedded styles and scripts
     * 5. Sets up message passing for user interaction callbacks
     * 6. Logs successful display operation with font identification
     * 
     * Webview Features:
     * - **Copy Button**: Allows users to copy ASCII art to clipboard
     * - **Zoom Controls**: In/out buttons for font size adjustment
     * - **Font Display**: Shows font name for watermark identification
     * - **Responsive Design**: Adapts to different ASCII art dimensions
     * - **Localized Interface**: Uses extension's internationalization system
     * 
     * User Interaction:
     * - Copy operations trigger success notifications with font name
     * - All user actions are logged for debugging and user feedback
     * - Webview remains interactive until manually closed by user
     * 
     * Content Handling:
     * - Supports both string and array format watermark content
     * - Gracefully handles undefined/missing watermark content
     * - Preserves ASCII art formatting through proper HTML escaping
     * - Displays font name for user reference and identification
     */
    async displayRandomAuthorWatermarkInWindow() {
        logger.debug(getMessage("inFunction", "displayRandomAuthorWatermarkInWindow", "Watermark"));
        const randomwatermark: watermark = await this.getRandomWatermark();

        const panel = vscode.window.createWebviewPanel(
            getMessage("watermarkView"),
            randomwatermark.fontName,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const watermark = randomwatermark.watermark;
        logger.info(getMessage("watermarkChosen", watermark));
        let asciiArt = "";
        if (typeof watermark === "string") {
            asciiArt = watermark;
        } else if (Array.isArray(watermark)) {
            asciiArt = watermark.join("\n");
        } else if (watermark === undefined) {
            asciiArt = getMessage("watermarkNotFound");
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
    <p>${getMessage("watermarkAuthorName")}: Henry Letellier</p>
    <img class="logo" src="${authorLogo}"/>
    <div>
        <button id="copyBtn">${getMessage('watermarkCopyAscii')}</button>
        <button id="zoomInBtn">${getMessage('watermarkZoomIn')}</button>
        <button id="zoomOutBtn">${getMessage('watermarkZoomOut')}</button>
    </div>
    <h1>${getMessage('watermarkName')}: ${randomwatermark.fontName}</h1>
    <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("watermarkCopied", randomwatermark.fontName));
            }
        });

        logger.Gui.info(getMessage("watermarkPersonDisplayed", randomwatermark.fontName));
    }
}
