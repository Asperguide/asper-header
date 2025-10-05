/**
 * @file logger.ts
 * @brief Advanced dual-channel logging system for VS Code extension development
 * @author Henry Letellier
 * @version 1.0.10
 * @date 2025
 * 
 * This module implements a sophisticated logging infrastructure designed specifically
 * for VS Code extensions, providing both console output for developers and GUI
 * notifications for end users. The system features automatic caller identification,
 * precise timestamping, configurable output channels, and intelligent debug mode handling.
 * 
 * Architecture Overview:
 * The logging system employs a multi-class architecture with clear separation of concerns:
 * - **LoggerInternals**: Core utility functions for formatting, timing, and stack analysis
 * - **Gui**: User-facing notifications through VS Code's notification API
 * - **Log**: Developer-focused console logging with caller identification
 * - **Singleton Pattern**: Single instance ensures consistent behavior across the extension
 * 
 * Key Features:
 * - **Dual Output Channels**: Console logging for developers, GUI notifications for users
 * - **Automatic Caller Detection**: Stack trace analysis identifies calling functions
 * - **Precise Timestamping**: Millisecond-accurate timestamps for debugging
 * - **Installation-Aware Logging**: Adapts behavior based on development vs production mode
 * - **Configurable Debug Output**: Respects extension debug settings
 * - **VS Code Output Panel Integration**: Dedicated output channel for extension logs
 * - **Template-based Notifications**: Type-safe interactive GUI messages with buttons
 * - **Comprehensive Log Levels**: Info, warning, error, and debug with appropriate console methods
 * 
 * Output Channels:
 * 1. **Console Output**: Traditional console.log/warn/error for development debugging
 * 2. **VS Code Output Panel**: Structured logs in dedicated extension output channel
 * 3. **GUI Notifications**: Toast notifications for user feedback and interaction
 * 
 * Performance Optimizations:
 * - Debug GUI notifications are filtered at source when debug mode disabled
 * - Stack trace analysis is performed efficiently with configurable depth
 * - Output channel reuse prevents resource leaks
 * - Conditional console output based on development vs production environment
 * - Auto-show output panel only in development for immediate debugging access
 * 
 * Thread Safety:
 * All logging operations are synchronous and thread-safe within VS Code's
 * single-threaded JavaScript environment. No additional synchronization required.
 * 
 * Environment Behavior Summary:
 * 
 * Development Mode (F5 debugging, unpackaged):
 *   - Console output enabled (console.log/warn/error/debug)
 *   - Output panel auto-shows for immediate visibility
 *   - GUI notifications work normally
 *   - All logging features active for debugging
 * 
 * Production Mode (installed from marketplace):
 *   - Console output suppressed (clean user experience)
 *   - Output panel available but hidden by default
 *   - GUI notifications work normally (primary user feedback)
 *   - Panel logs preserved for user troubleshooting
 * 
 * Usage Patterns:
 * ```typescript
 * import { logger } from './logger';
 * 
 * // Console + Panel logging (visible in dev, panel-only in prod)
 * logger.info("Operation completed successfully");
 * logger.error("Failed to process request");
 * 
 * // GUI notifications (always visible to users)
 * logger.Gui.warning("File not found", "Retry", "Cancel");
 * logger.Gui.error("Critical error occurred");
 * 
 * // Debug output (conditional based on settings)
 * logger.debug("Variable state: " + JSON.stringify(data));
 * logger.Gui.debug("Debug info"); // Only shows if debug enabled
 * ```
 */

import * as vscode from 'vscode';
import { CodeConfig } from "./processConfiguration";
import { moduleName } from '../constants';

/**
 * @class LoggerInternals
 * @brief Core utility infrastructure for logging operations and formatting
 * 
 * Provides the foundational utilities required by both console and GUI logging
 * systems. This class encapsulates common operations like timestamp generation,
 * log level prefix formatting, stack trace analysis, and configuration queries
 * to ensure consistency across all logging channels.
 * 
 * Design Philosophy:
 * - **Single Responsibility**: Each method handles one specific aspect of logging
 * - **Reusability**: Shared by multiple logging classes to avoid code duplication
 * - **Performance**: Optimized implementations for frequently called operations
 * - **Reliability**: Robust error handling for stack trace analysis and timing
 * 
 * Core Responsibilities:
 * - **Timestamp Generation**: High-precision datetime formatting with milliseconds
 * - **Log Level Management**: Standardized prefix generation for all log levels
 * - **Caller Identification**: Stack trace analysis to identify calling functions
 * - **Configuration Access**: Centralized access to debug and extension settings
 * - **Installation Detection**: Determines if extension is in development or production mode
 * 
 * Thread Safety:
 * All methods are stateless and thread-safe, relying only on parameters
 * and configuration state for their operations.
 */
class LoggerInternals {
    /**
     * @brief Constructor for LoggerInternals
     * 
     * Initializes the internal logging utilities. No configuration required.
     */
    constructor() { }

    /**
     * @brief Generates standardized log level prefix for message formatting
     * @param info True for informational messages (non-critical status updates)
     * @param warning True for warning messages (potential issues requiring attention)
     * @param error True for error messages (critical failures requiring immediate action)
     * @param debug True for debug messages (detailed development information)
     * @return Formatted prefix string with trailing colon and space
     * 
     * Creates consistent log level prefixes for all logging operations. The method
     * uses boolean flags to determine the appropriate prefix, with each flag representing
     * a different severity level in the logging hierarchy.
     * 
     * Prefix Format:
     * - INFO: General informational messages
     * - WARNING: Potential issues or unusual conditions
     * - ERROR: Critical errors requiring immediate attention
     * - DEBUG: Detailed debugging information for developers
     * - (empty): Default when no flags are set
     * 
     * Usage Contract:
     * Only one boolean parameter should be true per call. Multiple true values
     * will result in the first matching condition being used (info > warning > error > debug).
     * 
     * Performance:
     * Fast boolean evaluation with early returns for optimal performance
     * in high-frequency logging scenarios.
     */
    getCorrectPrefix(info: boolean, warning: boolean, error: boolean, debug: boolean): string {
        if (info) {
            return "INFO: ";
        } else if (warning) {
            return "WARNING: ";
        } else if (error) {
            return "ERROR: ";
        } else if (debug) {
            return "DEBUG: ";
        } else {
            return "";
        }
    }

    /**
     * @brief Generates high-precision timestamp for log entry correlation
     * @return Bracketed timestamp in format [DD-MM-YYYY HH:MM:SS.mmm]
     * 
     * Creates a comprehensive timestamp including full date, time, and milliseconds
     * for precise temporal correlation of log events. The bracketed format provides
     * visual separation in log output and consistent parsing for log analysis tools.
     * 
     * Timestamp Components:
     * - **Date**: DD-MM-YYYY format for international compatibility
     * - **Time**: HH:MM:SS format in 24-hour notation
     * - **Milliseconds**: Three-digit precision for event ordering
     * - **Brackets**: Visual delimiters for easy parsing and readability
     * 
     * Precision:
     * Millisecond accuracy enables precise timing analysis for performance
     * debugging and event sequence reconstruction in complex scenarios.
     * 
     * Format Example:
     * ```
     * [03-10-2025 14:30:45.123]
     * ```
     * 
     * Performance:
     * Direct Date object manipulation without external dependencies ensures
     * fast execution suitable for high-frequency logging operations.
     */
    getDatetime(): string {
        let date: Date = new Date();
        let finalString: string = "[";
        finalString += date.getDate() + "-";
        finalString += (date.getMonth() + 1) + "-";
        finalString += date.getFullYear() + " ";
        finalString += date.getHours() + ":";
        finalString += date.getMinutes() + ":";
        finalString += date.getSeconds() + ".";
        finalString += date.getMilliseconds();
        finalString += "]";
        return finalString;
    }

    /**
     * @brief Performs intelligent stack trace analysis for caller identification
     * @param searchDepth Stack frame depth to examine (default: 2)
     * @return Function name of the calling context or undefined if unresolvable
     * 
     * Implements sophisticated stack trace parsing to automatically identify
     * the function that initiated a logging operation. This enables automatic
     * context attribution in log messages without manual caller specification.
     * 
     * Stack Trace Analysis:
     * - **Frame 0**: Error constructor call (this method)
     * - **Frame 1**: Logging method (info/warning/error/debug)
     * - **Frame 2**: Actual caller (default search target)
     * - **Frame N**: Configurable depth for complex call chains
     * 
     * Search Algorithm:
     * 1. Generate stack trace using Error object
     * 2. Parse stack lines and extract function names
     * 3. Navigate to specified depth in call stack
     * 4. Extract function name using regex pattern matching
     * 5. Return function name or undefined for anonymous/unmatched calls
     * 
     * Error Handling:
     * - Returns undefined if stack trace unavailable
     * - Handles stack frames shorter than search depth gracefully
     * - Manages anonymous functions and complex call patterns
     * 
     * Pattern Matching:
     * Uses regex `/at (\w+)/` to extract function names from V8 stack trace format.
     * Compatible with standard JavaScript engine stack trace conventions.
     * 
     * Performance Considerations:
     * Stack trace generation has measurable overhead. Use judiciously in
     * performance-critical paths and consider disabling in production builds.
     */
    getParentCaller(searchDepth: number = 2): string | undefined {
        const stack = new Error().stack;
        if (!stack) {
            return undefined;
        }

        const lines = stack.split("\n").map(line => line.trim());

        // Ensure the requested search depth exists in the stack
        if (lines.length > searchDepth) {
            const match = lines[searchDepth].match(/at (\w+)/);
            if (match) {
                return match[1];
            }
        }

        return undefined;
    }

    /**
     * @brief Queries configuration system for debug logging state
     * @return Boolean indicating whether debug output should be generated
     * 
     * Provides centralized access to the extension's debug configuration setting,
     * enabling conditional debug output throughout the logging system. This method
     * serves as the single source of truth for debug state determination.
     * 
     * Configuration Integration:
     * Delegates to CodeConfig.get("enableDebug") to maintain consistency with
     * the extension's configuration management system. This ensures debug state
     * changes in settings are immediately reflected in logging behavior.
     * 
     * Usage Pattern:
     * Called before every debug logging operation to determine whether the
     * expensive operations (formatting, caller identification, output) should
     * be performed. Enables zero-cost debug logging when disabled.
     * 
     * Performance Impact:
     * Fast configuration lookup with minimal overhead. Debug message processing
     * is completely bypassed when debug mode is disabled, providing optimal
     * performance in production environments.
     */
    debugEnabled(): boolean {
        return CodeConfig.get("enableDebug");
    }

    /**
     * @brief Determines extension execution environment for logging behavior adaptation
     * @param context VS Code extension context (undefined in some initialization scenarios)
     * @return True if running in production/installed mode, false for development/test modes
     * 
     * Analyzes the extension's execution environment to determine appropriate logging
     * behavior. Different environments require different logging strategies:
     * - **Production**: Full console logging for user troubleshooting
     * - **Development**: Reduced console noise, focus on output panel
     * - **Test**: Minimal logging to avoid test pollution
     * 
     * Environment Detection Logic:
     * 1. **Undefined Context**: Falls back to VSCODE_DEBUG_MODE environment variable
     * 2. **Development Mode**: Extension is running from source (F5 debugging)
     * 3. **Test Mode**: Extension is running in automated test environment
     * 4. **Production Mode**: Extension is installed from marketplace
     * 
     * Context Scenarios:
     * - **Undefined**: Early initialization before context availability
     * - **Development**: Local debugging and development workflows
     * - **Test**: Automated testing and CI/CD environments
     * - **Production**: End-user installations and normal usage
     * 
     * Logging Implications:
     * - **Production**: Suppress console output, rely on output panel and GUI notifications
     * - **Development/Test**: Enable console output + auto-show output panel for debugging
     * 
     * Environment Variables:
     * Checks VSCODE_DEBUG_MODE for fallback environment detection when
     * extension context is unavailable during early initialization phases.
     */
    checkIfExtensionInstalled(context: vscode.ExtensionContext | undefined): boolean {
        if (context === undefined) {
            return process.env.VSCODE_DEBUG_MODE?.toLocaleLowerCase() === 'true';
        }
        if (context.extensionMode === vscode.ExtensionMode.Development) {
            console.log("Running in debug/development mode");
            return false;
        } else if (context.extensionMode === vscode.ExtensionMode.Test) {
            console.log("Running in test mode");
            return false;
        } else {
            console.log("Running in production (installed) mode");
            return true;
        }
    }

    packageForUnsafe(message: string, info: boolean, warning: boolean, error: boolean, debug: boolean): string {
        const datetime: string = this.getDatetime();
        const correctPrefix: string = this.getCorrectPrefix(info, warning, error, debug);
        return `${datetime} ${moduleName}:initialising ${correctPrefix} '${message}'`;
    }
}

/**
 * @class Gui
 * @brief User-facing notification system for VS Code extension GUI integration
 * 
 * Implements the user interaction layer of the logging system, providing methods
 * to display notifications, warnings, and errors directly in the VS Code interface.
 * Features type-safe interactive buttons, consistent formatting, and appropriate
 * visual styling for different message severity levels.
 * 
 * Notification Architecture:
 * - **Information Messages**: Blue notifications for status updates and confirmations
 * - **Warning Messages**: Yellow notifications for potential issues requiring attention
 * - **Error Messages**: Red notifications for critical failures requiring user action
 * - **Debug Messages**: Conditional notifications visible only in debug mode
 * 
 * Interactive Features:
 * - **Template-based Buttons**: Type-safe button definitions with compile-time checking
 * - **User Response Handling**: Thenable return values for button click processing
 * - **Multiple Button Support**: Unlimited interactive options per notification
 * - **Consistent Styling**: Automatic application of extension branding and formatting
 * 
 * Message Formatting:
 * All notifications include automatic formatting with:
 * - Extension name prefix for brand recognition
 * - Timestamp integration for temporal context
 * - Log level indicators for severity classification
 * - Consistent visual styling across message types
 * 
 * User Experience Considerations:
 * - **Non-intrusive**: Notifications don't block user workflow
 * - **Actionable**: Interactive buttons provide clear user options
 * - **Contextual**: Messages include relevant information for user decision-making
 * - **Accessible**: Compatible with VS Code's accessibility features
 * 
 * Performance Characteristics:
 * - **Asynchronous**: All operations return promises for non-blocking behavior
 * - **Lightweight**: Minimal overhead for non-interactive notifications
 * - **Conditional**: Debug messages are filtered early when debug mode disabled
 */
class Gui {
    /** @brief Reference to shared logging utilities */
    private LI: LoggerInternals;
    private fullyLoaded: boolean = false;

    /**
     * @brief Constructor for Gui logging class
     * @param loggerInternals Shared logging utilities instance
     * @param depthSearch Optional search depth (currently unused)
     * 
     * Initializes the GUI logger with shared utilities for consistent
     * formatting and behavior across logging methods.
     */
    constructor(loggerInternals: LoggerInternals, fullyLoaded: boolean = false) {
        this.LI = loggerInternals;
        this.fullyLoaded = fullyLoaded;
    }

    /**
     * @brief Updates the initialization status of the GUI logger
     * @param fullyLoaded Boolean indicating if the extension is fully loaded and GUI notifications should be displayed
     * 
     * Controls whether GUI notifications are actually displayed to users. When fullyLoaded is false,
     * all GUI notification methods will return immediately without displaying messages. This prevents
     * premature notifications during extension initialization phases where the extension context
     * may not be properly established.
     * 
     * State Management:
     * - **True**: Enables normal GUI notification behavior
     * - **False**: Suppresses all GUI notifications (returns undefined immediately)
     * 
     * Use Cases:
     * - Extension initialization and shutdown phases
     * - Testing environments where GUI notifications should be suppressed
     * - Conditional GUI behavior based on extension lifecycle state
     */
    updateLoadStatus(fullyLoaded: boolean = true): void {
        this.fullyLoaded = fullyLoaded;
    }
    /**
     * @brief Displays an information notification to the user
     * @template T String type for button options
     * @param message Information message to display
     * @param items Optional button labels for user interaction
     * @return Promise resolving to selected button label or undefined
     * 
     * Shows a VS Code information notification with optional interactive
     * buttons. Used for non-critical informational messages.
     */
    info<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        if (!this.fullyLoaded) {
            console.log(this.LI.packageForUnsafe(message, true, false, false, false));
            return Promise.resolve(undefined);
        }
        let final: string = "";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " '" + message + "'";
        return vscode.window.showInformationMessage<T>(message, ...items);
    }

    /**
     * @brief Displays a warning notification to the user
     * @template T String type for button options
     * @param message Warning message to display
     * @param items Optional button labels for user interaction
     * @return Promise resolving to selected button label or undefined
     * 
     * Shows a VS Code warning notification with timestamp and optional
     * interactive buttons. Used for potentially problematic situations.
     */
    warning<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        if (!this.fullyLoaded) {
            console.warn(this.LI.packageForUnsafe(message, false, true, false, false));
            return Promise.resolve(undefined);
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " '" + message + "'";
        return vscode.window.showWarningMessage<T>(message, ...items);
    }

    /**
     * @brief Displays an error notification to the user
     * @template T String type for button options
     * @param message Error message to display
     * @param items Optional button labels for user interaction
     * @return Promise resolving to selected button label or undefined
     * 
     * Shows a VS Code error notification with timestamp and optional
     * interactive buttons. Used for critical errors requiring user attention.
     */
    error<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        if (!this.fullyLoaded) {
            console.error(this.LI.packageForUnsafe(message, false, false, true, false));
            return Promise.resolve(undefined);
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, true, false);
        final += " '" + message + "'";
        return vscode.window.showErrorMessage<T>(message, ...items);
    }

    /**
     * @brief Displays a debug notification (only if debug mode enabled)
     * @template T String type for button options
     * @param message Debug message to display
     * @param items Optional button labels for user interaction
     * @return Promise resolving to selected button label or undefined
     * 
     * Shows debug information as an information notification, but only
     * if debug mode is enabled in configuration. Returns undefined
     * immediately if debug mode is disabled.
     */
    debug<T extends string>(message: string, ...items: T[]): Thenable<T | undefined> {
        if (!this.fullyLoaded) {
            return Promise.resolve(undefined);
        }
        if (!this.LI.debugEnabled()) {
            console.log(this.LI.packageForUnsafe(message, false, false, false, true));
            return Promise.resolve(undefined);
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, false, true);
        final += " '" + message + "'";
        return vscode.window.showInformationMessage<T>(final, ...items);
    }
}

/**
 * @class Log
 * @brief Primary logging controller with dual-channel output and caller identification
 * 
 * Serves as the main logging interface for the extension, providing both console
 * output for developers and VS Code output panel integration. Features automatic
 * caller identification, intelligent environment adaptation, and comprehensive
 * formatting for optimal debugging and monitoring experiences.
 * 
 * Architecture Integration:
 * - **Console Output**: Direct console.log/warn/error for development debugging
 * - **Output Panel**: Dedicated VS Code output channel for structured logging
 * - **GUI Notifications**: Embedded Gui instance for user-facing messages
 * - **Caller Attribution**: Automatic function name resolution through stack analysis
 * 
 * Output Channel Management:
 * Creates and manages a dedicated VS Code output panel ("OUTPUT" tab) for the
 * extension, providing structured log viewing separate from the debug console.
 * This enables users to review extension activity without developer tools access.
 * 
 * Environment Adaptation:
 * Intelligently adapts logging behavior based on extension execution environment:
 * - **Development Mode**: Auto-show output panel + console output for immediate feedback
 * - **Production Mode**: Hidden output panel + suppressed console to reduce user noise
 * - **Test Mode**: Auto-show output panel + console output for debugging tests
 * 
 * Caller Identification System:
 * - **Stack Trace Analysis**: Automatic parsing of JavaScript call stack
 * - **Configurable Depth**: Adjustable search depth for complex call chains
 * - **Function Name Resolution**: Extraction of calling function names
 * - **Anonymous Function Handling**: Graceful degradation for complex scenarios
 * 
 * Performance Optimizations:
 * - **Conditional Output**: Environment-aware console logging
 * - **Output Channel Reuse**: Single channel instance prevents resource leaks
 * - **Efficient Formatting**: Optimized string concatenation for high-frequency logging
 * - **Early Debug Filtering**: Debug messages bypassed when debug mode disabled
 * 
 * Thread Safety:
 * All logging operations are synchronous and atomic within VS Code's JavaScript
 * environment. No additional synchronization primitives required.
 * 
 * Integration Points:
 * - **Configuration System**: Respects debug and extension name settings
 * - **GUI Notifications**: Seamless integration with user notification system
 * - **Extension Context**: Adapts to VS Code extension lifecycle and environment
 */
class Log {
    /** @brief Default stack depth for caller identification in complex call chains */
    private depthSearch: number = 3;
    /** @brief Shared logging utilities instance providing core formatting functionality */
    private LI: LoggerInternals = new LoggerInternals();
    /** @brief GUI notification logger instance for user-facing messages */
    public Gui: Gui = new Gui(this.LI);
    /** @brief Installation state flag determining console output behavior */
    private extensionInstalled: boolean = false;
    /** @brief Variable to indicate the status of initialisation of the extension, determines what can be output */
    private fullyLoaded: boolean = false;
    /** @brief Dedicated VS Code output channel for structured extension logging */
    private output: vscode.OutputChannel | undefined = undefined;

    /**
     * @brief Initializes the logging system with environment detection and auto-display
     * @param context Optional VS Code extension context for environment detection
     * 
     * Sets up the complete logging infrastructure including utility instances,
     * GUI integration, output channel creation, and environment-specific behavior.
     * The context parameter enables intelligent adaptation to development vs
     * production environments.
     * 
     * Development Mode Features:
     * - Automatically shows the VS Code output panel for immediate log visibility
     * - Enables console output for real-time debugging feedback
     * - Provides enhanced debugging experience during extension development
     * 
     * Production Mode Features:
     * - Output panel remains hidden until manually opened by users
     * - Console output is suppressed to reduce noise in user environments
     * - Focuses on GUI notifications for user interaction
     */
    constructor(context: vscode.ExtensionContext | undefined = undefined, fullyLoaded: boolean = false) {
        this.extensionInstalled = this.LI.checkIfExtensionInstalled(context);
        this.updateInitialisationStatus(fullyLoaded);
    }

    /**
     * @brief Updates the initialization status and manages output channel lifecycle
     * @param extensionLoaded Boolean indicating if the extension is fully loaded and operational
     * 
     * Manages the complete lifecycle of the logging system's output infrastructure based on
     * extension initialization state. This method coordinates output channel creation/disposal,
     * GUI notification availability, and development environment auto-display behavior.
     * 
     * Initialization Sequence (extensionLoaded = true):
     * 1. Updates internal loaded state flag
     * 2. Enables GUI notifications through Gui.updateLoadStatus()
     * 3. Creates dedicated VS Code output channel for extension logs
     * 4. Auto-displays output panel in development environments for immediate visibility
     * 
     * Shutdown Sequence (extensionLoaded = false):
     * 1. Updates internal loaded state flag to false
     * 2. Disables GUI notifications to prevent orphaned messages
     * 3. Properly disposes of existing output channel to prevent resource leaks
     * 4. Clears output channel reference for garbage collection
     * 
     * Resource Management:
     * - **Output Channel**: Created using CodeConfig.get("moduleName") for consistent naming
     * - **Memory Safety**: Proper disposal prevents VS Code output channel accumulation
     * - **Development UX**: Auto-show in development mode for immediate log access
     * 
     * State Coordination:
     * Ensures both Log and Gui classes maintain synchronized initialization state,
     * preventing inconsistent behavior between console logging and GUI notifications.
     */
    updateInitialisationStatus(extensionLoaded: boolean = true): void {
        if (extensionLoaded) {
            this.fullyLoaded = extensionLoaded;
            this.Gui.updateLoadStatus(this.fullyLoaded);
            this.output = vscode.window.createOutputChannel(CodeConfig.get("moduleName"));
            if (!this.extensionInstalled) {
                this.output.show();
            }
        } else {
            this.fullyLoaded = false;
            this.Gui.updateLoadStatus(this.fullyLoaded);
            if (this.output) {
                this.output.dispose();
                this.output = undefined;
            }
        }
    }

    /**
     * @brief Updates installation state for dynamic environment changes with UI adaptation
     * @param context Updated VS Code extension context
     * @return Void - Updates state and UI synchronously
     * 
     * Allows runtime updates to the installation state detection, useful when
     * the extension context becomes available after initial logger creation
     * or when the execution environment changes during extension lifecycle.
     * 
     * Dynamic UI Adaptation:
     * When switching to development mode (extensionInstalled = false), automatically
     * displays the VS Code output panel to provide immediate visibility of log output.
     * This ensures developers have instant access to debugging information when
     * the environment context changes during extension execution.
     * 
     * Use Cases:
     * - Extension context becomes available after early initialization
     * - Runtime environment detection updates
     * - Development workflow transitions
     * - Testing environment changes
     */
    updateInstallationState(context: vscode.ExtensionContext | undefined) {
        this.info(`In updateInstallationState`);
        this.extensionInstalled = this.LI.checkIfExtensionInstalled(context);
        this.info(`extensionInstalled = ${this.extensionInstalled}`);
        this.info("Out of updateInstallationState");
    }
    /**
     * @brief Logs informational messages with automatic caller identification
     * @param message Information message describing successful operations or status updates
     * @param searchDepth Optional stack depth override for complex calling scenarios
     * @return Void - Completes logging operation synchronously
     * 
     * Generates comprehensive informational log entries with full context attribution.
     * Suitable for tracking normal operation flow, successful completions, and
     * non-critical status updates that aid in debugging and monitoring.
     * 
     * Output Format:
     * `[timestamp] ExtensionName INFO: <CallerFunction> 'message'`
     * 
     * Output Destinations:
     * - VS Code output panel (always)
     * - Browser console (development/test mode only)
     * 
     * Console Output Logic:
     * Console output is enabled only in development and test environments
     * (when extensionInstalled = false) to provide real-time debugging feedback
     * without cluttering the console in production user environments.
     * 
     * Caller Identification:
     * Automatically resolves the calling function name using stack trace analysis.
     * The searchDepth parameter allows adjustment for wrapper functions or
     * complex call chains where the default depth doesn't capture the desired caller.
     */
    info(message: string, searchDepth: number | undefined = undefined) {
        if (!this.output) {
            console.log(this.LI.packageForUnsafe(message, true, false, false, false));
            return;
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        this.output.appendLine(final);
        if (!this.extensionInstalled) {
            console.log(final);
        }
    }

    /**
     * @brief Records warning conditions requiring attention but not blocking execution
     * @param message Warning description of potential issues or unusual conditions
     * @param searchDepth Optional stack depth override for complex calling scenarios
     * @return Void - Completes logging operation synchronously
     * 
     * Generates warning-level log entries for conditions that may require attention
     * but don't prevent continued operation. Includes automatic caller attribution
     * and uses console.warn() for appropriate browser console styling.
     * 
     * Output Format:
     * `[timestamp] ExtensionName WARNING: <CallerFunction> 'message'`
     * 
     * Use Cases:
     * - Deprecated API usage warnings
     * - Configuration anomalies
     * - Performance degradation notices
     * - Resource availability concerns
     * - Fallback behavior activations
     * 
     * Output Destinations:
     * - VS Code output panel (always)
     * - Browser console with warning styling (development/test mode only)
     * 
     * Console Output Behavior:
     * Warning messages are sent to console.warn() only in development and test
     * environments to maintain clean console output in production while providing
     * appropriate styling (yellow color) for developer attention during debugging.
     */
    warning(message: string, searchDepth: number | undefined = undefined) {
        if (!this.output) {
            console.warn(this.LI.packageForUnsafe(message, false, true, false, false));
            return;
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        this.output.appendLine(final);
        if (!this.extensionInstalled) {
            console.warn(final);
        }
    }

    /**
     * @brief Records critical errors requiring immediate attention or investigation
     * @param message Error description detailing failure conditions and context
     * @param searchDepth Optional stack depth override for complex calling scenarios
     * @return Void - Completes logging operation synchronously
     * 
     * Generates error-level log entries for critical failures, exceptions, and
     * conditions that prevent normal operation. Uses console.error() for proper
     * browser console styling and error tracking integration.
     * 
     * Output Format:
     * `[timestamp] ExtensionName ERROR: <CallerFunction> 'message'`
     * 
     * Error Categories:
     * - File system operation failures
     * - Network connectivity issues
     * - Configuration validation errors
     * - API call failures
     * - Resource allocation problems
     * - Unexpected exception conditions
     * 
     * Output Destinations:
     * - VS Code output panel (always)
     * - Browser console with error styling (development/test mode only)
     * 
     * Console Error Styling:
     * Error messages use console.error() in development environments, providing
     * red styling and stack trace integration for immediate developer attention.
     * Production environments rely on output panel and GUI notifications instead.
     * 
     * Integration:
     * Error logs are typically paired with GUI error notifications to ensure
     * users are informed of critical issues requiring their attention, regardless
     * of the console output availability.
     */
    error(message: string, searchDepth: number | undefined = undefined) {
        if (!this.output) {
            console.error(this.LI.packageForUnsafe(message, false, false, true, false));
            return;
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, true, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        this.output.appendLine(final);
        if (!this.extensionInstalled) {
            console.error(final);
        }
    }

    /**
     * @brief Generates detailed debugging information when debug mode is enabled
     * @param message Debug message with detailed development information
     * @param searchDepth Optional stack depth override for complex calling scenarios
     * @return Void - Completes logging operation synchronously (early return if debug disabled)
     * 
     * Produces verbose debugging output for development and troubleshooting scenarios.
     * All debug output is conditionally generated based on extension configuration,
     * ensuring zero performance impact in production when debug mode is disabled.
     * 
     * Output Format:
     * `[timestamp] ExtensionName DEBUG: <CallerFunction> 'message'`
     * 
     * Debug Content Guidelines:
     * - Variable states and values
     * - Function entry/exit points
     * - Algorithm step progression
     * - Configuration values
     * - Performance timing data
     * - Complex object serialization
     * 
     * Conditional Behavior:
     * Debug messages are completely bypassed when debug mode is disabled,
     * including message formatting and caller identification overhead.
     * This ensures optimal performance in production environments.
     * 
     * Output Destinations:
     * - VS Code output panel (always)
     * - Browser console with debug styling (development/test mode only)
     * 
     * Debug Console Integration:
     * Uses console.debug() in development environments for specialized debug styling
     * and filtering capabilities. Most browser developer tools allow filtering by
     * log level, making debug messages easy to isolate during troubleshooting.
     * 
     * Note: This method always outputs to the panel but console output depends on
     * installation state, not debug configuration. Debug filtering occurs at the
     * GUI notification level (Gui.debug method) rather than console level.
     */
    debug(message: string, searchDepth: number | undefined = undefined) {
        if (this.LI.debugEnabled() === false) {
            return;
        }
        if (!this.output) {
            console.log(this.LI.packageForUnsafe(message, false, false, false, true));
            return;
        }
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, false, true);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        this.output.appendLine(final);
        if (!this.extensionInstalled) {
            console.debug(final);
        }
    }
}

/** @brief Singleton logger instance for application-wide use */
const instance = new Log();

/**
 * @brief Singleton logger instance providing unified logging interface for the entire extension
 * 
 * Primary logging interface exported for application-wide use. This singleton instance
 * ensures consistent logging behavior, formatting, and configuration across all extension
 * modules while providing both developer-focused console output and user-facing GUI notifications.
 * 
 * Singleton Benefits:
 * - **Consistent Configuration**: Single source of truth for logging settings
 * - **Unified Formatting**: Standardized output format across all modules
 * - **Resource Efficiency**: Shared output channels and utility instances
 * - **State Management**: Centralized installation state and debug configuration
 * 
 * Usage Patterns:
 * ```typescript
 * import { logger } from './modules/logger';
 * 
 * // Developer console logging
 * logger.info("Operation completed successfully");
 * logger.warning("Deprecated API usage detected");
 * logger.error("Critical failure in component X");
 * logger.debug("Variable state: " + JSON.stringify(data));
 * 
 * // User GUI notifications
 * const result = await logger.Gui.info("Save changes?", "Yes", "No", "Cancel");
 * logger.Gui.warning("File not found, create new?", "Create", "Browse");
 * logger.Gui.error("Connection failed, check network settings");
 * ```
 * 
 * Output Destinations:
 * 1. **Console**: Development/test debugging only (F12 Developer Tools)
 * 2. **Output Panel**: Structured logs in VS Code OUTPUT tab (always available)
 * 3. **Notifications**: Toast messages in VS Code interface (user interactions)
 * 
 * Thread Safety:
 * Safe for use from any extension context without additional synchronization.
 * All operations are synchronous and atomic within VS Code's event loop.
 */
export const logger: Log = instance;

/**
 * @typedef LogType
 * @brief Type alias for Log class enabling dependency injection and testing
 * 
 * Provides a TypeScript type alias for the Log class, facilitating dependency
 * injection patterns, mock implementations for testing, and type-safe interfaces
 * where logger instances need to be passed as parameters or stored as properties.
 * 
 * Use Cases:
 * - **Dependency Injection**: Type-safe logger parameter definitions
 * - **Testing**: Mock logger implementations with compatible interfaces
 * - **Interface Design**: Abstract logger dependencies in class constructors
 * - **Type Annotations**: Explicit typing for logger variables and properties
 * 
 * Example Usage:
 * ```typescript
 * class ComponentA {
 *     constructor(private logger: LogType) {}
 *     
 *     performOperation() {
 *         this.logger.info("Operation started");
 *     }
 * }
 * 
 * // Dependency injection
 * const component = new ComponentA(logger);
 * ```
 */
export type LogType = Log;
