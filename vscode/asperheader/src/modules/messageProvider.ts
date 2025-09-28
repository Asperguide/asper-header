/**
 * @file messageProvider.ts
 * @brief Internationalization (i18n) message provider with intelligent language detection and fallback
 * @author Henry Letellier
 * @version 1.0.0
 * @date 2025
 * 
 * This module provides the core internationalization engine for the AsperHeader extension,
 * implementing intelligent message retrieval with automatic language detection and robust
 * fallback mechanisms. It works in conjunction with messageReference.ts to deliver
 * localized content throughout the extension.
 * 
 * Architecture:
 * - **MessageProvider**: Core logic for language detection and message retrieval
 * - **messageReference**: Centralized message dictionary (imported from ./messageReference)
 * - **Singleton Pattern**: Single instance ensures consistent language settings
 * 
 * Key Features:
 * - Automatic VS Code language detection from environment
 * - Intelligent fallback chain: user locale → English → first available
 * - Dynamic parameter interpolation through function-based messages
 * - Type-safe message retrieval with method overloading
 * - Missing message handling with debugging information
 * - Language override capabilities for testing and special cases
 * 
 * Supported Languages:
 * - English (en) - Primary/fallback language
 * - French (fr) - Complete translation coverage
 * - Italian (it) - Complete translation coverage
 * 
 * Usage Patterns:
 * ```typescript
 * getMessage("fileLoaded", "/path/to/file");
 * getMessage("error", { language: "fr" }, "error details");
 * ```
 */

import * as vscode from 'vscode';
import { messages } from './messageReference';

/**
 * @class MessageProvider
 * @brief Internationalization message provider with multi-language support and fallback mechanisms
 * 
 * Responsible for fetching localized messages based on the user's language preferences.
 * Implements a robust fallback system: user locale -> English -> first available language.
 * Supports dynamic message generation with parameter interpolation through function-based messages.
 * 
 * Features:
 * - Automatic language detection from VS Code environment
 * - Graceful fallback handling for missing translations
 * - Dynamic parameter interpolation in messages
 * - Type-safe message retrieval with overloaded methods
 * - Extensible architecture for adding new languages
 * - Missing message handling with debugging information
 */
class MessageProvider {
    /** @brief Current editor language detected from VS Code environment */
    private locale: string = vscode.env.language;

    /** @brief Key for the message returned when a requested message is missing */
    private messageNotFound: string = "messageNotFound";

    /** @brief Reference to imported message dictionary from messageReference.ts */
    private messages: Record<string, Record<string, (...args: any[]) => string>> = messages;

    /**
     * @brief Returns the first available language node from the messages object
     * @return The first available language message record
     * @throws Error if no messages are available at all
     * 
     * Used as a final fallback mechanism when neither the user's locale
     * nor English are available. Ensures the system always has some
     * messages to work with, even if not in the preferred language.
     */
    private getFirstAvailableLanguageNode(): Record<string, (...args: any[]) => string> {
        const langs = Object.keys(this.messages);
        if (langs.length === 0) {
            throw new Error("No messages available.");
        }
        return this.messages[langs[0]];
    }

    /**
     * @brief Returns the correct message from a given language node with fallback handling
     * @param node The language-specific message record to search
     * @param messageKey The key of the desired message
     * @param args Any arguments to pass to the message function
     * @return The localized message string or a "not found" message
     * 
     * Retrieves the requested message from the provided language node.
     * If the message key doesn't exist, returns a "message not found"
     * message that includes the missing key for debugging purposes.
     * All message functions are called with the provided arguments for
     * dynamic parameter interpolation.
     */
    private returnCorrectMessage(
        node: Record<string, (...args: any[]) => string>,
        messageKey: string,
        ...args: any[]
    ): string {
        if (node[messageKey] === undefined) {
            return node[this.messageNotFound](messageKey, ...args);
        }
        return node[messageKey](...args);
    }

    /**
     * @brief Get a localized message using default locale
     * @param messageKey The key identifying the message
     * @param args Additional arguments to pass to the message function
     * @return The localized message string
     */
    public get(messageKey: string, ...args: any[]): string;

    /**
     * @brief Get a localized message with language override
     * @param messageKey The key identifying the message
     * @param options Settings object with language override
     * @param args Additional arguments to pass to the message function
     * @return The localized message string in specified language
     */
    public get(messageKey: string, options: { language: string }, ...args: any[]): string;

    /**
     * @brief Get a localized message with automatic fallback mechanisms
     * @param messageKey The key identifying the message
     * @param optionsOrArg Either options object with language override or first message argument
     * @param args Additional arguments to pass to the message function
     * @return The localized message string
     * 
     * Main method for retrieving localized messages. Implements a robust fallback system:
     * 1. Try specified language (if options provided) or user's locale
     * 2. Fall back to English if available
     * 3. Fall back to first available language
     * 
     * Supports both direct argument passing and language override through options object.
     * All message functions receive the provided arguments for parameter interpolation.
     */
    public get(messageKey: string, optionsOrArg?: { language: string } | any, ...args: any[]): string {
        let lang: string;
        let finalArgs: any[];

        if (optionsOrArg && typeof optionsOrArg === 'object' && 'language' in optionsOrArg) {
            lang = optionsOrArg.language;
            finalArgs = args;
        } else {
            lang = this.locale;
            finalArgs = args;
            if (optionsOrArg !== undefined) {
                finalArgs = [optionsOrArg, ...args];
            }
        }

        const node = this.messages[lang] || this.messages['en'] || this.getFirstAvailableLanguageNode();
        return this.returnCorrectMessage(node, messageKey, ...finalArgs);
    }
}

/**
 * @brief Singleton instance of the MessageProvider for application-wide use
 * 
 * Single instance ensures consistent language settings and message caching
 * across the entire extension. Automatically detects user's VS Code language
 * preference on initialization.
 */
const instance = new MessageProvider();

/**
 * @brief Exported function for direct message retrieval
 * @param messageKey The key identifying the message
 * @param optionsOrArg Either options object with language override or first message argument
 * @param args Additional arguments to pass to the message function
 * @return The localized message string
 * 
 * Bound method of the singleton MessageProvider instance for convenient access
 * throughout the application. Provides the same functionality as calling
 * instance.get() directly but with simplified import syntax.
 * 
 * Usage examples:
 * - getMessage("headerWriteSuccess")
 * - getMessage("fileLoaded", "/path/to/file")
 * - getMessage("error", { language: "fr" }, "details")
 */
export const getMessage = instance.get.bind(instance);
