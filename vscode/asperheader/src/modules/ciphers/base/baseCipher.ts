/**
 * @file baseCipher.ts
 * @brief Abstract base class for all cipher implementations
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { CipherI } from "./cipherInterface";

/**
 * @class BaseCipher
 * @brief Abstract base class providing common functionality for cipher implementations
 * @details This class implements the CipherI interface and provides utility methods
 *          commonly used across different cipher types. All concrete cipher classes
 *          should extend this base class to inherit shared functionality.
 */
export abstract class BaseCipher implements CipherI {
    /**
     * @brief Abstract method to encode plaintext
     * @param plaintext The text to encode
     * @param key Optional key parameter (implementation specific)
     * @return The encoded text
     */
    abstract encode(plaintext: string, key?: any): string;

    /**
     * @brief Abstract method to decode ciphertext
     * @param ciphertext The text to decode
     * @param key Optional key parameter (implementation specific)
     * @return The decoded text
     */
    abstract decode(ciphertext: string, key?: any): string;

    /**
     * @brief Abstract property defining the cipher's name
     */
    abstract readonly CipherName: string;

    /**
     * @brief Standard English alphabet for cipher operations
     * @details Used as reference for alphabetic substitution ciphers
     */
    static readonly ALPHABET: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

    /**
     * @brief Sanitizes input text to uppercase letters only
     * @param text The input text to sanitize
     * @return Uppercase text with non-alphabetic characters removed
     * @details Commonly used to prepare text for alphabetic ciphers
     */
    protected sanitize(text: string): string {
        return text.toUpperCase().replace(/[^A-Z]/g, '');
    }

    /**
     * @brief Performs modular arithmetic with proper handling of negative numbers
     * @param n The dividend
     * @param m The modulus
     * @return The result of n mod m, always positive
     * @details Ensures the result is always in the range [0, m-1]
     */
    protected mod(n: number, m: number): number {
        return ((n % m) + m) % m;
    }

    /**
     * @brief Calculates the modular multiplicative inverse
     * @param a The number to find the inverse of
     * @param m The modulus
     * @return The modular inverse of a modulo m
     * @throws Error if no modular inverse exists
     * @details Used in mathematical ciphers like Affine cipher
     */
    protected modInverse(a: number, m: number): number {
        a = this.mod(a, m);
        for (let x = 1; x < m; x++) {
            if (this.mod(a * x, m) === 1) {
                return x;
            }
        }
        throw new Error("No modular inverse");
    }

    /**
     * @brief Shifts a character by a given offset within the alphabet
     * @param ch The character to shift
     * @param shift The number of positions to shift (can be negative)
     * @return The shifted character, or original if not alphabetic
     * @details Handles wrap-around and preserves non-alphabetic characters
     */
    protected shiftChar(ch: string, shift: number): string {
        const i = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
        if (i === -1) {
            return ch;
        };
        return BaseCipher.ALPHABET[this.mod(i + shift, 26)];
    }
}
