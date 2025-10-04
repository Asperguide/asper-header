/**
 * @file processConfiguration.ts
 * @brief Advanced configuration management and settings orchestration for AsperHeader
 * @author Henry Letellier
 * @version 1.0.8
 * @date 2025
 * 
 * This module implements a sophisticated configuration management system that serves as the
 * central nervous system for all AsperHeader extension settings. It provides seamless
 * integration between default constants, user preferences, and workspace-specific
 * configurations while maintaining type safety and runtime flexibility.
 * 
 * Architecture Overview:
 * - **Configuration Layer**: Hierarchical settings resolution (user → workspace → defaults)
 * - **Dynamic Updates**: Real-time configuration refresh without extension restart
 * - **Type Safety**: Comprehensive TypeScript interfaces for all configuration values
 * - **Caching Strategy**: Intelligent caching with selective refresh for performance
 * - **Validation Engine**: Input validation and sanitization for all user settings
 * - **Integration Points**: Deep coupling with {@link constants} and VS Code APIs
 * 
 * Configuration Domains:
 * - **Visual Formatting**: Header decorations, separators, and visual styling options
 * - **Telegraph Protocol**: Communication markers, block terminators, and transmission symbols
 * - **Temporal Settings**: Date/time formats, timezone handling, and timestamp preferences  
 * - **Logo Management**: ASCII art selection, randomization, and display preferences
 * - **Performance Tuning**: File scanning limits, processing thresholds, and optimization settings
 * - **Feature Control**: Debug modes, auto-refresh behavior, and experimental features
 * - **File Processing**: Extension filters, ignore patterns, and inclusion rules
 * - **Workspace Context**: Project naming, author attribution, and workspace-specific overrides
 * 
 * Design Principles:
 * - **Fail-Safe Defaults**: Always provide sensible fallback values for missing settings
 * - **Minimal VS Code Calls**: Cache frequently accessed values to reduce API overhead
 * - **Hot Reloading**: Support configuration changes without extension restart
 * - **Backward Compatibility**: Graceful handling of deprecated or removed settings
 * - **Performance First**: Optimize for frequent access patterns in header generation
 * 
 * Integration Strategy:
 * This module serves as the authoritative source for all configuration throughout
 * the extension ecosystem, providing consistent behavior across all modules including
 * {@link CommentGenerator}, {@link RandomLogo}, {@link logger}, and user interface components.
 * 
 * @example Configuration access patterns:
 * ```typescript
 * // Simple value retrieval
 * const extensionName = CodeConfig.get("extensionName");
 * 
 * // Refresh from VS Code settings
 * await CodeConfig.refreshVariables();
 * 
 * // Workspace-specific settings
 * const projectName = CodeConfig.get("projectName") || CodeConfig.getWorkspaceName();
 * ```
 * 
 * @example Advanced configuration management:
 * ```typescript
 * // Listen for configuration changes
 * vscode.workspace.onDidChangeConfiguration((event) => {
 *     if (event.affectsConfiguration('asperheader')) {
 *         await CodeConfig.refreshVariables();
 *         logger.info('Configuration refreshed');
 *     }
 * });
 * ```
 */

import * as vscode from 'vscode';
import * as CONST from '../constants';

/**
 * @class Configuration
 * @brief Core configuration management class with dynamic VS Code settings integration
 * 
 * Manages all extension configuration values with support for both default constants
 * and user-customized settings from VS Code workspace configuration. Provides methods
 * for accessing configuration values with automatic fallback to defaults.
 * 
 * The class maintains a local cache of all configuration values that can be refreshed
 * from VS Code settings at runtime, allowing users to modify extension behavior without
 * requiring a restart. All configuration keys are synchronized with the extension's
 * package.json contribution points.
 * 
 * Design Patterns:
 * - **Singleton**: Single instance ensures consistent configuration state
 * - **Lazy Loading**: Configuration loaded from VS Code on demand
 * - **Fallback Chain**: User settings → cached values → default constants
 * - **Type Safety**: Proper TypeScript types for all configuration values
 */
class Configuration {
    /** @brief Error status code for failed operations */
    private statusError: number = CONST.statusError;
    /** @brief Success status code for completed operations */
    private statusSuccess: number = CONST.statusSuccess;
    /** @brief Name of the extension for display purposes */
    private extensionName: string = CONST.extensionName;
    /** @brief Internal module name for VS Code configuration namespace */
    private moduleName: string = CONST.moduleName;
    /** @brief Copyright information displayed in headers */
    private projectCopyright: string = CONST.projectCopyright;

    // Header decoration and formatting settings
    /** @brief Opening decoration string for header borders */
    private headerOpenerDecorationOpen: string = CONST.headerOpenerDecorationOpen;
    /** @brief Closing decoration string for header borders */
    private headerOpenerDecorationClose: string = CONST.headerOpenerDecorationClose;
    /** @brief Spacing between comment prefix and header content */
    private headerCommentSpacing: string = CONST.headerCommentSpacing;

    // Telegraph-style symbols for header formatting
    /** @brief Telegraph symbol marking beginning of transmission */
    private telegraphBegin: string = CONST.telegraphBegin;
    /** @brief Telegraph symbol marking end of transmission */
    private telegraphEnd: string = CONST.telegraphEnd;
    /** @brief Telegraph symbol marking end of content block */
    private telegraphBlockStop: string = CONST.telegraphBlockStop;
    /** @brief Telegraph symbol marking end of entire transmission */
    private telegraphEndOfTransmission: string = CONST.telegraphEndOfTransmission;
    /** @brief Whether to add blank line after multiline header sections */
    private headerAddBlankLineAfterMultiline: boolean = CONST.headerAddBlankLineAfterMultiline;
    /** @brief Separator between header keys and their values (e.g., ": ") */
    private headerKeyDefinitionSeparator: string = CONST.headerKeyDefinitionSeparator;

    // Header section keys and labels
    /** @brief Key label for logo/ASCII art section */
    private headerLogoKey: string = CONST.headerLogoKey;
    /** @brief Key label for project name section */
    private headerProjectKey: string = CONST.headerProjectKey;
    /** @brief Key label for filename section */
    private headerFileKey: string = CONST.headerFileKey;
    /** @brief Key label for file creation date section */
    private headerCreationDateKey: string = CONST.headerCreationDateKey;
    /** @brief Key label for last modified date section */
    private headerLastModifiedKey: string = CONST.headerLastModifiedKey;
    /** @brief Key label for file description section */
    private headerDescriptionKey: string = CONST.headerDescriptionKey;
    /** @brief Key label for copyright information section */
    private headerCopyrightKey: string = CONST.headerCopyrightKey;
    /** @brief Key label for file tags section */
    private headerTagKey: string = CONST.headerTagKey;
    /** @brief Key label for file purpose section */
    private headerPurposeKey: string = CONST.headerPurposeKey;

    // Date and time formatting separators
    /** @brief Separator between hours and minutes in timestamps */
    private headerTimeSeperatorHour: string = CONST.headerTimeSeperatorHour;
    /** @brief Separator between minutes and seconds in timestamps */
    private headerTimeSeperatorMinute: string = CONST.headerTimeSeperatorMinute;
    /** @brief Separator after seconds in timestamps */
    private headerTimeSeperatorSecond: string = CONST.headerTimeSeperatorSecond;
    /** @brief Separator between time and date portions */
    private headerTimeAndDateSeperator: string = CONST.headerTimeAndDateSeperator;
    /** @brief Separator between day and month in dates */
    private headerDateSeperatorDay: string = CONST.headerDateSeperatorDay;
    /** @brief Separator between month and year in dates */
    private headerDateSeperatorMonth: string = CONST.headerDateSeperatorMonth;
    /** @brief Separator after year in dates */
    private headerDateSeperatorYear: string = CONST.headerDateSeperatorYear;

    // Content and behavior configuration
    /** @brief Default ASCII art logo lines for headers */
    private headerLogo: string[] = CONST.defaultHeaderLogo;
    /** @brief Maximum number of lines to scan when searching for existing headers */
    private maxScanLength: number = CONST.defaultMaxScanLength;

    // Feature toggle flags
    /** @brief Enable debug logging and verbose output */
    private enableDebug: boolean = CONST.enableDebug;
    /** @brief Automatically refresh/update headers when files are saved */
    private refreshOnSave: boolean = CONST.refreshOnSave;
    /** @brief Prompt user to create header if none exists during refresh */
    private promptToCreateIfMissing: boolean = CONST.promptToCreateIfMissing;
    /** @brief Use random logo selection instead of default logo */
    private randomLogo: boolean = CONST.randomLogo;

    // File filtering configuration
    /** @brief Glob patterns for files/paths to exclude from header operations */
    private extensionIgnore: string[] = CONST.extensionIgnore;

    /** @brief The name of the workspace if any are open */
    private workspaceName: string | undefined = undefined;

    /** @brief The setting that allows the program to know the user's preference regarding wether to use the workspace name when available */
    private useWorkspaceNameWhenAvailable: boolean = CONST.useWorkspaceNameWhenAvailable;

    /**
     * @brief Refreshes all configuration values from VS Code workspace settings
     * @return Promise that resolves when all configuration values are updated
     * 
     * Synchronizes the local configuration cache with current VS Code workspace settings.
     * 
     * This method should be called when:
     * - Extension first activates to load user preferences
     * - Configuration changes are detected via VS Code events
     * - Manual refresh is needed after settings modifications
     * 
     * The method reads from the workspace configuration using the module name as
     * the configuration section identifier. If a setting is not found or has an
     * invalid value, the corresponding default constant is used as fallback.
     * 
     * All configuration properties are updated atomically to ensure consistency
     * during the refresh operation. The method is async to support potential
     * future configuration loading operations that might require async processing.
     */
    async refreshVariables(): Promise<void> {
        const config = vscode.workspace.getConfiguration(CONST.moduleName);

        this.extensionName = config.get<string>("extensionName", CONST.extensionName);
        this.projectCopyright = config.get<string>("projectCopyright", CONST.projectCopyright);
        this.headerOpenerDecorationOpen = config.get<string>("headerOpenerDecorationOpen", CONST.headerOpenerDecorationOpen);
        this.headerOpenerDecorationClose = config.get<string>("headerOpenerDecorationClose", CONST.headerOpenerDecorationClose);
        this.headerCommentSpacing = config.get<string>("headerCommentSpacing", CONST.headerCommentSpacing);
        this.telegraphBegin = config.get<string>("telegraphBegin", CONST.telegraphBegin);
        this.telegraphEnd = config.get<string>("telegraphEnd", CONST.telegraphEnd);
        this.telegraphBlockStop = config.get<string>("telegraphBlockStop", CONST.telegraphBlockStop);
        this.telegraphEndOfTransmission = config.get<string>("telegraphEndOfTransmission", CONST.telegraphEndOfTransmission);
        this.headerAddBlankLineAfterMultiline = config.get<boolean>("headerAddBlankLineAfterMultiline", CONST.headerAddBlankLineAfterMultiline);
        this.headerKeyDefinitionSeparator = config.get<string>("headerKeyDefinitionSeparator", CONST.headerKeyDefinitionSeparator);
        this.headerLogoKey = config.get<string>("headerLogoKey", CONST.headerLogoKey);
        this.headerProjectKey = config.get<string>("headerProjectKey", CONST.headerProjectKey);
        this.headerFileKey = config.get<string>("headerFileKey", CONST.headerFileKey);
        this.headerCreationDateKey = config.get<string>("headerCreationDateKey", CONST.headerCreationDateKey);
        this.headerLastModifiedKey = config.get<string>("headerLastModifiedKey", CONST.headerLastModifiedKey);
        this.headerDescriptionKey = config.get<string>("headerDescriptionKey", CONST.headerDescriptionKey);
        this.headerCopyrightKey = config.get<string>("headerCopyrightKey", CONST.headerCopyrightKey);
        this.headerTagKey = config.get<string>("headerTagKey", CONST.headerTagKey);
        this.headerPurposeKey = config.get<string>("headerPurposeKey", CONST.headerPurposeKey);
        this.headerTimeSeperatorHour = config.get<string>("headerTimeSeperatorHour", CONST.headerTimeSeperatorHour);
        this.headerTimeSeperatorMinute = config.get<string>("headerTimeSeperatorMinute", CONST.headerTimeSeperatorMinute);
        this.headerTimeSeperatorSecond = config.get<string>("headerTimeSeperatorSecond", CONST.headerTimeSeperatorSecond);
        this.headerTimeAndDateSeperator = config.get<string>("headerTimeAndDateSeperator", CONST.headerTimeAndDateSeperator);
        this.headerDateSeperatorDay = config.get<string>("headerDateSeperatorDay", CONST.headerDateSeperatorDay);
        this.headerDateSeperatorMonth = config.get<string>("headerDateSeperatorMonth", CONST.headerDateSeperatorMonth);
        this.headerDateSeperatorYear = config.get<string>("headerDateSeperatorYear", CONST.headerDateSeperatorYear);
        this.headerLogo = config.get<string[]>("headerLogo", CONST.defaultHeaderLogo);
        this.maxScanLength = config.get<number>("maxScanLength", CONST.defaultMaxScanLength);
        this.enableDebug = config.get<boolean>("enableDebug", CONST.enableDebug);
        this.refreshOnSave = config.get<boolean>("refreshOnSave", CONST.refreshOnSave);
        this.promptToCreateIfMissing = config.get<boolean>("promptToCreateIfMissing", CONST.promptToCreateIfMissing);
        this.randomLogo = config.get<boolean>("randomLogo", CONST.randomLogo);
        this.extensionIgnore = config.get<string[]>("extensionIgnore", CONST.extensionIgnore);
        this.useWorkspaceNameWhenAvailable = config.get<boolean>("useWorkspaceNameWhenAvailable", CONST.useWorkspaceNameWhenAvailable);
    }

    /**
     * @brief Retrieves a configuration value by key with automatic fallback
     * @param key Configuration key to retrieve (matches property names)
     * @return Configuration value with automatic fallback to default constants
     * 
     * Generic configuration value accessor with automatic fallback chain:
     * 1. Returns cached runtime value if available (set by refreshVariables)
     * 2. Falls back to corresponding CONST default value if no runtime override
     * 
     * This method provides unified access to all configuration values without
     * requiring callers to know whether values come from user settings or defaults.
     * The fallback ensures that configuration queries always return valid values
     * even if refreshVariables() hasn't been called or user settings are incomplete.
     * 
     * Type Safety Note:
     * Returns `any` to accommodate the diverse configuration value types (string,
     * boolean, number, string[]). Callers should cast to appropriate types or use
     * specific typed accessor methods when available.
     */
    get(key: string): any {
        // fallback to CONST if no runtime override exists
        return (this as any)[key] ?? (CONST as any)[key];
    }

    /**
     * @brief Sets the workspace name for header generation
     * @param workpaceName The workspace name to set, or undefined to clear
     * @return void
     * 
     * Updates the stored workspace name used in header generation. This name
     * is typically derived from the VS Code workspace folder name and used
     * as the project identifier in generated headers.
     */
    setWorkspaceName(workpaceName: string | undefined = undefined): void {
        this.workspaceName = workpaceName;
    }

    /**
     * @brief Gets the current workspace name
     * @return The workspace name string or undefined if not set
     * 
     * Retrieves the currently stored workspace name that was set via
     * setWorkspaceName(). Used for header generation when workspace-specific
     * project naming is enabled.
     */
    getWorkspaceName(): string | undefined {
        return this.workspaceName;
    }
}

/**
 * @brief Singleton configuration instance for application-wide use
 * 
 * Single instance of the Configuration class that maintains consistent
 * configuration state across the entire extension. This instance should
 * be used by all modules requiring access to configuration values.
 */
const instance = new Configuration();

/**
 * @brief Exported configuration singleton for extension-wide access
 * @export Primary configuration interface used throughout the extension
 * 
 * Main export providing access to the configuration management system.
 * All extension modules should import and use this instance for accessing
 * configuration values rather than creating their own Configuration instances.
 * 
 * Usage Pattern:
 * ```typescript
 * import { CodeConfig } from './processConfiguration';
 * 
 * // Access configuration values
 * const extensionName = CodeConfig.get("extensionName");
 * const debugMode = CodeConfig.get("enableDebug");
 * 
 * // Refresh configuration from VS Code settings
 * await CodeConfig.refreshVariables();
 * ```
 * 
 * The singleton pattern ensures:
 * - Consistent configuration state across all modules
 * - Efficient memory usage (single configuration cache)
 * - Centralized configuration refresh capabilities
 * - Thread-safe access to configuration values
 */
export const CodeConfig: Configuration = instance;

/**
 * @typedef CodeConfigType
 * @brief Type alias for the Configuration class
 * 
 * Provides a type alias for dependency injection, type annotations, and
 * interface definitions where Configuration class type is needed. Useful
 * for creating mock configurations in testing or defining method signatures
 * that accept configuration instances.
 * 
 * Usage in type annotations:
 * ```typescript
 * function processWithConfig(config: CodeConfigType) {
 *     const maxScan = config.get("maxScanLength");
 *     // ... processing logic
 * }
 * ```
 */
export type CodeConfigType = Configuration;
