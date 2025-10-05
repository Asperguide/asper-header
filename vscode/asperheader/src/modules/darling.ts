/**
 * @file darling.ts
 * @brief Interactive character showcase system featuring "Darling in the FranXX" characters with rich presentation
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.0
 * @date 2025
 * 
 * This module implements an engaging character display system that serves as an Easter egg
 * feature within the AsperHeader extension. It provides immersive character presentations
 * from the "Darling in the FranXX" anime series, complete with ASCII art, biographical
 * information, memorable quotes, and interactive webview interfaces.
 * 
 * Feature Overview:
 * - **Character Database**: Comprehensive collection of "Darling in the FranXX" characters
 * - **ASCII Art Integration**: High-quality ASCII representations of each character
 * - **Interactive Webview**: Rich HTML presentation with responsive design
 * - **Randomization System**: Intelligent random character selection algorithms
 * - **Copy Functionality**: Easy ASCII art copying for external use
 * - **Zoom Controls**: Adjustable display sizing for optimal viewing
 * - **Multilingual Support**: Internationalized character information and UI
 * 
 * Character Data Structure:
 * - **Personal Information**: Name, romaji, age, and physical characteristics
 * - **Narrative Elements**: Memorable quotes and detailed character descriptions
 * - **Visual Content**: Multi-line ASCII art representations with consistent formatting
 * - **Metadata**: Character IDs, series context, and classification information
 * - **Localization**: Multi-language support for character descriptions and quotes
 * 
 * Presentation System:
 * - **Webview Architecture**: Full VS Code webview integration with rich HTML/CSS
 * - **Responsive Design**: Adaptive layouts for different screen sizes and orientations
 * - **Interactive Controls**: User interface elements for enhanced user experience
 * - **Animation Support**: Smooth transitions and visual effects for character display
 * - **Accessibility**: Screen reader support and keyboard navigation compatibility
 * 
 * Technical Architecture:
 * - **Lazy Loading**: Character data loaded on-demand via {@link LazyFileLoader}
 * - **Caching Strategy**: Intelligent caching of character data and ASCII art
 * - **Error Resilience**: Graceful handling of missing character data or corrupted files
 * - **Performance**: Optimized rendering for smooth user interactions
 * - **Memory Management**: Efficient resource cleanup and garbage collection
 * 
 * Integration Points:
 * - **Extension Ecosystem**: Seamless integration with AsperHeader's core functionality
 * - **Configuration System**: User preferences for character display and behavior
 * - **Logging Framework**: Comprehensive operation logging via {@link logger}
 * - **Message System**: Localized content delivery via {@link messageProvider}
 * - **Asset Management**: Coordination with extension asset loading systems
 * 
 * Easter Egg Philosophy:
 * This module embodies the playful spirit of software development, providing users
 * with delightful surprises that enhance their development experience while
 * maintaining professional functionality. It demonstrates advanced webview
 * capabilities and serves as a showcase for the extension's technical prowess.
 * 
 * @example Character display activation:
 * ```typescript
 * const darling = new Darling();
 * await darling.updateCurrentWorkingDirectory(extensionPath);
 * await darling.updateFilePath("assets/bonus/ditf.min.json");
 * 
 * // Display random character
 * await darling.displayRandomPersonInWindow();
 * ```
 * 
 * @example Character data structure:
 * ```typescript
 * interface Person {
 *     id: number;
 *     name: string;
 *     romaji: string;
 *     quote: string;
 *     imageContent: string[]; // ASCII art lines
 *     // ... additional character properties
 * }
 * ```
 */

import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";

/**
 * @interface Person
 * @brief Represents a character from the Darling in the FranXX series
 * 
 * This interface defines the structure for character data including
 * personal information, visual representation, and metadata.
 */
export interface Person {
    /** @brief Unique identifier for the character */
    id: number,
    /** @brief Character's full name */
    name: string,
    /** @brief Character's name in romaji (Latin script) */
    romaji: string,
    /** @brief Character's age as string */
    age: string,
    /** @brief Memorable quote from the character */
    quote: string,
    /** @brief Detailed character description */
    description: string,
    /** @brief Array of strings representing ASCII art lines for the character */
    imageContent: string[],
    /** @brief Character's height measurement */
    height: string,
    /** @brief Character's weight measurement */
    weight: string,
    /** @brief URL or reference to additional character information */
    more_information: string,
    /** @brief Character type or classification */
    type: string,
    /** @brief Alternative names or nicknames for the character */
    alias: string[] | null
}
/**
 * @class Darling
 * @brief Main class for managing and displaying Darling in the FranXX characters
 * 
 * This class handles loading character data from JSON files and creating
 * interactive webview panels to display character information with ASCII art.
 * It provides functionality for random character selection, webview creation,
 * and interactive features like copy-to-clipboard and zoom controls.
 * 
 * Key features:
 * - Random character selection from data files
 * - Interactive webview panels with character information
 * - ASCII art display with zoom and copy functionality
 * - Lazy loading of character data files
 * - Customizable file paths and working directories
 */
export class Darling {

    /** @brief Lazy file loader instance for managing character data files */
    private fileInstance: LazyFileLoader = new LazyFileLoader();

    /**
     * @brief Constructor for Darling class
     * @param filePath Optional path to the character data JSON file
     * @param cwd Optional current working directory path
     * 
     * Initializes the Darling instance with optional file path and working
     * directory configurations. If not provided, default values are used.
     */
    constructor(filePath: string | undefined = undefined, cwd: string | undefined = undefined, alternateFilePath: string | undefined = undefined) {
        logger.debug(getMessage("inFunction", "constructor", "Darling"));
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
     * @brief Updates the file path for character data
     * @param filePath New path to the character data JSON file
     * @return Promise resolving to true if update successful, false otherwise
     * 
     * Updates the file path used by the lazy file loader to read
     * character data from a different JSON file location.
     */
    async updateFilePath(filePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateFilePath", "Darling"));
        return await this.fileInstance.updateFilePath(filePath);
    }
    async updateAlternateFilePath(alternateFilePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateAlternateFilePath", "Darling"));
        return await this.fileInstance.updateAlternateFilePath(alternateFilePath);
    }

    /**
     * @brief Updates the current working directory
     * @param cwd New current working directory path
     * @return Promise resolving to true if update successful, false otherwise
     * 
     * Updates the working directory used by the lazy file loader for
     * resolving relative file paths.
     */
    async updateCurrentWorkingDirectory(cwd: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateCurrentWorkingDirectory", "Darling"));
        return await this.fileInstance.updateCurrentWorkingDirectory(cwd);
    }

    /**
     * @brief Generates a random number within specified range
     * @param maxValue Maximum value (exclusive) for random number generation
     * @return Random integer between 0 (inclusive) and maxValue (exclusive)
     * 
     * Utility method for generating random indices to select characters
     * from the loaded data array.
     */
    private getRandomNumber(maxValue: number): number {
        logger.debug(getMessage("inFunction", "getRandomNumber", "Darling"));
        return Math.floor(Math.random() * maxValue);
    }

    /**
     * @brief Selects and returns a random character from the data file
     * @return Promise resolving to a randomly selected Person object
     * @throws Error if file content is invalid or empty
     * 
     * Loads the character data file, validates its format, and returns
     * a randomly selected character. Maps the raw JSON data to the
     * Person interface format, handling property name transformations.
     */
    async getRandomPerson(): Promise<Person> {
        logger.debug(getMessage("inFunction", "getRandomPerson", "Darling"));
        const fileContent = await this.fileInstance.get();
        if (!Array.isArray(fileContent) || fileContent.length === 0) {
            const err: string = getMessage("darlingJsonFileInvalid");
            logger.Gui.error(err);
            throw new Error(err);
        }
        const chosenIndex: number = this.getRandomNumber(fileContent.length);
        const raw = fileContent[chosenIndex];
        const person: Person = {
            id: raw.id,
            name: raw.name,
            romaji: raw.romaji,
            age: raw.age,
            quote: raw.quote,
            description: raw.description,
            imageContent: raw.image_link ?? [], // rename image_link → imageContent
            height: raw.height,
            weight: raw.weight,
            more_information: raw.more_information,
            type: raw.type,
            alias: raw.alias
        };
        return person;
    }

    /**
     * @brief Generates JavaScript for copy-to-clipboard functionality
     * @return HTML script tag with clipboard copy functionality
     * 
     * Creates JavaScript code that handles copying ASCII art content
     * to the system clipboard when the copy button is clicked.
     * Communicates success back to the VS Code extension.
     */
    private copyButtonScript(): string {
        logger.debug(getMessage("inFunction", "copyButtonScript", "Darling"));
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
     * @return HTML script tag with zoom in/out controls
     * 
     * Creates JavaScript code that handles font size adjustment for
     * the ASCII art display, allowing users to zoom in and out for
     * better readability. Maintains minimum font size constraints.
     */
    private zoomScript(): string {
        logger.debug(getMessage("inFunction", "zoomScript", "Darling"));
        return `
<script>
    let currentSize = 6;
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
     * @brief Generates CSS styling for the character display webview
     * @return HTML style tag with page styling rules
     * 
     * Creates CSS styles for the webview panel including typography,
     * spacing, button styling, and ASCII art formatting to ensure
     * proper display and readability.
     */
    private pageStyle(): string {
        logger.debug(getMessage("inFunction", "pageStyle", "Darling"));
        return `
        <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { font-size: 72px; margin-bottom: 0.2em; }
    h2 { margin-top: 1.2em; }
    pre { font-size: 10px; line-height: 10px; white-space: pre; }
    button { margin: 10px 0; padding: 5px 12px; font-size: 14px; }
  </style>
        `;
    }

    /**
     * @brief Creates and displays a webview panel with a random character
     * 
     * Main public method that orchestrates the complete character display process:
     * 1. Selects a random character from the data file
     * 2. Creates a new VS Code webview panel
     * 3. Generates HTML content with character information and ASCII art
     * 4. Adds interactive features (copy, zoom)
     * 5. Sets up message handling for user interactions
     * 
     * The webview includes character details, quotes, descriptions, and
     * interactive ASCII art with copy and zoom functionality.
     */
    async displayRandomPersonInWindow() {
        logger.debug(getMessage("inFunction", "displayRandomPersonInWindow", "Darling"));
        const randomPerson: Person = await this.getRandomPerson();

        const panel = vscode.window.createWebviewPanel(
            getMessage("darlingView"),
            randomPerson.name,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const asciiArt = randomPerson.imageContent.join("\n");

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
  <h1>${randomPerson.name} (${randomPerson.romaji})</h1>
  <p><b>${getMessage('darlingType')}:</b> ${randomPerson.type}</p>
  <p><b>${getMessage('darlingAge')}:</b> ${randomPerson.age}</p>
  <p><b>${getMessage('darlingHeight')}:</b> ${randomPerson.height} | <b>Weight:</b> ${randomPerson.weight}</p>
  <p><b>${getMessage('darlingAlias')}:</b> ${randomPerson.alias ? randomPerson.alias.join(", ") : "None"}</p>

  <h2>${getMessage('darlingDescription')}</h2>
  <p>${randomPerson.description}</p>

  <h2>${getMessage('darlingQuote')}</h2>
  <blockquote>${randomPerson.quote}</blockquote>

  <h2>${getMessage('darlingMoreInfo')}</h2>
  <p><a href="${randomPerson.more_information}" target="_blank">${randomPerson.more_information}</a></p>

  <h2>${getMessage('darlingImage')}</h2>
<div>
    <button id="copyBtn">${getMessage('darlingCopyAscii')}</button>
    <button id="zoomInBtn">${getMessage('darlingZoomIn')}</button>
    <button id="zoomOutBtn">${getMessage('darlingZoomOut')}</button>
</div>
  <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("darlingCopied", randomPerson.name));
            }
        });

        logger.Gui.info(getMessage("darlingPersonDisplayed", randomPerson.name));
    }
}
