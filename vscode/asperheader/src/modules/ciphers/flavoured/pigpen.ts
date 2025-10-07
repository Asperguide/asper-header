/**
 * @file pigpen.ts
 * @brief Implementation of the Pigpen cipher
 * @details The Pigpen cipher is a substitution cipher that uses geometric symbols
 *          instead of letters. Also known as the Freemason's cipher, it was
 *          historically used by the Freemasons for secret communication.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class PigpenCipher
 * @brief Implementation of the Pigpen (Freemason's) substitution cipher
 * @details Uses geometric grid patterns to represent letters. This implementation
 *          uses ASCII symbols to represent the traditional pigpen symbols for
 *          text-based encoding and decoding.
 */
export class PigpenCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Pigpen";

    /**
     * @brief Forward mapping from letters to pigpen symbols
     */
    private map: Record<string, string> = {};

    /**
     * @brief Reverse mapping from pigpen symbols to letters
     */
    private inv: Record<string, string> = {};

    /**
     * @brief Constructor for Pigpen cipher
     * @details Initializes the symbol mapping using ASCII characters to represent
     *          the traditional pigpen geometric patterns.
     */
    constructor() {
        super();

        // define simple textual mapping for Pigpen (non-graphical)
        const symbols = [
            '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
            ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_'
        ];

        for (let i = 0; i < 26; i++) {
            this.map[PigpenCipher.ALPHABET[i]] = symbols[i];
            this.inv[symbols[i]] = PigpenCipher.ALPHABET[i];
        }
    }

    /**
     * @brief Encodes plaintext using Pigpen symbol substitution
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with letters replaced by ASCII pigpen symbols
     * @details Maps each alphabetic character to its corresponding ASCII symbol
     *          representation of traditional pigpen geometric patterns.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split('')
            .map(c => this.map[c.toUpperCase()] ?? c)
            .join('');
    }

    /**
     * @brief Decodes Pigpen cipher text back to plaintext
     * @param cipherText The encoded text with pigpen symbols (default: empty string)
     * @return The decoded plaintext with symbols converted back to letters
     * @details Uses the inverse mapping to convert ASCII pigpen symbols back
     *          to their corresponding alphabet letters.
     */
    decode(cipherText: string = ""): string {
        return cipherText
            .split('')
            .map(c => this.inv[c] ?? c)
            .join('');
    }
}
