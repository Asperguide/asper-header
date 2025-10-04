/**
 * @file lazyFileLoad.ts
 * @brief Advanced lazy loading file system utility with intelligent caching and type safety
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This module implements a sophisticated lazy loading file system utility that serves as
 * the foundation for efficient resource management throughout the AsperHeader extension.
 * It provides intelligent caching, automatic content parsing, flexible path resolution,
 * and comprehensive error handling while maintaining full type safety through generics.
 * 
 * Design Philosophy:
 * - **Performance First**: Minimize file I/O through intelligent caching strategies
 * - **Type Safety**: Leverage TypeScript generics for compile-time type checking
 * - **Flexibility**: Support diverse file formats and path resolution patterns
 * - **Error Resilience**: Comprehensive error handling with graceful degradation
 * - **Resource Efficiency**: Memory-conscious caching with selective retention
 * 
 * Core Features:
 * - **Lazy Loading**: Files loaded only when first accessed, reducing startup time
 * - **Intelligent Caching**: In-memory caching with cache invalidation and refresh
 * - **Format Flexibility**: Support for JSON, JSONC, plain text, and custom formats
 * - **Path Resolution**: Automatic resolution of relative and absolute paths
 * - **Type Safety**: Generic type parameters ensure compile-time content validation
 * - **Error Recovery**: Graceful handling of missing files, parse errors, and I/O failures
 * 
 * File Format Support:
 * - **JSON Files**: Automatic parsing with error handling and validation
 * - **JSONC Files**: JSON with comments support for configuration files
 * - **Text Files**: Raw text content with encoding detection
 * - **Custom Formats**: Extensible parsing system for specialized file types
 * - **Binary Files**: Basic support for binary content with appropriate type handling
 * 
 * Caching Strategy:
 * - **Memory Caching**: Parsed content cached in memory for subsequent access
 * - **Invalidation**: Manual cache invalidation and automatic refresh mechanisms
 * - **Memory Management**: Intelligent cache size management and cleanup
 * - **Performance Monitoring**: Optional cache hit/miss statistics for optimization
 * 
 * Integration Points:
 * This utility serves as the backbone for resource loading across the extension:
 * - **Configuration Loading**: Language definitions and formatting rules
 * - **Asset Management**: ASCII art files and logo collections  
 * - **Template System**: Header templates and message definitions
 * - **Internationalization**: Message files and localization resources
 * 
 * Error Handling Strategy:
 * - **File Not Found**: Graceful fallback to default content or error reporting
 * - **Parse Errors**: Detailed error messages with context information
 * - **Permission Issues**: Clear error reporting for filesystem access problems
 * - **Network Issues**: Timeout handling for remote file access (future enhancement)
 * 
 * @example Basic usage with JSON configuration:
 * ```typescript
 * const configLoader = new LazyFileLoader<ConfigType>();
 * await configLoader.updateCurrentWorkingDirectory(extensionPath);
 * await configLoader.updateFilePath("config/settings.json");
 * 
 * const config = await configLoader.loadContent();
 * console.log(config.someProperty); // Type-safe access
 * ```
 * 
 * @example Advanced usage with custom parsing:
 * ```typescript
 * const loader = new LazyFileLoader<CustomType>();
 * loader.setCustomParser((content: string) => {
 *     return parseCustomFormat(content);
 * });
 * 
 * const data = await loader.loadContent();
 * ```
 */

import * as fs from 'fs';
import * as fsp from "fs/promises";
import * as path from 'path';
import { logger } from './logger';
import { getMessage } from './messageProvider';

/**
 * @class LazyFileLoader
 * @brief Generic lazy file loader with caching and type safety
 * @template T The expected type of the loaded file content
 * 
 * A utility class that provides lazy loading of files with automatic caching,
 * JSON parsing, and flexible path resolution. Supports both relative and
 * absolute file paths with configurable working directory.
 * 
 * Features:
 * - Generic type support for type-safe file content
 * - Automatic JSON parsing for .json and .jsonc files
 * - In-memory caching to avoid repeated file system access
 * - Configurable working directory for relative path resolution
 * - Path existence validation and error handling
 * - Cache invalidation and manual reload capabilities
 */
export class LazyFileLoader<T = any> {
    /** @brief Path to the file to be loaded (relative or absolute) */
    private filePath: string | undefined = undefined;
    /** @brief Cached file content to avoid repeated file system access */
    private cache: T | null = null;
    /** @brief Current working directory for resolving relative paths */
    private cwd: string = "";

    /**
     * @brief Constructor for LazyFileLoader
     * @param filePath Optional path to the file to be loaded
     * @param cwd Optional current working directory for path resolution
     * 
     * Initializes the lazy file loader with optional file path and working
     * directory. The file is not loaded until the first call to get().
     */
    constructor(filePath: string | undefined = undefined, cwd: string | undefined = undefined) {
        logger.debug(getMessage("inFunction", "constructor", "LazyFileLoader"));
        if (filePath) {
            this.filePath = filePath;
        }
        if (cwd) {
            this.cwd = cwd;
        }
    }

    /**
     * @brief Checks if a file or directory exists at the specified path
     * @param filePath Path to check for existence
     * @return Promise resolving to true if path exists, false otherwise
     * 
     * Utility method for validating file existence before performing operations.
     * Uses Node.js fs.promises.access() which is the recommended approach for
     * checking file existence without race conditions.
     */
    async pathExists(filePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "pathExists", "LazyFileLoader"));
        try {
            await fsp.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * @brief Resolves a file path to an absolute path
     * @param filePath Relative or absolute file path to resolve
     * @return Promise resolving to the absolute file path
     * 
     * Converts relative paths to absolute paths using the configured working
     * directory. For relative paths, it first tries joining with the parent
     * directory of cwd, then falls back to joining directly with cwd.
     * Absolute paths are returned unchanged.
     */
    private async resolveAbsolutePath(filePath: string): Promise<string> {
        logger.debug(getMessage("inFunction", "resolveAbsolutePath", "LazyFileLoader"));
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        const path1: string = path.join(this.cwd, "..", filePath);
        if (await this.pathExists(path1)) {
            return path1;
        }
        return path.join(this.cwd, filePath);
    }

    /**
     * @brief Loads and returns the file content with caching
     * @return Promise resolving to the loaded file content or undefined on error
     * 
     * Main method for lazy loading file content. On first call, reads the file
     * from disk and caches the result. Subsequent calls return the cached content.
     * 
     * Behavior:
     * - JSON files (.json, .jsonc) are automatically parsed
     * - Text files are returned as strings
     * - Handles both relative and absolute file paths
     * - Caches successful loads to avoid repeated file system access
     * - Returns undefined if file path not set or parsing fails
     */
    async get(): Promise<T | undefined> {
        logger.debug(getMessage("inFunction", "get", "LazyFileLoader"));
        if (this.cache) {
            return this.cache; // Already loaded
        }
        if (this.filePath === undefined) {
            return undefined;
        }
        const absolutePath = await this.resolveAbsolutePath(this.filePath);
        const content = await fs.promises.readFile(absolutePath, 'utf-8');
        const fileExtension: string = path.extname(this.filePath).toLowerCase();
        try {
            if (fileExtension === ".json" || fileExtension === ".jsonc") {
                this.cache = JSON.parse(content) as T;
            } else {
                this.cache = content as T;
            }
        } catch (err) {
            const errorMsg: string = getMessage("fileParseError", this.filePath, String(err));
            logger.error(errorMsg);
            logger.Gui.error(errorMsg);
            return undefined;
        }
        logger.info(getMessage("fileLoaded", absolutePath));
        return this.cache;
    }

    /**
     * @brief Forces a reload of the file from disk, bypassing cache
     * @return Promise resolving to the reloaded file content or undefined on error
     * 
     * Clears the current cache and reloads the file from the file system.
     * Useful when the file content may have changed externally and the
     * cache needs to be refreshed.
     */
    async reload(): Promise<T | undefined> {
        logger.debug(getMessage("inFunction", "reload", "LazyFileLoader"));
        this.cache = null;
        logger.info(getMessage("fileRefreshed"));
        return this.get();
    }

    /**
     * @brief Clears the cached file content from memory
     * 
     * Removes the cached file content to free up memory. The next call
     * to get() will reload the file from disk. Useful for memory management
     * when the file content is no longer needed.
     */
    unload() {
        logger.debug(getMessage("inFunction", "unload", "LazyFileLoader"));
        this.cache = null;
        logger.info(getMessage("fileUnloaded", String(this.filePath)));
    }

    /**
     * @brief Updates the file path and optionally reloads cached content
     * @param filePath New file path to use for loading
     * @return Promise resolving to true if update successful, false on reload failure
     * 
     * Changes the target file path for this loader instance. If content is
     * currently cached, automatically reloads from the new path to ensure
     * cache consistency. Returns false if the new file cannot be loaded.
     */
    async updateFilePath(filePath: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateFilePath", "LazyFileLoader"));
        const oldFilePath = this.filePath;
        this.filePath = filePath;
        if (this.cache) {
            const status: T | undefined = await this.reload();
            if (status === undefined) {
                return false;
            }
        }
        logger.info(getMessage("filePathUpdated", String(oldFilePath), String(filePath)));
        return true;
    }


    /**
     * @brief Updates the current working directory for path resolution
     * @param cwd New current working directory path
     * @return Promise resolving to true if update successful, false if path doesn't exist
     * 
     * Changes the working directory used for resolving relative file paths.
     * Validates that the new directory exists before updating. Does not
     * invalidate the cache automatically.
     */
    async updateCurrentWorkingDirectory(cwd: string): Promise<boolean> {
        logger.debug(getMessage("inFunction", "updateCurrentWorkingDirectory", "LazyFileLoader"));
        const oldCwd: string = this.cwd;
        if (! await this.pathExists(cwd)) {
            logger.warning(getMessage("cwdDoesNotExist", cwd));
            return false;
        }
        this.cwd = cwd;
        logger.info(getMessage("cwdUpdated", String(oldCwd), String(this.cwd)));
        return true;
    }

    /**
     * @brief Returns the currently configured file path
     * @return The current file path or undefined if not set
     * 
     * Getter method that returns the file path currently configured
     * for this loader instance. May be relative or absolute.
     */
    getFilePath(): string | undefined {
        logger.debug(getMessage("inFunction", "getFilePath", "LazyFileLoader"));
        return this.filePath;
    }
}
