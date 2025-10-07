/**
 * @file gronsfeld.ts
 * @brief Implementation of the Gronsfeld cipher
 * @details The Gronsfeld cipher is a variant of the Vigenère cipher that uses
 *          a numeric key instead of an alphabetic one. Each digit directly
 *          specifies the shift amount for the corresponding plaintext character.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class GronsfeldCipher
 * @brief Implementation of the Gronsfeld polyalphabetic substitution cipher
 * @details Uses numeric keys where each digit (0-9) directly represents the
 *          shift amount for Caesar-style character substitution. Simpler than
 *          Vigenère as it avoids alphabet-to-number conversion.
 */
export class GronsfeldCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Gronsfeld";

    /**
     * @brief Constructor for Gronsfeld cipher
     * @details Initializes the cipher. Numeric key is provided during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Gronsfeld cipher with numeric key
     * @param plainText The text to encode (default: empty string)
     * @param key Numeric string key (default: empty string)
     * @return The encoded text with digit-based shifts applied
     * @throws Error if key contains no numeric characters
     * @details Each digit in the key specifies the shift amount for the corresponding
     *          character position. Key repeats cyclically for longer texts.
     */
    encode(plainText: string = "", key: string = ""): string {
        const numericKey = key.replace(/[^0-9]/g, '');
        if (!numericKey) {
            throw new Error('Numeric key required');
        }

        let keyIndex = 0;
        return plainText.split('').map(ch => {
            const charIndex = GronsfeldCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (charIndex === -1) {
                return ch;
            }

            const shift = Number(numericKey[keyIndex % numericKey.length]);
            keyIndex++;
            return GronsfeldCipher.ALPHABET[this.mod(charIndex + shift, 26)];
        }).join('');
    }

    /**
     * @brief Decodes Gronsfeld cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key Numeric string key used for encoding (default: empty string)
     * @return The decoded plaintext with digit shifts reversed
     * @throws Error if key contains no numeric characters
     * @details Reverses the encoding by subtracting key digit values from
     *          ciphertext character positions using the same cyclical pattern.
     */
    decode(cipherText: string = "", key: string = ""): string {
        const numericKey = key.replace(/[^0-9]/g, '');
        if (!numericKey) {
            throw new Error('Numeric key required');
        }

        let keyIndex = 0;
        return cipherText.split('').map(ch => {
            const charIndex = GronsfeldCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (charIndex === -1) {
                return ch;
            }

            const shift = Number(numericKey[keyIndex % numericKey.length]);
            keyIndex++;
            return GronsfeldCipher.ALPHABET[this.mod(charIndex - shift, 26)];
        }).join('');
    }
}
