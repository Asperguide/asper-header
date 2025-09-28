/**
 * @file morseCode.ts
 * @brief Morse code translation utilities for text-to-morse and morse-to-text conversion
 * @author Henry Letellier
 * @version 1.0.0
 * @date 2025
 * 
 * This module provides comprehensive Morse code translation capabilities, supporting
 * bidirectional conversion between plain text and Morse code. It includes support for
 * letters, numbers, punctuation, and special characters with proper spacing and
 * formatting conventions.
 * 
 * Features:
 * - Complete alphabet and numeric character support (A-Z, 0-9)
 * - Punctuation and special character encoding
 * - Bidirectional translation (text ↔ morse)
 * - Proper spacing conventions (/ for word breaks, // for line breaks)
 * - Case-insensitive input processing
 * - Comprehensive logging of translation operations
 * - Static utility class design for easy access
 * 
 * Morse Code Conventions:
 * - Letters and numbers: Standard International Morse Code
 * - Word separation: Single forward slash (/)
 * - Line/sentence separation: Double forward slash (//)
 * - Character separation: Single space
 * - Unknown characters: Omitted from output
 */

import { logger, LogType } from "./logger";
import { getMessage } from "./messageProvider";

/**
 * @class MorseTranslator
 * @brief Static utility class for Morse code translation operations
 * 
 * Provides static methods for converting text to Morse code and vice versa.
 * Uses International Morse Code standards with extended support for punctuation
 * and special characters. All operations are logged for debugging and tracking purposes.
 * 
 * The class maintains internal dictionaries for efficient bidirectional translation
 * and follows established Morse code conventions for spacing and formatting.
 */
export class MorseTranslator {
    /** @brief Logger instance for translation operation tracking */
    private static readonly log: LogType = logger;

    /**
     * @brief Complete Morse code dictionary mapping characters to Morse patterns
     * 
     * Comprehensive mapping of characters to their International Morse Code equivalents.
     * Includes:
     * - Letters A-Z: Standard International Morse Code patterns
     * - Numbers 0-9: Standard numeric Morse patterns  
     * - Punctuation: Common punctuation marks and symbols
     * - Special formatting: Space (/) and line break (//) indicators
     * 
     * Each entry maps a single character to its dot-dash representation.
     * Spaces between words are represented by '/' and line breaks by '//'.
     */
    private static readonly MORSE_CODE: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
        'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..',
        "'": '.----.', '!': '-.-.--', '/': '-..-.',
        '(': '-.--.', ')': '-.--.-', '&': '.-...',
        ':': '---...', ';': '-.-.-.', '=': '-...-',
        '+': '.-.-.', '-': '-....-', '_': '..--.-',
        '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
        ' ': '/',       // space between words
        '\n': '//'      // end of sentence or line
    };

    /**
     * @brief Reverse lookup dictionary for Morse code to character translation
     * 
     * Automatically generated reverse mapping from Morse patterns to characters.
     * Created by inverting the MORSE_CODE dictionary at class initialization.
     * Used by fromMorse() method for efficient decode operations.
     * 
     * Structure: { ".-": "A", "-...": "B", ... }
     */
    private static readonly REVERSE_MORSE_CODE: Record<string, string> = (() => {
        const rev: Record<string, string> = {};
        for (const [char, code] of Object.entries(MorseTranslator.MORSE_CODE)) {
            rev[code] = char;
        }
        return rev;
    })();

    /**
     * @brief Converts plain text to Morse code representation
     * @param input Plain text string to convert to Morse code
     * @return Morse code string with proper spacing and formatting
     * 
     * Translates input text to International Morse Code with the following process:
     * 1. Converts input to uppercase for consistent lookup
     * 2. Maps each character to its Morse equivalent
     * 3. Joins Morse patterns with single spaces
     * 4. Handles word and line breaks with special separators
     * 5. Logs the conversion operation
     * 
     * Features:
     * - Case-insensitive input processing
     * - Unknown characters are omitted (empty string)
     * - Spaces become '/' for word separation
     * - Newlines become '//' for line separation
     * - Each Morse character separated by single space
     * 
     * Example:
     * ```typescript
     * MorseTranslator.toMorse("HELLO") // Returns: ".... . .-.. .-.. ---"
     * MorseTranslator.toMorse("SOS") // Returns: "... --- ..."
     * ```
     */
    public static toMorse(input: string): string {
        const final: string = input
            .toUpperCase()
            .split('')
            .map(char => MorseTranslator.MORSE_CODE[char] ?? '')
            .join(' ');
        this.log.info(getMessage("morseConverted", input, final));
        return final;
    }

    /**
     * @brief Converts Morse code back to plain text
     * @param morseInput Morse code string to decode
     * @return Decoded plain text string
     * 
     * Decodes Morse code input back to readable text with the following process:
     * 1. Splits input by spaces to isolate individual Morse patterns
     * 2. Maps each pattern back to its corresponding character
     * 3. Joins characters to form the decoded text
     * 4. Processes special separators (/ and //) back to spaces and newlines
     * 5. Logs the decode operation
     * 
     * Features:
     * - Handles standard dot-dash Morse patterns
     * - Converts '/' back to spaces (word separation)
     * - Converts '//' back to newlines (line separation)
     * - Unknown Morse patterns are omitted
     * - Preserves original text structure
     * 
     * Expected Input Format:
     * - Morse patterns separated by single spaces
     * - Word breaks represented by '/'
     * - Line breaks represented by '//'
     * 
     * Example:
     * ```typescript
     * MorseTranslator.fromMorse(".... . .-.. .-.. ---") // Returns: "HELLO"
     * MorseTranslator.fromMorse("... --- ...") // Returns: "SOS"
     * ```
     */
    public static fromMorse(morseInput: string): string {
        const decoded = morseInput
            .split(' ')
            .map(symbol => MorseTranslator.REVERSE_MORSE_CODE[symbol] ?? '')
            .join('')
            .replace(/\/\//g, '\n')
            .replace(/\//g, ' ');

        this.log.info(getMessage("morseDecoded", morseInput, decoded));
        return decoded;
    }
}
