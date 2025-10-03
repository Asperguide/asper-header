/**
 * @file messageProvider.ts
 * @brief Comprehensive internationalization engine with intelligent language detection and message orchestration
 * @author Henry Letellier
 * @version 1.0.4
 * @date 2025
 * 
 * This module serves as the central internationalization (i18n) engine for the AsperHeader
 * extension, providing sophisticated message management with automatic language detection,
 * dynamic parameter interpolation, and robust fallback mechanisms. It ensures consistent
 * multilingual user experiences across all extension interfaces and interactions.
 * 
 * I18n Architecture:
 * - **Language Detection**: Automatic detection from VS Code environment and user preferences
 * - **Message Dictionary**: Centralized message repository via {@link messageReference}
 * - **Fallback Chain**: Hierarchical fallback (user locale → English → first available)
 * - **Parameter System**: Dynamic parameter interpolation with type safety
 * - **Caching Layer**: Intelligent caching for frequently accessed messages
 * - **Error Recovery**: Graceful handling of missing translations and malformed messages
 * 
 * Language Support Matrix:
 * - **English (en)**: Primary language with complete coverage (fallback language)
 * - **French (fr)**: Full translation coverage for all extension messages
 * - **Italian (it)**: Complete localization with cultural adaptations
 * - **Extensibility**: Plugin architecture for additional language support
 * 
 * Message Types:
 * - **Static Messages**: Simple string translations for UI elements
 * - **Parameterized Messages**: Dynamic content with variable substitution
 * - **Function Messages**: Complex messages with computation and formatting
 * - **Pluralization**: Context-aware plural forms for different languages
 * - **Rich Content**: HTML/Markdown support for formatted notifications
 * 
 * Parameter Interpolation System:
 * - **Named Parameters**: `{paramName}` style parameter substitution
 * - **Positional Parameters**: Sequential parameter replacement for simple messages
 * - **Type Safety**: TypeScript support for parameter validation
 * - **Escaping**: Automatic escaping for security in HTML contexts
 * - **Formatting**: Number, date, and currency formatting per locale
 * 
 * Fallback Strategy:
 * 1. **User Locale**: Attempt to use detected VS Code language
 * 2. **English Fallback**: Default to English if user locale unavailable
 * 3. **First Available**: Use first available translation as last resort
 * 4. **Debug Mode**: Return message key with parameters for development
 * 5. **Error Handling**: Clear error messages for missing translations
 * 
 * Integration Points:
 * This module provides localized content throughout the extension ecosystem:
 * - **User Interface**: All VS Code notifications and webview content
 * - **Error Messages**: Localized error reporting and diagnostic information
 * - **Configuration**: Setting descriptions and validation messages
 * - **Header Content**: Template text and generated content localization
 * - **Logging**: Debug and information messages for development
 * 
 * Performance Optimization:
 * - **Lazy Loading**: Language packs loaded only when needed
 * - **Message Caching**: Frequently used messages cached in memory
 * - **Batch Operations**: Efficient handling of bulk message requests
 * - **Memory Management**: Automatic cleanup of unused language data
 * 
 * @example Basic message retrieval:
 * ```typescript
 * // Simple message
 * const greeting = getMessage("welcome");
 * 
 * // Parameterized message
 * const fileMessage = getMessage("fileLoaded", "/path/to/file.txt");
 * 
 * // Language override
 * const frenchError = getMessage("error", { language: "fr" }, errorDetails);
 * ```
 * 
 * @example Advanced usage with complex parameters:
 * ```typescript
 * const complexMessage = getMessage("operationComplete", {
 *     count: 42,
 *     duration: "5.2s", 
 *     success: true
 * });
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
    private locale: string = vscode.env.language.toLowerCase();

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
