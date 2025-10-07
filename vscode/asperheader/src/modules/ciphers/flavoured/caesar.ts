/**
 * @file caesar.ts
 * @brief Implementation of the Caesar cipher
 * @details The Caesar cipher is one of the oldest and simplest substitution ciphers.
 *          Each letter is shifted by a fixed number of positions in the alphabet.
 *          Named after Julius Caesar who reportedly used it for military communications.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class CaesarCipher
 * @brief Implementation of the Caesar substitution cipher
 * @details A monoalphabetic substitution cipher where each letter in the plaintext
 *          is shifted a certain number of places down or up the alphabet. The shift
 *          amount is configurable (default is 3, as used by Julius Caesar).
 */
export class CaesarCipher extends BaseCipher {
    /**
     * @brief The number of positions to shift each letter
     */
    private shift: number;

    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Caesar";

    /**
     * @brief Constructor for Caesar cipher
     * @param shift Number of positions to shift (default: 3, as used by Julius Caesar)
     * @details Initializes the cipher with a specific shift value. Positive values
     *          shift forward in the alphabet, negative values shift backward.
     */
    constructor(shift: number = 3) {
        super();
        this.shift = shift;
    }

    /**
     * @brief Encodes plaintext using Caesar cipher
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with each letter shifted by the cipher's shift value
     * @details Non-alphabetic characters are preserved unchanged. Case is converted
     *          to uppercase as per the base alphabet definition.
     */
    encode(plainText: string = ""): string {
        const output: string[] = [];

        for (const ch of plainText) {
            const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (index === -1) {
                output.push(ch);
                continue;
            }

            const cipherIndex = this.mod(index + this.shift, 26);
            output.push(BaseCipher.ALPHABET[cipherIndex]);
        }

        return output.join("");
    }

    /**
     * @brief Decodes Caesar cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with the cipher shift reversed
     * @details Performs the inverse operation of encode() by shifting letters
     *          backward by the cipher's shift value. Non-alphabetic characters
     *          are preserved unchanged.
     */
    decode(cipherText: string = ""): string {
        const output: string[] = [];

        for (const ch of cipherText) {
            const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (index === -1) {
                output.push(ch);
                continue;
            }

            const plainIndex = this.mod(index - this.shift, 26);
            output.push(BaseCipher.ALPHABET[plainIndex]);
        }

        return output.join("");
    }
}
