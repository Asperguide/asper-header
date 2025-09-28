/**
 * @file logger.ts
 * @brief Comprehensive logging system with console and GUI message support
 * @author Henry Letellier
 * @version 1.0.0
 * @date 2025
 * 
 * This module provides a robust logging system for VS Code extensions with
 * support for both console logging and GUI notifications. Features include
 * timestamping, caller identification, log level management, and formatted
 * output for debugging and user feedback.
 * 
 * Key features:
 * - Multiple log levels (info, warning, error, debug)
 * - Console logging with caller identification
 * - VS Code GUI notifications (information, warning, error messages)
 * - Automatic timestamping and formatting
 * - Debug mode toggling via configuration
 * - Stack trace analysis for caller detection
 */

import * as vscode from 'vscode';
import { CodeConfig } from "./processConfiguration";

/**
 * @class LoggerInternals
 * @brief Internal utility class providing logging infrastructure
 * 
 * Contains shared utility methods for log formatting, timestamp generation,
 * caller identification, and configuration management. Used by both console
 * and GUI logging classes to maintain consistency.
 */
class LoggerInternals {
    /**
     * @brief Constructor for LoggerInternals
     * 
     * Initializes the internal logging utilities. No configuration required.
     */
    constructor() { }

    /**
     * @brief Generates appropriate log level prefix string
     * @param info True if this is an info level message
     * @param warning True if this is a warning level message
     * @param error True if this is an error level message
     * @param debug True if this is a debug level message
     * @return Formatted prefix string for the log level
     * 
     * Determines the appropriate prefix string based on log level flags.
     * Only one flag should be true at a time for proper operation.
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
     * @brief Generates formatted timestamp string for log entries
     * @return Bracketed timestamp string in [DD-MM-YYYY HH:MM:SS.mmm] format
     * 
     * Creates a human-readable timestamp including date, time, and milliseconds
     * for precise log entry timing and debugging.
     */
    getDatetime(): string {
        let date: Date = new Date();
        let finalString: string = "[";
        finalString += date.getDate() + "-";
        finalString += date.getMonth() + "-";
        finalString += date.getFullYear() + " ";
        finalString += date.getHours() + ":";
        finalString += date.getMinutes() + ":";
        finalString += date.getSeconds() + ".";
        finalString += date.getMilliseconds();
        finalString += "]";
        return finalString;
    }

    /**
     * @brief Identifies the calling function using stack trace analysis
     * @param searchDepth Stack depth to search for caller (default: 2)
     * @return Function name of the caller or undefined if not found
     * 
     * Analyzes the JavaScript call stack to identify which function called
     * the logging method. Useful for debugging and tracing execution flow.
     * The searchDepth parameter allows adjustment for different call patterns.
     */
    getParentCaller(searchDepth: number = 2): string | undefined {
        const stack = new Error().stack;
        if (!stack) {
            return undefined;
        };

        const lines = stack.split("\n").map(line => line.trim());

        // Ensure the requested search depth exists in the stack
        if (lines.length > searchDepth) {
            const match = lines[searchDepth].match(/at (\w+)/);
            if (match) {
                return match[1];
            };
        }

        return undefined;
    }

    /**
     * @brief Checks if debug logging is enabled in configuration
     * @return True if debug logging is enabled, false otherwise
     * 
     * Reads the extension configuration to determine if debug-level
     * logging should be active. Used to control debug output visibility.
     */
    debugEnabled(): boolean {
        return CodeConfig.get("enableDebug");
    }
}

/**
 * @class Gui
 * @brief GUI notification logging class for VS Code user interface
 * 
 * Provides logging methods that display messages directly to users through
 * VS Code's notification system. Supports information, warning, and error
 * messages with optional user interaction buttons.
 * 
 * All methods return Thenable objects allowing for user response handling
 * when interactive buttons are provided.
 */
class Gui {
    /** @brief Reference to shared logging utilities */
    private LI: LoggerInternals;

    /**
     * @brief Constructor for Gui logging class
     * @param loggerInternals Shared logging utilities instance
     * @param depthSearch Optional search depth (currently unused)
     * 
     * Initializes the GUI logger with shared utilities for consistent
     * formatting and behavior across logging methods.
     */
    constructor(loggerInternals: LoggerInternals, depthSearch: number | undefined = undefined) {
        this.LI = loggerInternals;
    };
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
        let final: string = "";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " '" + message + "'";
        return vscode.window.showInformationMessage<T>(message, ...items);
    };

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
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " '" + message + "'";
        return vscode.window.showWarningMessage<T>(message, ...items);
    };

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
        if (!this.LI.debugEnabled()) {
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
 * @brief Main console logging class with caller identification
 * 
 * Provides comprehensive console logging functionality with automatic
 * timestamping, caller identification through stack trace analysis,
 * and formatted output. Includes both console logging and GUI notification
 * capabilities through the embedded Gui instance.
 * 
 * Features:
 * - Automatic caller function identification
 * - Timestamped log entries
 * - Multiple log levels with appropriate console methods
 * - Integration with VS Code GUI notifications
 * - Configurable stack search depth
 */
class Log {
    /** @brief Default stack depth for caller identification */
    private depthSearch: number = 3;
    /** @brief Shared logging utilities instance */
    private LI: LoggerInternals = new LoggerInternals();
    /** @brief GUI notification logger instance */
    public Gui: Gui = new Gui(this.LI);

    /**
     * @brief Constructor for Log class
     * 
     * Initializes the main logging system with default configuration.
     * Creates internal utilities and GUI logger instances.
     */
    constructor() { };
    /**
     * @brief Logs an informational message to console
     * @param message Information message to log
     * @param searchDepth Optional stack depth override for caller identification
     * 
     * Outputs a formatted info-level message to console with timestamp,
     * extension name, log level prefix, caller function name, and message.
     * Uses console.log() for output.
     */
    info(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(true, false, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.log(final);
    };

    /**
     * @brief Logs a warning message to console
     * @param message Warning message to log
     * @param searchDepth Optional stack depth override for caller identification
     * 
     * Outputs a formatted warning-level message to console with timestamp,
     * extension name, log level prefix, caller function name, and message.
     * Uses console.warn() for output.
     */
    warning(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, true, false, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.warn(final);
    };

    /**
     * @brief Logs an error message to console
     * @param message Error message to log
     * @param searchDepth Optional stack depth override for caller identification
     * 
     * Outputs a formatted error-level message to console with timestamp,
     * extension name, log level prefix, caller function name, and message.
     * Uses console.error() for output.
     */
    error(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, true, false);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.error(final);
    };

    /**
     * @brief Logs a debug message to console
     * @param message Debug message to log
     * @param searchDepth Optional stack depth override for caller identification
     * 
     * Outputs a formatted debug-level message to console with timestamp,
     * extension name, log level prefix, caller function name, and message.
     * Uses console.debug() for output.
     */
    debug(message: string, searchDepth: number | undefined = undefined) {
        let final: string = "";
        final += this.LI.getDatetime() + " ";
        final += CodeConfig.get("extensionName") + " ";
        final += this.LI.getCorrectPrefix(false, false, false, true);
        final += " <" + this.LI.getParentCaller(searchDepth || this.depthSearch) + ">";
        final += " '" + message + "'";
        console.debug(final);
    };
}

/** @brief Singleton logger instance for application-wide use */
const instance = new Log();

/**
 * @brief Exported logger instance for application-wide logging
 * 
 * Singleton Log instance that provides both console logging and GUI
 * notifications. Use this instance throughout the application for
 * consistent logging behavior and formatting.
 * 
 * Usage:
 * - logger.info("message") - Console info logging
 * - logger.Gui.info("message") - GUI notification
 */
export const logger: Log = instance;

/**
 * @typedef LogType
 * @brief Type alias for the Log class
 * 
 * Provides a type alias for dependency injection and type annotations
 * where Log class type is needed.
 */
export type LogType = Log;
