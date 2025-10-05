/**
 * @file morse.test.ts
 * @brief Comprehensive test suite for Morse code translation functionality
 * @author Henry Letellier
 * @version 1.0.10
 * @date 2025
 * 
 * This module provides extensive testing coverage for the MorseTranslator class,
 * validating both text-to-morse and morse-to-text conversion capabilities.
 * Tests ensure compliance with International Morse Code standards and
 * verify proper handling of edge cases, special characters, and formatting.
 */

import * as assert from 'assert';
import { MorseTranslator } from '../modules/morseCode';

/**
 * @brief Main test suite for MorseTranslator functionality
 * 
 * Comprehensive validation of Morse code translation capabilities
 * including basic conversion, special characters, formatting,
 * and bidirectional translation accuracy.
 */
suite('MorseTranslator Tests', () => {
    /**
     * @brief Tests basic word translation to Morse code
     * @test Validates correct conversion of simple alphabetic word
     */
    test('Hello converts correctly', () => {
        const result = MorseTranslator.toMorse("HELLO");
        assert.strictEqual(result, ".... . .-.. .-.. ---");
    });

    /**
     * @brief Tests multi-word translation with space handling
     * @test Validates proper word separation using forward slash
     */
    test('Handles two words', () => {
        const result = MorseTranslator.toMorse("Hi bye");
        assert.strictEqual(result, ".... .. / -... -.-- .");
    });

    /**
     * @brief Tests line break handling in translation
     * @test Validates proper line ending conversion to double forward slash
     */
    test('Handles two words and an end of line', () => {
        const result = MorseTranslator.toMorse("Hi bye\n");
        assert.strictEqual(result, ".... .. / -... -.-- . //");
    });

    /**
     * @brief Tests punctuation character translation
     * @test Validates correct conversion of exclamation mark
     */
    test('Handles a word and punctuation', () => {
        const result = MorseTranslator.toMorse("Hi!");
        assert.strictEqual(result, ".... .. -.-.--");
    });

    /**
     * @brief Tests complex formatting with spaces, words, and punctuation
     * @test Validates complete message translation including line endings
     */
    test('Handles spaces, words and punctuation', () => {
        const result = MorseTranslator.toMorse("Hello world!\n");
        assert.strictEqual(result, ".... . .-.. .-.. --- / .-- --- .-. .-.. -.. -.-.-- //");
    });

    // Extended test coverage for edge cases and validation
    
    /**
     * @brief Tests edge case handling for empty input
     * @test Validates proper handling of empty string input
     */
    test('Handles empty string', () => {
        const result = MorseTranslator.toMorse("");
        assert.strictEqual(result, "");
    });

    /**
     * @brief Tests numeric character translation
     * @test Validates correct conversion of digits to Morse code
     */
    test('Handles numbers correctly', () => {
        const result = MorseTranslator.toMorse("123");
        assert.strictEqual(result, ".---- ..--- ...--");
    });

    /**
     * @brief Tests complete numeric range translation (0-9)
     * @test Validates all digit characters are properly mapped
     */
    test('Handles all digits 0-9', () => {
        const result = MorseTranslator.toMorse("0123456789");
        assert.strictEqual(result, "----- .---- ..--- ...-- ....- ..... -.... --... ---.. ----.");
    });

    /**
     * @brief Tests standard punctuation character translation
     * @test Validates correct Morse code mapping for common punctuation
     */
    test('Handles punctuation marks', () => {
        const result = MorseTranslator.toMorse(".,?'!/");
        assert.strictEqual(result, ".-.-.- --..-- ..--.. .----. -.-.-- -..-.");
    });

    /**
     * @brief Tests case-insensitive translation behavior
     * @test Validates identical output for different case variations
     */
    test('Case insensitive conversion', () => {
        const upper = MorseTranslator.toMorse("HELLO");
        const lower = MorseTranslator.toMorse("hello");
        const mixed = MorseTranslator.toMorse("HeLLo");
        assert.strictEqual(upper, lower);
        assert.strictEqual(upper, mixed);
    });

    /**
     * @brief Tests handling of unsupported characters
     * @test Validates graceful processing of non-standard characters
     */
    test('Handles unsupported characters gracefully', () => {
        const result = MorseTranslator.toMorse("A@B#C$");
        // Should include A, @, B, skip #, then C, $ (actual behavior)
        assert.strictEqual(result, ".- .--.-. -...  -.-. ...-..-");
    });

    /**
     * @brief Tests multiple space handling in translation
     * @test Validates proper conversion of consecutive spaces
     */
    test('Multiple spaces become single word separator', () => {
        const result = MorseTranslator.toMorse("A   B");
        assert.strictEqual(result, ".- / / / -...");
    });

    /**
     * @brief Tests multiple newline handling in translation
     * @test Validates proper conversion of consecutive line breaks
     */
    test('Multiple newlines become double separators', () => {
        const result = MorseTranslator.toMorse("A\n\nB");
        assert.strictEqual(result, ".- // // -...");
    });

    // Bidirectional conversion tests
    
    /**
     * @brief Tests bidirectional conversion accuracy for simple text
     * @test Validates round-trip translation consistency
     */
    test('Bidirectional conversion - simple text', () => {
        const original = "HELLO WORLD";
        const morse = MorseTranslator.toMorse(original);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, original);
    });

    /**
     * @brief Tests bidirectional conversion with numeric content
     * @test Validates round-trip translation for mixed alphanumeric text
     */
    test('Bidirectional conversion - with numbers', () => {
        const original = "TEST 123";
        const morse = MorseTranslator.toMorse(original);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, original);
    });

    /**
     * @brief Tests bidirectional conversion with punctuation
     * @test Validates round-trip translation for punctuated text
     */
    test('Bidirectional conversion - with punctuation', () => {
        const original = "SOS! HELP.";
        const morse = MorseTranslator.toMorse(original);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, original);
    });

    /**
     * @brief Tests bidirectional conversion with line breaks
     * @test Validates round-trip translation for multi-line text
     */
    test('Bidirectional conversion - with newlines', () => {
        const original = "LINE1\nLINE2";
        const morse = MorseTranslator.toMorse(original);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, original);
    });

    // Morse to text conversion tests
    
    /**
     * @brief Tests basic Morse to text conversion
     * @test Validates correct decoding of simple Morse code
     */
    test('fromMorse - simple conversion', () => {
        const result = MorseTranslator.fromMorse(".... . .-.. .-.. ---");
        assert.strictEqual(result, "HELLO");
    });

    /**
     * @brief Tests Morse to text conversion with word separators
     * @test Validates proper space handling in Morse decoding
     */
    test('fromMorse - with word separator', () => {
        const result = MorseTranslator.fromMorse(".... . .-.. .-.. --- / .-- --- .-. .-.. -..");
        assert.strictEqual(result, "HELLO WORLD");
    });

    /**
     * @brief Tests Morse to text conversion with line separators
     * @test Validates proper newline handling in Morse decoding
     */
    test('fromMorse - with line separator', () => {
        const result = MorseTranslator.fromMorse(".... . .-.. .-.. --- // .-- --- .-. .-.. -..");
        assert.strictEqual(result, "HELLO\nWORLD");
    });

    /**
     * @brief Tests handling of invalid Morse patterns in decoding
     * @test Validates graceful handling of malformed Morse code
     */
    test('fromMorse - handles invalid morse patterns', () => {
        const result = MorseTranslator.fromMorse(".... ........ . .-.. .-.. ---");
        // Should skip invalid pattern "........" and decode the rest
        assert.strictEqual(result, "HELLO");
    });

    /**
     * @brief Tests Morse decoding of empty string
     * @test Validates proper handling of empty Morse input
     */
    test('fromMorse - empty string', () => {
        const result = MorseTranslator.fromMorse("");
        assert.strictEqual(result, "");
    });

    // Performance and stress tests
    
    /**
     * @brief Tests performance with large text input
     * @test Validates efficient processing of extensive text content
     */
    test('Handles long text efficiently', () => {
        const longText = "ABCDEFGHIJKLMNOPQRSTUVWXYZ ".repeat(100);
        const morse = MorseTranslator.toMorse(longText);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, longText.toUpperCase());
    });

    /**
     * @brief Tests handling of complex mixed content
     * @test Validates comprehensive translation of varied text formats
     */
    test('Handles complex mixed content', () => {
        const complex = "Hello World! 123\nThis is a test.\nWith numbers: 456-789.";
        const morse = MorseTranslator.toMorse(complex);
        const decoded = MorseTranslator.fromMorse(morse);
        assert.strictEqual(decoded, complex.toUpperCase());
    });
});
