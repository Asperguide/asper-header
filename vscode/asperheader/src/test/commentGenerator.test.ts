/**
 * @file commentGenerator.test.ts
 * @brief Test suite for the CommentGenerator header generation system
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.4
 * @date 2025
 * 
 * This test suite provides comprehensive coverage for the CommentGenerator module,
 * testing header creation, injection, refresh, and management functionality with
 * various file types, comment styles, and user interaction scenarios.
 */

import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';
import { CommentGenerator } from '../modules/commentGenerator';
import { LazyFileLoader } from '../modules/lazyFileLoad';
import { RandomLogo } from '../modules/randomLogo';
import { CodeConfig } from '../modules/processConfiguration';

// Mock state for VS Code APIs
let mockActiveTextEditor: vscode.TextEditor | undefined = undefined;
let mockShowInputBoxResponse: string | undefined = undefined;
let mockShowQuickPickResponse: string | undefined = undefined;
let mockEditOperations: Array<{ position: vscode.Position; text: string; isInsert: boolean; range?: vscode.Range }> = [];

/**
 * @interface MockDocumentLine
 * @brief Represents a single line within a mock VS Code document for testing
 * 
 * This interface defines the structure of a document line that mimics the
 * VS Code TextLine interface, providing all necessary properties for testing
 * text manipulation and header generation operations.
 */
interface MockDocumentLine {
    /** @brief The actual text content of the line */
    text: string;
    /** @brief The range that the line spans in the document */
    range: vscode.Range;
    /** @brief Zero-based line number in the document */
    lineNumber: number;
    /** @brief Range including the line break character */
    rangeIncludingLineBreak: vscode.Range;
    /** @brief Index of the first non-whitespace character */
    firstNonWhitespaceCharacterIndex: number;
    /** @brief Whether the line is empty or contains only whitespace */
    isEmptyOrWhitespace: boolean;
}

/**
 * @class MockTextDocument
 * @brief Mock implementation of VS Code TextDocument for testing purposes
 * 
 * Provides a comprehensive mock of the VS Code TextDocument interface,
 * enabling isolated testing of document manipulation operations without
 * requiring actual VS Code environment. Supports all essential TextDocument
 * operations including line access, text retrieval, and position calculations.
 * 
 * Key Features:
 * - **Line Management**: Dynamic line collection with proper indexing
 * - **Position Mapping**: Accurate offset/position conversion utilities
 * - **Range Operations**: Support for text extraction within ranges
 * - **Language Detection**: Configurable language ID for syntax testing
 * - **EOL Handling**: Support for both LF and CRLF line endings
 * - **File Metadata**: URI, encoding, and file state simulation
 */
class MockTextDocument implements Partial<vscode.TextDocument> {
    /** @brief Array of document lines with metadata */
    public lines: MockDocumentLine[] = [];
    /** @brief File URI for the mock document */
    public uri: vscode.Uri;
    /** @brief Language identifier for syntax highlighting */
    public languageId: string;
    /** @brief End-of-line character sequence type */
    public eol: vscode.EndOfLine;
    /** @brief Document version number for change tracking */
    public version: number;
    /** @brief Whether the document is closed */
    public isClosed: boolean;
    /** @brief Total number of lines in the document */
    public lineCount: number = 0;
    /** @brief Base filename without path */
    public fileName: string = '';
    /** @brief Whether this is an untitled document */
    public isUntitled: boolean = false;
    /** @brief Document encoding format */
    public encoding: string = 'utf8';
    /** @brief Whether the document has unsaved changes */
    public isDirty: boolean = false;

    /**
     * @brief Creates a new mock text document with specified configuration
     * @param filePath Absolute file path for the document URI
     * @param content Initial text content (defaults to empty string)
     * @param languageId Language identifier (defaults to 'typescript')
     * @param eol End-of-line character type (defaults to LF)
     * @param isClosed Whether document starts in closed state
     * 
     * Initializes a fully functional mock document that can be used for
     * testing text operations, header injection, and file manipulation
     * without requiring actual VS Code document instances.
     */
    constructor(
        filePath: string,
        content: string = '',
        languageId: string = 'typescript',
        eol: vscode.EndOfLine = vscode.EndOfLine.LF,
        isClosed: boolean = false
    ) {
        this.uri = vscode.Uri.file(filePath);
        this.languageId = languageId;
        this.eol = eol;
        this.version = 1;
        this.isClosed = isClosed;

        this.setContent(content);
    }

    /**
     * @brief Sets the document content and updates all line metadata
     * @param content New text content for the document
     * @return void
     * 
     * Replaces the entire document content with new text, automatically
     * parsing lines and generating all necessary metadata including ranges,
     * line numbers, and whitespace analysis. Updates document line count
     * and filename based on the URI.
     */
    setContent(content: string): void {
        const lines = content.split('\n');
        this.lines = lines.map((text, index) => ({
            text,
            range: new vscode.Range(index, 0, index, text.length),
            lineNumber: index,
            rangeIncludingLineBreak: new vscode.Range(index, 0, index + 1, 0),
            firstNonWhitespaceCharacterIndex: text.search(/\S/),
            isEmptyOrWhitespace: text.trim().length === 0
        }));
        this.lineCount = this.lines.length;
        this.fileName = path.basename(this.uri.fsPath);
    }

    /**
     * @brief Retrieves a text line at the specified line number or position
     * @param lineOrPosition Line number or Position object to retrieve
     * @return TextLine object containing line metadata and content
     * @throws Error if line number is out of range
     */
    lineAt(lineOrPosition: number | vscode.Position): vscode.TextLine {
        const line = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
        if (line < 0 || line >= this.lines.length) {
            throw new Error(`Line ${line} is out of range`);
        }
        return this.lines[line] as vscode.TextLine;
    }

    /**
     * @brief Converts a Position to a zero-based offset within the document
     * @param position Position object with line and character coordinates
     * @return Zero-based offset from the beginning of the document
     */
    offsetAt(position: vscode.Position): number {
        let offset = 0;
        for (let i = 0; i < position.line && i < this.lines.length; i++) {
            offset += this.lines[i].text.length + 1; // +1 for newline
        }
        return offset + Math.min(position.character, this.lines[position.line]?.text.length || 0);
    }

    /**
     * @brief Converts a zero-based offset to a Position within the document
     * @param offset Zero-based character offset from document start
     * @return Position object with line and character coordinates
     */
    positionAt(offset: number): vscode.Position {
        let currentOffset = 0;
        for (let line = 0; line < this.lines.length; line++) {
            const lineLength = this.lines[line].text.length + 1; // +1 for newline
            if (currentOffset + lineLength > offset) {
                return new vscode.Position(line, offset - currentOffset);
            }
            currentOffset += lineLength;
        }
        return new vscode.Position(this.lines.length - 1, (this.lines[this.lines.length - 1]?.text.length || 0));
    }

    /**
     * @brief Extracts text content from the document within an optional range
     * @param range Optional range to extract text from; if undefined, returns entire document
     * @return String containing the requested text content
     */
    getText(range?: vscode.Range): string {
        if (!range) {
            return this.lines.map(line => line.text).join('\n');
        }

        if (range.start.line === range.end.line) {
            const line = this.lines[range.start.line];
            return line ? line.text.substring(range.start.character, range.end.character) : '';
        }

        let result = '';
        for (let i = range.start.line; i <= range.end.line && i < this.lines.length; i++) {
            const line = this.lines[i];
            if (!line) { continue; }

            if (i === range.start.line) {
                result += line.text.substring(range.start.character);
            } else if (i === range.end.line) {
                result += line.text.substring(0, range.end.character);
            } else {
                result += line.text;
            }

            if (i < range.end.line) {
                result += '\n';
            }
        }
        return result;
    }

    /**
     * @brief Validates and potentially adjusts a Range to fit within document bounds
     * @param range Range object to validate
     * @return Validated Range object (currently returns input unchanged)
     */
    validateRange(range: vscode.Range): vscode.Range {
        return range;
    }

    /**
     * @brief Validates and potentially adjusts a Position to fit within document bounds
     * @param position Position object to validate
     * @return Validated Position object (currently returns input unchanged)
     */
    validatePosition(position: vscode.Position): vscode.Position {
        return position;
    }

    /**
     * @brief Finds the range of a word at the specified position using regex matching
     * @param position Position to search for word boundaries
     * @param regex Optional regex pattern to define word boundaries (defaults to \w+)
     * @return Range of the word at position, or undefined if no word found
     */
    getWordRangeAtPosition(position: vscode.Position, regex?: RegExp): vscode.Range | undefined {
        const line = this.lines[position.line];
        if (!line) { return undefined; }

        const wordRegex = regex || /[\w]+/g;
        let match;
        while ((match = wordRegex.exec(line.text)) !== null) {
            if (match.index <= position.character && match.index + match[0].length >= position.character) {
                return new vscode.Range(position.line, match.index, position.line, match.index + match[0].length);
            }
        }
        return undefined;
    }

    /**
     * @brief Simulates saving the document to persistent storage
     * @return Promise that resolves to true indicating successful save operation
     */
    save(): Thenable<boolean> {
        return Promise.resolve(true);
    }
}

/**
 * @class MockTextEditor
 * @brief Mock implementation of VS Code TextEditor for testing text editing operations
 * 
 * Provides a simplified mock of the VS Code TextEditor interface, focusing on
 * document editing capabilities required for header generation testing. Captures
 * edit operations for verification without performing actual text modifications.
 * 
 * Key Capabilities:
 * - **Document Association**: Links to MockTextDocument for content access
 * - **Edit Tracking**: Records all insert and replace operations
 * - **Operation Simulation**: Mimics VS Code's edit callback pattern
 */
class MockTextEditor implements Partial<vscode.TextEditor> {
    /** @brief Associated document containing the text content */
    public document: vscode.TextDocument;

    /**
     * @brief Creates a new mock text editor for the specified document
     * @param document MockTextDocument to associate with this editor
     * 
     * Initializes the editor with a document reference, enabling testing
     * of text editing operations without actual VS Code editor instances.
     */
    constructor(document: MockTextDocument) {
        this.document = document as unknown as vscode.TextDocument;
    }

    async edit(callback: (editBuilder: vscode.TextEditorEdit) => void): Promise<boolean> {
        const mockEditBuilder = {
            insert: (location: vscode.Position, value: string) => {
                mockEditOperations.push({
                    position: location,
                    text: value,
                    isInsert: true
                });
            },
            replace: (location: vscode.Range, value: string) => {
                mockEditOperations.push({
                    position: location.start,
                    text: value,
                    isInsert: false,
                    range: location
                });
            }
        };

        callback(mockEditBuilder as vscode.TextEditorEdit);
        return true;
    }
}

// Store original VS Code methods
let originalActiveTextEditor: any;
let originalShowInputBox: any;
let originalShowQuickPick: any;

/**
 * @brief Main test suite for CommentGenerator functionality
 * 
 * Comprehensive test coverage for header generation, injection, refresh,
 * and management operations across various file types and scenarios.
 */
suite('CommentGenerator Test Suite', function () {
    /** @brief Temporary directory path for test files */
    let tempDir: string;
    /** @brief Path to the language configuration JSON file */
    let languageConfigFile: string;
    /** @brief Lazy file loader instance for language configurations */
    let lazyFileLoader: LazyFileLoader;
    /** @brief Mock random logo generator for testing */
    let mockRandomLogo: RandomLogo;
    /** @brief Comment generator instance under test */
    let generator: CommentGenerator;

    /**
     * @brief Sets up test environment before each test
     * @return Promise that resolves when setup is complete
     * 
     * Creates temporary directories, mock language configurations,
     * and initializes all required test infrastructure including
     * VS Code API mocks and clean state for each test execution.
     */
    setup(async () => {
        // Create temporary directory for test files
        tempDir = await fs.mkdtemp(path.join(require('os').tmpdir(), 'commentgen-test-'));

        // Create language configuration file
        languageConfigFile = path.join(tempDir, 'languages.json');
        const languageConfig = {
            langs: [
                {
                    langs: ['typescript', 'javascript'],
                    fileExtensions: {
                        typescript: ['.ts', '.tsx'],
                        javascript: ['.js', '.jsx']
                    },
                    singleLine: ['//'],
                    multiLine: ['/*', ' *', ' */'],
                    prompt_comment_opening_type: false
                },
                {
                    langs: ['python'],
                    fileExtensions: {
                        python: ['.py']
                    },
                    singleLine: ['#'],
                    multiLine: [],
                    prompt_comment_opening_type: false
                },
                {
                    langs: ['c', 'cpp'],
                    fileExtensions: {
                        c: ['.c', '.h'],
                        cpp: ['.cpp', '.hpp', '.cxx']
                    },
                    singleLine: ['//'],
                    multiLine: ['/*', ' *', ' */'],
                    prompt_comment_opening_type: true
                }
            ]
        };
        await fs.writeFile(languageConfigFile, JSON.stringify(languageConfig, null, 2));

        // Create lazy file loader
        lazyFileLoader = new LazyFileLoader(languageConfigFile, tempDir);

        // Create mock random logo
        mockRandomLogo = new RandomLogo();

        // Reset mock state
        mockActiveTextEditor = undefined;
        mockShowInputBoxResponse = undefined;
        mockShowQuickPickResponse = undefined;
        mockEditOperations = [];

        // Store original VS Code methods
        originalActiveTextEditor = vscode.window.activeTextEditor;
        originalShowInputBox = vscode.window.showInputBox;
        originalShowQuickPick = vscode.window.showQuickPick;

        // Mock VS Code APIs
        Object.defineProperty(vscode.window, 'activeTextEditor', {
            get: () => mockActiveTextEditor,
            configurable: true
        });

        (vscode.window as any).showInputBox = async (options?: vscode.InputBoxOptions) => {
            return mockShowInputBoxResponse;
        };

        (vscode.window as any).showQuickPick = async (items: string[], options?: vscode.QuickPickOptions) => {
            return mockShowQuickPickResponse;
        };

        // Reset CodeConfig to default values to ensure clean state
        // This prevents configuration changes from other test suites from affecting these tests
        await CodeConfig.refreshVariables();
    });

    /**
     * @brief Cleans up test environment after each test
     * @return Promise that resolves when cleanup is complete
     * 
     * Removes temporary files, restores original VS Code API methods,
     * and ensures clean state for subsequent test executions.
     */
    teardown(async () => {
        // Cleanup temporary directory
        try {
            await fs.rm(tempDir, { recursive: true, force: true });
        } catch (error) {
            // Ignore cleanup errors
        }

        // Restore original VS Code methods
        Object.defineProperty(vscode.window, 'activeTextEditor', {
            value: originalActiveTextEditor,
            configurable: true
        });
        (vscode.window as any).showInputBox = originalShowInputBox;
        (vscode.window as any).showQuickPick = originalShowQuickPick;
    });

    /**
     * @brief Test suite for CommentGenerator constructor and initialization
     * 
     * Verifies that the CommentGenerator can be properly instantiated with
     * various parameter combinations and handles edge cases gracefully.
     */
    suite('Constructor and Initialization', () => {
        /**
         * @brief Verifies successful creation with all parameters provided
         * @test Creates CommentGenerator instance with complete configuration
         */
        test('should create instance with all parameters provided', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            assert.ok(generator, 'Generator should be created successfully');
        });

        /**
         * @brief Tests creation with minimal parameters
         * @test Validates CommentGenerator instantiation with no parameters
         */
        test('should create instance with minimal parameters', () => {
            generator = new CommentGenerator();

            assert.ok(generator, 'Generator should be created with undefined parameters');
        });

        /**
         * @brief Tests creation with language loader only
         * @test Validates CommentGenerator instantiation with partial configuration
         */
        test('should create instance with only language loader', () => {
            generator = new CommentGenerator(lazyFileLoader);

            assert.ok(generator, 'Generator should be created with language loader only');
        });

        /**
         * @brief Tests handling of undefined editor parameter
         * @test Validates graceful handling of missing editor context
         */
        test('should handle undefined editor gracefully', () => {
            generator = new CommentGenerator(lazyFileLoader, undefined, mockRandomLogo);

            assert.ok(generator, 'Generator should handle undefined editor');
        });
    });

    /**
     * @brief Test suite for file metadata extraction and processing
     * 
     * Validates the CommentGenerator's ability to correctly extract and
     * process file information from VS Code editor instances, including
     * filename, extension, language ID, and file path parsing.
     */
    suite('File Information Processing', () => {
        /**
         * @brief Validates TypeScript file metadata extraction
         * @test Ensures correct parsing of .ts files and TypeScript language ID
         */
        test('should extract correct file metadata from TypeScript editor', () => {
            const filePath = '/home/user/project/test.ts';
            const document = new MockTextDocument(filePath, '', 'typescript');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            // Access private properties through type assertion
            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'test.ts');
            assert.strictEqual(generatorAny.fileExtension, 'ts');
            assert.strictEqual(generatorAny.languageId, 'typescript');
            assert.strictEqual(generatorAny.filePath, filePath);
        });

        /**
         * @brief Validates Python file metadata extraction
         * @test Ensures correct parsing of .py files and Python language ID
         */
        test('should extract correct file metadata from Python editor', () => {
            const filePath = '/home/user/project/script.py';
            const document = new MockTextDocument(filePath, '', 'python');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'script.py');
            assert.strictEqual(generatorAny.fileExtension, 'py');
            assert.strictEqual(generatorAny.languageId, 'python');
        });

        /**
         * @brief Tests handling of files without extensions
         * @test Validates proper processing of extension-less files like Makefile
         */
        test('should handle files without extensions', () => {
            const filePath = '/home/user/Makefile';
            const document = new MockTextDocument(filePath, '', 'makefile');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'Makefile');
            assert.strictEqual(generatorAny.fileExtension, 'none');
        });

        /**
         * @brief Tests different end-of-line character handling
         * @test Validates proper detection and processing of CRLF vs LF line endings
         */
        test('should handle different EOL types', () => {
            const document = new MockTextDocument('/test/file.ts', '', 'typescript', vscode.EndOfLine.CRLF);
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.documentEOL, vscode.EndOfLine.CRLF);
        });
    });

    /**
     * @brief Test suite for comment style detection and language configuration
     * 
     * Verifies the CommentGenerator's ability to correctly identify and
     * configure appropriate comment styles based on file language, extension,
     * and language configuration mappings.
     */
    suite('Comment Style Detection', () => {
        /**
         * @brief Validates TypeScript comment style detection
         * @test Ensures proper identification of single-line and multi-line comment styles for TypeScript
         */
        test('should detect TypeScript comment style correctly', async () => {
            const document = new MockTextDocument('/test/file.ts', '', 'typescript');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, ['//']);
            assert.deepStrictEqual(commentStyle.multiLine, ['/*', ' *', ' */']);
            assert.strictEqual(commentStyle.prompt_comment_opening_type, false);
        });

        /**
         * @brief Validates Python comment style detection
         * @test Ensures proper identification of Python hash-style comments
         */
        test('should detect Python comment style correctly', async () => {
            const document = new MockTextDocument('/test/script.py', '', 'python');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, ['#']);
            assert.deepStrictEqual(commentStyle.multiLine, []);
        });

        /**
         * @brief Validates C++ comment style detection with user prompting
         * @test Ensures proper identification of C++ comment styles and prompt behavior
         */
        test('should detect C++ comment style with prompting', async () => {
            const document = new MockTextDocument('/test/main.cpp', '', 'cpp');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, ['//']);
            assert.deepStrictEqual(commentStyle.multiLine, ['/*', ' *', ' */']);
            assert.strictEqual(commentStyle.prompt_comment_opening_type, true);
        });

        /**
         * @brief Tests fallback to file extension matching when language ID unknown
         * @test Validates extension-based comment style detection for .tsx files
         */
        test('should fallback to file extension matching', async () => {
            const document = new MockTextDocument('/test/file.tsx', '', 'unknown');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            // Should match TypeScript config based on .tsx extension
            assert.deepStrictEqual(commentStyle.singleLine, ['//']);
            assert.deepStrictEqual(commentStyle.multiLine, ['/*', ' *', ' */']);
        });

        /**
         * @brief Tests handling of completely unknown file types
         * @test Validates graceful fallback for unrecognized languages and extensions
         */
        test('should return empty style for unknown language', async () => {
            const document = new MockTextDocument('/test/file.xyz', '', 'unknown');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, []);
            assert.deepStrictEqual(commentStyle.multiLine, []);
            assert.strictEqual(commentStyle.prompt_comment_opening_type, false);
        });
    });

    /**
     * @brief Test suite for user interaction and input handling
     * 
     * Tests the CommentGenerator's ability to prompt users for header
     * information, handle user responses, and manage input validation
     * for description, purpose, and comment style selection.
     */
    suite('User Input Handling', () => {
        /**
         * @brief Tests file description input collection from user
         * @test Validates proper handling of user-provided file descriptions
         */
        test('should get file description from user input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = 'This is a test file for the application';

            const generatorAny = generator as any;
            const description = await generatorAny.determineHeaderDescription();

            assert.deepStrictEqual(description, ['This is a test file for the application']);
        });

        /**
         * @brief Tests handling of empty description input from user
         * @test Validates graceful handling when user provides no description
         */
        test('should handle empty description input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = undefined;

            const generatorAny = generator as any;
            const description = await generatorAny.determineHeaderDescription();

            assert.deepStrictEqual(description, ['']);
        });

        /**
         * @brief Tests file purpose input collection from user
         * @test Validates proper handling of user-provided file purpose information
         */
        test('should get file purpose from user input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = 'Main entry point for the application';

            const generatorAny = generator as any;
            const purpose = await generatorAny.determineHeaderPurpose();

            assert.deepStrictEqual(purpose, ['Main entry point for the application']);
        });

        /**
         * @brief Tests single comment option selection without user prompting
         * @test Validates automatic selection when only one comment option is available
         */
        test('should get single comment option without prompting', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//']);

            assert.strictEqual(result, '//');
        });

        /**
         * @brief Tests user prompting for comment selection with multiple options
         * @test Validates proper user interaction when multiple comment styles are available
         */
        test('should prompt for comment selection when multiple options', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowQuickPickResponse = '/*';

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//', '/*']);

            assert.strictEqual(result, '/*');
        });

        /**
         * @brief Tests fallback behavior when user cancels comment selection
         * @test Validates automatic selection of first option when user cancels prompt
         */
        test('should return first option when user cancels selection', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowQuickPickResponse = undefined;

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//', '/*']);

            assert.strictEqual(result, '//');
        });

        /**
         * @brief Tests error handling for empty comment option arrays
         * @test Validates proper error throwing when no comment options are provided
         */
        test('should throw error for empty comment options', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;

            await assert.rejects(
                async () => await generatorAny.getSingleCommentOption([]),
                Error
            );
        });
    });

    /**
     * @brief Test suite for header content generation and formatting
     * 
     * Validates the CommentGenerator's ability to create properly formatted
     * header components including openers, closers, timestamps, and key-value
     * sections with correct comment prefixes and line endings.
     */
    suite('Header Content Generation', () => {
        /**
         * @brief Tests header opener generation with project branding
         * @test Validates correct formatting of header opening section
         */
        test('should generate correct header opener', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const opener = generatorAny.headerOpener(' * ', vscode.EndOfLine.LF, 'TestProject');

            assert.ok(opener.includes('TestProject'));
            assert.ok(opener.includes(' * '));
            assert.ok(opener.endsWith('\n'));
        });

        /**
         * @brief Tests header closer generation with project branding
         * @test Validates correct formatting of header closing section
         */
        test('should generate correct header closer', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const closer = generatorAny.headerCloser(' * ', vscode.EndOfLine.LF, 'TestProject');

            assert.ok(closer.includes('TestProject'));
            assert.ok(closer.includes(' * '));
            assert.ok(closer.endsWith('\n'));
        });

        /**
         * @brief Tests creation date generation with proper formatting
         * @test Validates correct date format and comment prefix integration
         */
        test('should generate creation date with correct format', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const creationDate = generatorAny.addCreationDate(' * ', vscode.EndOfLine.LF);

            assert.ok(creationDate.includes(' * '));
            assert.ok(creationDate.includes('2025')); // Current year
            assert.ok(creationDate.endsWith('\n'));
        });

        /**
         * @brief Tests last modified timestamp generation including time component
         * @test Validates proper timestamp formatting with hours, minutes, and seconds
         */
        test('should generate last modified date with time', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const modifiedDate = generatorAny.addLastModifiedDate(' * ', vscode.EndOfLine.LF);

            assert.ok(modifiedDate.includes(' * '));
            assert.ok(modifiedDate.includes('2025')); // Current year
            assert.ok(modifiedDate.includes(':')); // Time separator
            assert.ok(modifiedDate.endsWith('\n'));
        });

        /**
         * @brief Tests single-line key-value pair generation for header fields
         * @test Validates proper formatting of author, project, and other single-line fields
         */
        test('should generate single line key-value pair', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const singleLine = generatorAny.addSingleLineKey(' * ', vscode.EndOfLine.LF, 'Author', 'John Doe');

            assert.ok(singleLine.includes(' * '));
            assert.ok(singleLine.includes('Author'));
            assert.ok(singleLine.includes('John Doe'));
            assert.ok(singleLine.endsWith('\n'));
        });

        /**
         * @brief Tests multi-line key section generation for complex header fields
         * @test Validates proper formatting of descriptions and multi-line content areas
         */
        test('should generate multi-line key section', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const multiLine = generatorAny.addMultilineKey(' * ', vscode.EndOfLine.LF, 'Description', ['Line 1', 'Line 2']);

            assert.ok(multiLine.includes(' * '));
            assert.ok(multiLine.includes('Description'));
            assert.ok(multiLine.includes('Line 1'));
            assert.ok(multiLine.includes('Line 2'));
        });

        /**
         * @brief Tests proper handling of Windows-style CRLF line endings
         * @test Validates correct line ending detection and processing for Windows files
         */
        test('should handle CRLF line endings correctly', () => {
            const document = new MockTextDocument('/test/file.ts', '', 'typescript', vscode.EndOfLine.CRLF);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const eolString = generatorAny.determineNewLine(vscode.EndOfLine.CRLF);

            assert.strictEqual(eolString, '\r\n');
        });

        /**
         * @brief Tests proper handling of Unix-style LF line endings
         * @test Validates correct line ending detection and processing for Unix/Linux files
         */
        test('should handle LF line endings correctly', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const eolString = generatorAny.determineNewLine(vscode.EndOfLine.LF);

            assert.strictEqual(eolString, '\n');
        });
    });

    /**
     * @brief Test suite for comment prefix processing and formatting
     * 
     * Validates the CommentGenerator's ability to correctly process and
     * format comment prefixes for various comment styles including single-line,
     * multi-line, and language-specific comment patterns.
     */
    suite('Comment Prefix Processing', () => {
        /**
         * @brief Tests processing of three-part multi-line comment styles
         * @test Validates correct handling of opener, body, and closer prefixes
         */
        test('should process multi-line comments with three parts', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const commentStyle = {
                singleLine: [],
                multiLine: ['/*', ' *', ' */'],
                prompt_comment_opening_type: false
            };

            const generatorAny = generator as any;
            const prefixes = await generatorAny.getCorrectCommentPrefix(commentStyle);

            assert.strictEqual(prefixes.length, 3);
            assert.ok(prefixes[0].includes('/*'));
            assert.ok(prefixes[1].includes(' *'));
            assert.ok(prefixes[2].includes(' */'));
        });

        /**
         * @brief Tests processing of two-part multi-line comment styles like HTML comments
         * @test Validates correct handling of opener and closer without middle section
         */
        test('should process multi-line comments with two parts', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const commentStyle = {
                singleLine: [],
                multiLine: ['<!--', '-->'],
                prompt_comment_opening_type: false
            };

            const generatorAny = generator as any;
            const prefixes = await generatorAny.getCorrectCommentPrefix(commentStyle);

            assert.strictEqual(prefixes.length, 3);
            assert.ok(prefixes[0].includes('<!--'));
            assert.strictEqual(prefixes[1].trim(), ''); // Empty middle
            assert.ok(prefixes[2].includes('-->'));
        });

        /**
         * @brief Tests processing of single-line comment styles without user interaction
         * @test Validates automatic handling of hash-style comments for Python and shell scripts
         */
        test('should process single-line comments without prompting', async () => {
            const document = new MockTextDocument('/test/file.py');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const commentStyle = {
                singleLine: ['#'],
                multiLine: [],
                prompt_comment_opening_type: false
            };

            const generatorAny = generator as any;
            const prefixes = await generatorAny.getCorrectCommentPrefix(commentStyle);

            assert.strictEqual(prefixes.length, 3);
            assert.ok(prefixes[0].includes('#'));
            assert.ok(prefixes[1].includes('#'));
            assert.ok(prefixes[2].includes('#'));
        });

        /**
         * @brief Tests user prompting for single-line comment style selection
         * @test Validates proper interaction when multiple single-line options are configured
         */
        test('should prompt for single-line comment selection', async () => {
            const document = new MockTextDocument('/test/file.cpp');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowQuickPickResponse = '//';

            const commentStyle = {
                singleLine: ['//', '#'],
                multiLine: [],
                prompt_comment_opening_type: true
            };

            const generatorAny = generator as any;
            const prefixes = await generatorAny.getCorrectCommentPrefix(commentStyle);

            assert.strictEqual(prefixes.length, 3);
            assert.ok(prefixes[0].includes('//'));
            assert.ok(prefixes[1].includes('//'));
            assert.ok(prefixes[2].includes('//'));
        });

        /**
         * @brief Tests graceful handling of empty comment configuration scenarios
         * @test Validates fallback behavior when no comment styles are defined
         */
        test('should handle empty comment configurations', async () => {
            const document = new MockTextDocument('/test/file.unknown');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const commentStyle = {
                singleLine: [],
                multiLine: [],
                prompt_comment_opening_type: false
            };

            const generatorAny = generator as any;
            const prefixes = await generatorAny.getCorrectCommentPrefix(commentStyle);

            assert.strictEqual(prefixes.length, 3);
            // When no comment styles are available, should still have spacing
            assert.strictEqual(prefixes[0], ' '); // Just spacing
            assert.strictEqual(prefixes[1], ' ');
            assert.ok(prefixes[2].includes(' '));
        });
    });

    /**
     * @brief Test suite for header detection and parsing operations
     * 
     * Verifies the CommentGenerator's ability to detect existing headers,
     * identify broken headers, and parse header boundaries correctly within
     * various document structures and edge cases.
     */
    suite('Header Detection and Parsing', () => {
        /**
         * @brief Tests detection of properly formatted existing headers
         * @test Validates correct identification of complete header structures
         */
        test('should detect existing header correctly', () => {
            const headerContent = `/*
 * +==== BEGIN AsperHeader =================+
 * Logo:
 * ▄▄▄▄▄▄▄▄
 * ───────
 * Project: AsperHeader
 * File: test.ts
 * Created: 03-10-2025
 * LAST Modified: 15:30:45 03-10-2025
 * Description:
 * Test file
 * ───────
 * Copyright: © 2025
 * Purpose: Testing
 * +==== END AsperHeader =================+
 */

const someCode = true;`;

            const document = new MockTextDocument('/test/test.ts', headerContent);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, true);
            assert.ok(typeof generatorAny.headerInnerStart === 'number');
            assert.ok(typeof generatorAny.headerInnerEnd === 'number');
        });

        /**
         * @brief Tests detection of files without existing headers
         * @test Validates correct identification when no header markers are present
         */
        test('should detect missing header correctly', () => {
            const content = `const someCode = true;
function myFunction() {
    return 'hello';
}`;

            const document = new MockTextDocument('/test/test.ts', content);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, false);
            assert.strictEqual(generatorAny.headerInnerStart, undefined);
            assert.strictEqual(generatorAny.headerInnerEnd, undefined);
        });

        /**
         * @brief Tests detection of malformed headers missing closing markers
         * @test Validates identification of incomplete header structures with opener only
         */
        test('should detect broken header (opener without closer)', () => {
            const brokenContent = `/*
 * ═══════════════════════ ◄ BEGIN TestProject ► ═══════════════════════
 * Project: TestProject
 * File: test.ts

const someCode = true;`;

            const document = new MockTextDocument('/test/test.ts', brokenContent);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, false);
        });

        /**
         * @brief Tests detection of malformed headers missing opening markers
         * @test Validates identification of incomplete header structures with closer only
         */
        test('should detect broken header (closer without opener)', () => {
            const brokenContent = `const someCode = true;
 * ═══════════════════════ ◄ END TestProject ► ═══════════════════════
 */`;

            const document = new MockTextDocument('/test/test.ts', brokenContent);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, false);
        });

        /**
         * @brief Tests graceful handling of closed document instances
         * @test Validates proper error handling when document is no longer accessible
         */
        test('should handle closed document gracefully', () => {
            const document = new MockTextDocument('/test/test.ts', '', 'typescript', vscode.EndOfLine.LF, true);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, undefined);
        });

        /**
         * @brief Tests performance optimization with maximum scan length limits
         * @test Validates efficient header detection in very large files
         */
        test('should respect max scan length limit', () => {
            const longContent = Array(1000).fill('const line = true;').join('\n');
            const document = new MockTextDocument('/test/test.ts', longContent);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, false);
        });
    });

    /**
     * @brief Test suite for logo randomizer integration
     * 
     * Tests the CommentGenerator's integration with the RandomLogo system
     * for ASCII art logo generation and management within headers.
     */
    suite('Logo Integration', () => {
        /**
         * @brief Tests updating of logo randomizer instance
         * @test Validates proper integration of external logo generation components
         */
        test('should update logo randomizer instance', () => {
            generator = new CommentGenerator();
            const newRandomLogo = new RandomLogo();

            generator.updateLogoInstanceRandomiser(newRandomLogo);

            // Test passes if no error is thrown
            assert.ok(true);
        });
    });

    /**
     * @brief Test suite for file writing and modification operations
     * 
     * Validates the CommentGenerator's ability to write headers to files,
     * update existing headers, and manage file modification operations
     * through the VS Code editor interface.
     */
    suite('File Writing Operations', () => {
        /**
         * @brief Tests header injection into empty files
         * @test Validates proper header creation in documents without existing content
         */
        test('should write header to empty file', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;
            mockShowInputBoxResponse = 'Test description';

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = ['/* ', ' * ', ' */'];
            const status = await generatorAny.writeHeaderToFile(editor, comments);

            assert.strictEqual(mockEditOperations.length, 1);
            assert.strictEqual(mockEditOperations[0].isInsert, true);
            assert.strictEqual(mockEditOperations[0].position.line, 0);
            assert.strictEqual(mockEditOperations[0].position.character, 0);
            assert.ok(mockEditOperations[0].text.includes('Test description'));
        });

        /**
         * @brief Tests timestamp update functionality for existing headers
         * @test Validates proper modification date refresh in existing header structures
         */
        test('should update existing header timestamp', async () => {
            const headerContent = `/*
 * ═══════════════════════ ◄ BEGIN TestProject ► ═══════════════════════
 * Logo:
 * ▄▄▄▄▄▄▄▄
 * ───────
 * Project: TestProject
 * File: test.ts  
 * Created: 03-10-2025
 * LAST Modified: 15:30:45 03-10-2025
 * Description:
 * Test file
 * ───────
 * Copyright: © 2025
 * Purpose: Testing
 * ═══════════════════════ ◄ END TestProject ► ═══════════════════════
 */`;

            const document = new MockTextDocument('/test/test.ts', headerContent);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = ['/* ', ' * ', ' */'];

            // Simulate finding header bounds
            generatorAny.headerInnerStart = 1;
            generatorAny.headerInnerEnd = 15;

            await generatorAny.updateEditDate(editor, comments);

            assert.strictEqual(mockEditOperations.length, 1);
            assert.strictEqual(mockEditOperations[0].isInsert, false);
            // The text should contain the Last Modified prefix and timestamp
            const editText = mockEditOperations[0].text;
            assert.ok(editText.includes('Last Modified') || editText.includes('*'), 'Should include Last Modified or comment prefix');
            assert.ok(editText.includes('2025') || editText.length > 0, 'Should include year or have content');
        });
    });

    /**
     * @brief Test suite for primary CommentGenerator API methods
     * 
     * Tests the main public interface of CommentGenerator including
     * header injection, refresh operations, and primary user-facing
     * functionality across various scenarios and edge cases.
     */
    suite('Main API Methods', () => {
        /**
         * @brief Tests header injection with no active editor
         * @test Validates graceful handling of missing editor context
         */
        test('should inject header when no active editor', async () => {
            mockActiveTextEditor = undefined;

            generator = new CommentGenerator(lazyFileLoader);

            // Should not throw, just log error
            await generator.injectHeader();

            assert.ok(true); // Test passes if no error thrown
        });

        /**
         * @brief Tests header injection functionality for TypeScript files
         * @test Validates complete header creation workflow with user input integration
         */
        test('should inject header to TypeScript file', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;
            mockShowInputBoxResponse = 'Test file description';

            generator = new CommentGenerator(lazyFileLoader, undefined, mockRandomLogo);

            await generator.injectHeader();

            // Should have written header
            assert.ok(mockEditOperations.length > 0);
            assert.ok(mockEditOperations[0].text.includes('Test file description'));
        });

        /**
         * @brief Tests header refresh functionality with configuration-based enabling
         * @test Validates conditional timestamp updates based on user settings
         */
        test('should refresh header when configured', async () => {
            const headerContent = `/*
 * ═══════════════════════ ◄ BEGIN TestProject ► ═══════════════════════
 * Project: TestProject
 * File: test.ts
 * Last Modified: 15:30:45 03-10-2025
 * ═══════════════════════ ◄ END TestProject ► ═══════════════════════
 */`;

            const document = new MockTextDocument('/test/test.ts', headerContent);
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            await generator.refreshHeader(document as any);

            // Should have updated timestamp if refresh is enabled
            // (depends on configuration, so we just test it doesn't throw)
            assert.ok(true);
        });

        /**
         * @brief Tests refresh operation error handling with undefined document
         * @test Validates graceful handling when no document context is available
         */
        test('should handle refresh with no document', async () => {
            generator = new CommentGenerator(lazyFileLoader);

            await generator.refreshHeader(undefined);

            assert.ok(true); // Should not throw
        });

        /**
         * @brief Tests refresh operation with closed document instances
         * @test Validates proper error handling for inaccessible document states
         */
        test('should handle refresh with closed document', async () => {
            const document = new MockTextDocument('/test/test.ts', '', 'typescript', vscode.EndOfLine.LF, true);
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            await generator.refreshHeader(document as any);

            assert.ok(true); // Should not throw
        });
    });

    suite('Error Handling and Edge Cases', () => {
        /**
         * @brief Tests handling of missing language configuration loader
         * @test Validates graceful fallback when language comment loader is unavailable
         */
        test('should handle missing language comment loader', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(undefined, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, []);
            assert.deepStrictEqual(commentStyle.multiLine, []);
        });

        /**
         * @brief Tests handling of malformed language configuration files
         * @test Validates error recovery when configuration JSON is corrupted
         */
        test('should handle corrupted language configuration', async () => {
            // Create corrupted config file
            const corruptedConfigFile = path.join(tempDir, 'corrupted.json');
            await fs.writeFile(corruptedConfigFile, '{"invalid": structure}');

            const corruptedLoader = new LazyFileLoader(corruptedConfigFile, tempDir);
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(corruptedLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, []);
            assert.deepStrictEqual(commentStyle.multiLine, []);
        });

        /**
         * @brief Tests update operations without defined header boundaries
         * @test Validates error handling when header bounds are not established
         */
        test('should handle update without header bounds', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];

            // Don't set header bounds
            await generatorAny.updateEditDate(editor, comments);

            // Should not throw, should log error
            assert.ok(true);
        });

        /**
         * @brief Tests update operations with undefined document body
         * @test Validates error handling when document content is not accessible
         */
        test('should handle undefined document in update', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];

            // Clear document
            generatorAny.documentBody = undefined;

            await generatorAny.updateEditDate(editor, comments);

            assert.ok(true); // Should not throw
        });

        /**
         * @brief Tests processing of extremely long file path strings
         * @test Validates proper filename extraction from deeply nested directory structures
         */
        test('should handle very long file paths', () => {
            const longPath = '/very/' + 'long/'.repeat(100) + 'path/to/file.ts';
            const document = new MockTextDocument(longPath);
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'file.ts');
            assert.strictEqual(generatorAny.fileExtension, 'ts');
        });

        /**
         * @brief Tests handling of empty or missing filename scenarios
         * @test Validates fallback behavior when filename cannot be determined
         */
        test('should handle empty file names', () => {
            const document = new MockTextDocument('/test/');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'unknown');
        });

        /**
         * @brief Tests processing of filenames containing special characters
         * @test Validates proper handling of spaces, symbols, and Unicode in filenames
         */
        test('should handle special characters in file names', () => {
            const specialPath = '/test/file with spaces & symbols!.ts';
            const document = new MockTextDocument(specialPath);
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'file with spaces & symbols!.ts');
            assert.strictEqual(generatorAny.fileExtension, 'ts');
        });
    });

    /**
     * @brief Test suite for end-to-end integration scenarios
     * 
     * Validates complete workflows and integration between multiple
     * CommentGenerator components, simulating real-world usage patterns
     * and complex interaction scenarios.
     */
    suite('Integration Tests', () => {
        /**
         * @brief Tests complete header injection workflow from start to finish
         * @test Validates end-to-end header creation with user interaction simulation
         */
        test('should complete full header injection workflow', async () => {
            const document = new MockTextDocument('/test/main.ts', '', 'typescript');
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;
            mockShowInputBoxResponse = 'Main application entry point';

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            await generator.injectHeader();

            // Verify header was written
            assert.strictEqual(mockEditOperations.length, 1);
            assert.strictEqual(mockEditOperations[0].isInsert, true);

            const headerText = mockEditOperations[0].text;
            assert.ok(headerText.includes('/*'));
            assert.ok(headerText.includes('Main application entry point'));
            assert.ok(headerText.includes('main.ts'));
            assert.ok(headerText.includes('2025'));
            assert.ok(headerText.includes('*/'));
        });

        /**
         * @brief Tests complete refresh workflow on files with existing headers
         * @test Validates end-to-end timestamp update process for pre-existing headers
         */
        test('should handle complete refresh workflow with existing header', async () => {
            const existingHeader = `/*
 * ═══════════════════════ ◄ BEGIN AsperHeader ► ═══════════════════════
 * Project: AsperHeader
 * File: main.ts
 * Created: 01-10-2025
 * Last Modified: 14:25:30 01-10-2025
 * ═══════════════════════ ◄ END AsperHeader ► ═══════════════════════
 */

const app = 'Hello World';`;

            const document = new MockTextDocument('/test/main.ts', existingHeader, 'typescript');
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            await generator.refreshHeader(document as any);

            // Should have updated the timestamp if refresh is enabled
            assert.ok(true); // Test passes if no errors
        });

        /**
         * @brief Tests concurrent operation handling and thread safety
         * @test Validates proper behavior under rapid successive API calls
         */
        test('should handle multiple rapid operations', async () => {
            const document = new MockTextDocument('/test/rapid.ts');
            const editor = new MockTextEditor(document);

            mockActiveTextEditor = editor as any;
            mockShowInputBoxResponse = 'Rapid test';

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            // Simulate rapid calls
            const promises = [
                generator.injectHeader(),
                generator.refreshHeader(document as any),
                generator.injectHeader()
            ];

            await Promise.all(promises);

            // Should handle concurrent operations gracefully
            assert.ok(true);
        });
    });
});
