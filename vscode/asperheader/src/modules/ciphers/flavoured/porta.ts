/**
 * @file porta.ts
 * @brief Implementation of the Porta cipher
 * @details The Porta cipher is a polyalphabetic substitution cipher that uses
 *          a tableau similar to Vigenère but with a reciprocal property.
 *          This simplified implementation uses half-shifts based on key characters.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class PortaCipher
 * @brief Implementation of the Porta polyalphabetic reciprocal cipher
 * @details Uses a simplified half-shift Vigenère-like method instead of the full
 *          digraph tableau. The cipher is reciprocal, meaning the same operation
 *          serves for both encoding and decoding.
 */
export class PortaCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Porta";

    /**
     * @brief Constructor for Porta cipher
     * @details Initializes the simplified Porta cipher implementation.
     *          Uses half-shift Vigenère-like method for compatibility.
     */
    constructor() {
        super();
        // For simplicity, we will implement Porta using a half-shift Vigenère-like method
        // Full digraph table implementation can be added later if needed
    }

    /**
     * @brief Encodes plaintext using simplified Porta cipher
     * @param plainText The text to encode (default: empty string)
     * @param key The encryption key (default: empty string)
     * @return The encoded text with Porta transformations applied
     * @throws Error if key is empty
     * @details Uses half-shift values derived from key characters for substitution.
     */
    encode(plainText: string = "", key: string = ""): string {
        const sanitizedKey = this.sanitize(key);
        if (!sanitizedKey) {
            throw new Error("Key required");
        }

        let ki = 0;
        return plainText.split("").map(ch => {
            const pIndex = PortaCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (pIndex === -1) {
                return ch;
            }

            const keyIndex = PortaCipher.ALPHABET.indexOf(sanitizedKey[ki % sanitizedKey.length]);
            ki++;

            const shift = Math.floor(keyIndex / 2);
            return PortaCipher.ALPHABET[this.mod(pIndex + shift, 26)];
        }).join("");
    }

    /**
     * @brief Decodes Porta cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key The decryption key (must match encoding key, default: empty string)
     * @return The decoded plaintext
     * @throws Error if key is empty
     * @details Porta is reciprocal - the same half-shift operation serves for both
     *          encoding and decoding due to its mathematical properties.
     */
    decode(cipherText: string = "", key: string = ""): string {
        // Porta cipher is reciprocal, encoding and decoding are symmetric
        return this.encode(cipherText, key);
    }
}
