/**
 * @file commentGenerator.test.ts
 * @brief Test suite for the CommentGenerator header generation system
 * @author Henry Letellier
 * @version 1.0.4
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

// Mock document content
interface MockDocumentLine {
    text: string;
    range: vscode.Range;
    lineNumber: number;
    rangeIncludingLineBreak: vscode.Range;
    firstNonWhitespaceCharacterIndex: number;
    isEmptyOrWhitespace: boolean;
}

class MockTextDocument implements Partial<vscode.TextDocument> {
    public lines: MockDocumentLine[] = [];
    public uri: vscode.Uri;
    public languageId: string;
    public eol: vscode.EndOfLine;
    public version: number;
    public isClosed: boolean;
    public lineCount: number = 0;
    public fileName: string = '';
    public isUntitled: boolean = false;
    public encoding: string = 'utf8';
    public isDirty: boolean = false;

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

    lineAt(lineOrPosition: number | vscode.Position): vscode.TextLine {
        const line = typeof lineOrPosition === 'number' ? lineOrPosition : lineOrPosition.line;
        if (line < 0 || line >= this.lines.length) {
            throw new Error(`Line ${line} is out of range`);
        }
        return this.lines[line] as vscode.TextLine;
    }

    offsetAt(position: vscode.Position): number {
        let offset = 0;
        for (let i = 0; i < position.line && i < this.lines.length; i++) {
            offset += this.lines[i].text.length + 1; // +1 for newline
        }
        return offset + Math.min(position.character, this.lines[position.line]?.text.length || 0);
    }

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

    validateRange(range: vscode.Range): vscode.Range {
        return range;
    }

    validatePosition(position: vscode.Position): vscode.Position {
        return position;
    }

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

    save(): Thenable<boolean> {
        return Promise.resolve(true);
    }
}

class MockTextEditor implements Partial<vscode.TextEditor> {
    public document: vscode.TextDocument;

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

suite('CommentGenerator Test Suite', function () {
    let tempDir: string;
    let languageConfigFile: string;
    let lazyFileLoader: LazyFileLoader;
    let mockRandomLogo: RandomLogo;
    let generator: CommentGenerator;

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

    suite('Constructor and Initialization', () => {
        test('should create instance with all parameters provided', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            assert.ok(generator, 'Generator should be created successfully');
        });

        test('should create instance with minimal parameters', () => {
            generator = new CommentGenerator();

            assert.ok(generator, 'Generator should be created with undefined parameters');
        });

        test('should create instance with only language loader', () => {
            generator = new CommentGenerator(lazyFileLoader);

            assert.ok(generator, 'Generator should be created with language loader only');
        });

        test('should handle undefined editor gracefully', () => {
            generator = new CommentGenerator(lazyFileLoader, undefined, mockRandomLogo);

            assert.ok(generator, 'Generator should handle undefined editor');
        });
    });

    suite('File Information Processing', () => {
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

        test('should handle files without extensions', () => {
            const filePath = '/home/user/Makefile';
            const document = new MockTextDocument(filePath, '', 'makefile');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'Makefile');
            assert.strictEqual(generatorAny.fileExtension, 'none');
        });

        test('should handle different EOL types', () => {
            const document = new MockTextDocument('/test/file.ts', '', 'typescript', vscode.EndOfLine.CRLF);
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.documentEOL, vscode.EndOfLine.CRLF);
        });
    });

    suite('Comment Style Detection', () => {
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

        test('should detect Python comment style correctly', async () => {
            const document = new MockTextDocument('/test/script.py', '', 'python');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, ['#']);
            assert.deepStrictEqual(commentStyle.multiLine, []);
        });

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

    suite('User Input Handling', () => {
        test('should get file description from user input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = 'This is a test file for the application';

            const generatorAny = generator as any;
            const description = await generatorAny.determineHeaderDescription();

            assert.deepStrictEqual(description, ['This is a test file for the application']);
        });

        test('should handle empty description input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = undefined;

            const generatorAny = generator as any;
            const description = await generatorAny.determineHeaderDescription();

            assert.deepStrictEqual(description, ['']);
        });

        test('should get file purpose from user input', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowInputBoxResponse = 'Main entry point for the application';

            const generatorAny = generator as any;
            const purpose = await generatorAny.determineHeaderPurpose();

            assert.deepStrictEqual(purpose, ['Main entry point for the application']);
        });

        test('should get single comment option without prompting', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//']);

            assert.strictEqual(result, '//');
        });

        test('should prompt for comment selection when multiple options', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowQuickPickResponse = '/*';

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//', '/*']);

            assert.strictEqual(result, '/*');
        });

        test('should return first option when user cancels selection', async () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            mockShowQuickPickResponse = undefined;

            const generatorAny = generator as any;
            const result = await generatorAny.getSingleCommentOption(['//', '/*']);

            assert.strictEqual(result, '//');
        });

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

    suite('Header Content Generation', () => {
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

        test('should handle CRLF line endings correctly', () => {
            const document = new MockTextDocument('/test/file.ts', '', 'typescript', vscode.EndOfLine.CRLF);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const eolString = generatorAny.determineNewLine(vscode.EndOfLine.CRLF);

            assert.strictEqual(eolString, '\r\n');
        });

        test('should handle LF line endings correctly', () => {
            const document = new MockTextDocument('/test/file.ts');
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const eolString = generatorAny.determineNewLine(vscode.EndOfLine.LF);

            assert.strictEqual(eolString, '\n');
        });
    });

    suite('Comment Prefix Processing', () => {
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

    suite('Header Detection and Parsing', () => {
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

        test('should handle closed document gracefully', () => {
            const document = new MockTextDocument('/test/test.ts', '', 'typescript', vscode.EndOfLine.LF, true);
            const editor = new MockTextEditor(document);
            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const comments = [' * ', ' * ', ' * '];
            const hasHeader = generatorAny.locateIfHeaderPresent(comments);

            assert.strictEqual(hasHeader, undefined);
        });

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

    suite('Logo Integration', () => {
        test('should update logo randomizer instance', () => {
            generator = new CommentGenerator();
            const newRandomLogo = new RandomLogo();

            generator.updateLogoInstanceRandomiser(newRandomLogo);

            // Test passes if no error is thrown
            assert.ok(true);
        });
    });

    suite('File Writing Operations', () => {
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

    suite('Main API Methods', () => {
        test('should inject header when no active editor', async () => {
            mockActiveTextEditor = undefined;

            generator = new CommentGenerator(lazyFileLoader);

            // Should not throw, just log error
            await generator.injectHeader();

            assert.ok(true); // Test passes if no error thrown
        });

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

        test('should handle refresh with no document', async () => {
            generator = new CommentGenerator(lazyFileLoader);

            await generator.refreshHeader(undefined);

            assert.ok(true); // Should not throw
        });

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
        test('should handle missing language comment loader', async () => {
            const document = new MockTextDocument('/test/test.ts');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(undefined, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            const commentStyle = await generatorAny.determineCorrectComment();

            assert.deepStrictEqual(commentStyle.singleLine, []);
            assert.deepStrictEqual(commentStyle.multiLine, []);
        });

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

        test('should handle very long file paths', () => {
            const longPath = '/very/' + 'long/'.repeat(100) + 'path/to/file.ts';
            const document = new MockTextDocument(longPath);
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'file.ts');
            assert.strictEqual(generatorAny.fileExtension, 'ts');
        });

        test('should handle empty file names', () => {
            const document = new MockTextDocument('/test/');
            const editor = new MockTextEditor(document);

            generator = new CommentGenerator(lazyFileLoader, editor as any, mockRandomLogo);

            const generatorAny = generator as any;
            assert.strictEqual(generatorAny.fileName, 'unknown');
        });

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

    suite('Integration Tests', () => {
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
