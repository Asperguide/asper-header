/**
 * @file atBash.ts
 * @brief Implementation of the Atbash cipher
 * @details Atbash is an ancient Hebrew cipher where the alphabet is reversed:
 *          A↔Z, B↔Y, C↔X, etc. It's a monoalphabetic substitution cipher
 *          that is its own inverse (encoding twice returns the original).
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class AtbashCipher
 * @brief Implementation of the Atbash substitution cipher
 * @details Maps each letter to its corresponding position from the end of the alphabet.
 *          A becomes Z, B becomes Y, and so forth. This cipher is symmetric,
 *          meaning the same operation performs both encoding and decoding.
 */
export class AtbashCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Atbash";

    /**
     * @brief Mapping table for character substitutions
     * @details Pre-computed mapping of each alphabet letter to its Atbash equivalent
     */
    private readonly map: Record<string, string>;

    /**
     * @brief Constructor for Atbash cipher
     * @details Builds the character mapping table where each letter maps to its
     *          counterpart from the reversed alphabet (A→Z, B→Y, C→X, etc.)
     */
    constructor() {
        super();
        this.map = {};

        const alphabet = BaseCipher.ALPHABET;
        for (let i = 0; i < alphabet.length; i++) {
            this.map[alphabet[i]] = alphabet[alphabet.length - 1 - i];
        }
    }

    /**
     * @brief Encodes plaintext using Atbash character substitution
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with each letter replaced by its Atbash equivalent
     * @details Non-alphabetic characters are preserved unchanged. Uses the
     *          pre-computed mapping table for efficient character substitution.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(ch => this.map[ch.toUpperCase()] ?? ch)
            .join("");
    }

    /**
     * @brief Decodes Atbash cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded original text
     * @details Atbash is symmetric - the same character mapping is used for both
     *          encoding and decoding. Applying Atbash twice returns the original text.
     */
    decode(cipherText: string = ""): string {
        // Atbash is symmetric — same as encode
        return this.encode(cipherText);
    }
}
