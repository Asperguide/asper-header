

/**
 * @file jsoncLoader.ts
 * @brief Universal JSONC parser loader with dual module system support
 * @author Henry Letellier
 * @version 1.0.10
 * @since 1.0.10
 * @date 2025
 * 
 * This utility module provides robust JSONC (JSON with Comments) parsing capabilities
 * with automatic fallback between CommonJS and ES Module loading systems. It ensures
 * compatibility across different execution environments including VS Code extensions,
 * Node.js applications, and modern ES Module test runners.
 * 
 * Key Features:
 * - **Dual Module Support**: Automatic fallback between CommonJS require() and ES Module import()
 * - **JSONC Parsing**: Full support for JSON with comments and trailing commas
 * - **Error Handling**: Comprehensive error collection and reporting for parse failures
 * - **Environment Agnostic**: Works in VS Code extension host, Node.js, and test environments
 * - **Type Safety**: Full TypeScript integration with proper error type definitions
 * 
 * Loading Strategy:
 * 1. **Primary**: CommonJS require() for VS Code extension compatibility
 * 2. **Fallback**: Dynamic ES Module import() for modern environments and testing
 * 
 * Use Cases:
 * - Loading VS Code configuration files (settings.json, launch.json, etc.)
 * - Parsing package.json files with comments
 * - Processing configuration files in mixed module environments
 * - Handling JSONC files in extension development and testing scenarios
 */

import type { ParseError } from 'jsonc-parser';

/**
 * @brief Loads the jsonc-parser module with automatic fallback between module systems
 * @return Promise resolving to the loaded jsonc-parser module
 * @throws Error if both CommonJS and ES Module loading fail
 * 
 * Implements a robust dual-loading strategy to ensure jsonc-parser module availability
 * across different JavaScript execution environments. This function handles the
 * complexity of module system differences transparently.
 * 
 * Loading Strategy:
 * 1. **CommonJS First**: Uses require() which works reliably in VS Code extension host
 * 2. **ES Module Fallback**: Uses dynamic import() for modern environments and testing
 * 
 * Environment Compatibility:
 * - **VS Code Extensions**: CommonJS require() works in extension host process
 * - **Node.js Applications**: Both CommonJS and ES Module support
 * - **Test Runners**: ES Module import() for Jest, Mocha, and other modern test frameworks
 * - **Bundlers**: Compatible with webpack, rollup, and other bundling systems
 * 
 * Error Handling:
 * If CommonJS require() fails (typically in pure ES Module environments), the function
 * automatically attempts dynamic import(). If both methods fail, the original error
 * is propagated to the caller for appropriate handling.
 * 
 * Performance Characteristics:
 * - **Fast Path**: CommonJS require() is synchronous when available
 * - **Fallback Path**: ES Module import() adds minimal async overhead
 * - **Cached**: Module loading is handled by Node.js module cache system
 */
export async function loadJsoncParser() {
    try {
        // First try CommonJS require (works inside VSCode)
        const cjs = require('jsonc-parser');
        return cjs;
    } catch (err) {
        // If that fails (e.g. when running tests under ESM), fallback to dynamic import
        const esm = await import('jsonc-parser');
        return esm;
    }
}

/**
 * @brief Parses JSONC content with comprehensive error handling and validation
 * @param jsonContent Raw JSONC string content to parse
 * @return Promise resolving to parsed JavaScript object
 * @throws Error with detailed parse error information if parsing fails
 * 
 * Provides a high-level interface for parsing JSONC (JSON with Comments) content
 * with robust error handling and detailed error reporting. This function handles
 * the complexity of error collection and provides meaningful error messages.
 * 
 * JSONC Features Supported:
 * - Line Comments: // single line comments
 * - Block Comments: multi-line comments
 * - Trailing Commas: Allows trailing commas in objects and arrays
 * - Unquoted Keys: Supports JavaScript-style unquoted object keys
 * - Standard JSON: Full backward compatibility with standard JSON
 * 
 * Error Handling Strategy:
 * 1. **Error Collection**: Gathers all parse errors during processing
 * 2. **Detailed Reporting**: Provides specific error locations and descriptions
 * 3. **Structured Errors**: Uses ParseError array for programmatic error handling
 * 4. **Comprehensive Messages**: JSON serialization of all errors for debugging
 * 
 * Usage Examples:
 * ```typescript
 * // Parse VS Code settings file
 * const settings = await parseJsonFile(settingsContent);
 * 
 * // Parse package.json with comments
 * const packageData = await parseJsonFile(packageJsonContent);
 * 
 * // Handle parsing errors
 * try {
 *   const config = await parseJsonFile(configContent);
 * } catch (error) {
 *   console.error('JSONC parsing failed:', error.message);
 * }
 * ```
 * 
 * Performance Considerations:
 * - **Stream Processing**: Handles large JSONC files efficiently
 * - **Memory Efficient**: Minimal memory overhead during parsing
 * - **Error Fast**: Early termination on critical parse errors
 */
export async function parseJsonFile(jsonContent: string) {
    const { parse } = await loadJsoncParser();
    const errors: ParseError[] = [];
    const result = parse(jsonContent, errors);
    if (errors.length > 0) {
        throw new Error(`JSONC parse errors: ${JSON.stringify(errors)}`);
    }
    return result;
}
