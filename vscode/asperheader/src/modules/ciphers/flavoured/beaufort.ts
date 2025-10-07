/**
 * @file beaufort.ts
 * @brief Implementation of the Beaufort cipher
 * @details The Beaufort cipher is a reciprocal cipher similar to Vigenère,
 *          but uses subtraction instead of addition: C = (K - P) mod 26.
 *          Named after Sir Francis Beaufort, it's its own inverse cipher.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class BeaufortCipher
 * @brief Implementation of the Beaufort reciprocal polyalphabetic cipher
 * @details Uses the formula C = (K - P) mod 26 for encoding, where K is the key
 *          character position and P is the plaintext character position.
 *          The same operation serves for both encoding and decoding.
 */
export class BeaufortCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Beaufort";

    /**
     * @brief Constructor for Beaufort cipher
     * @details Initializes the cipher. The key is provided during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Beaufort cipher formula (K - P) mod 26
     * @param plainText The text to encode (default: empty string)
     * @param key The encryption key (default: empty string)
     * @return The encoded text with Beaufort transformation applied
     * @details For each character, subtracts the plaintext position from the key position.
     *          The key repeats cyclically for longer texts.
     */
    encode(plainText: string = "", key: string = ""): string {
        const cleanKey = this.sanitize(key);
        const cleanText = this.sanitize(plainText);
        const output: string[] = [];

        for (let i = 0; i < cleanText.length; i++) {
            const ch = cleanText[i];
            const textIndex = BaseCipher.ALPHABET.indexOf(ch);
            if (textIndex === -1) {
                output.push(ch);
                continue;
            }

            const keyIndex = BaseCipher.ALPHABET.indexOf(cleanKey[i % cleanKey.length]);
            const cipherIndex = this.mod(keyIndex - textIndex, 26);
            output.push(BaseCipher.ALPHABET[cipherIndex]);
        }

        return output.join("");
    }

    /**
     * @brief Decodes Beaufort cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key The decryption key (must match encoding key, default: empty string)
     * @return The decoded plaintext
     * @details Beaufort is reciprocal - the same (K - C) mod 26 operation serves
     *          for both encoding and decoding due to its mathematical properties.
     */
    decode(cipherText: string = "", key: string = ""): string {
        // Beaufort is symmetric; encoding and decoding are identical
        return this.encode(cipherText, key);
    }
}
