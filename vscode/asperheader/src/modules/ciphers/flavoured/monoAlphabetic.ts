/**
 * @file monoAlphabetic.ts
 * @brief Implementation of a general Monoalphabetic substitution cipher
 * @details A monoalphabetic cipher uses a fixed substitution alphabet where
 *          each plaintext letter always maps to the same ciphertext letter.
 *          This implementation allows custom substitution alphabets.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class MonoalphabeticCipher
 * @brief Implementation of a customizable monoalphabetic substitution cipher
 * @details Uses a provided 26-letter substitution alphabet to replace each
 *          standard alphabet letter with its corresponding cipher letter.
 *          The mapping is fixed for the entire message.
 */
export class MonoalphabeticCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Monoalphabetic";

    /**
     * @brief Forward mapping from plaintext to ciphertext alphabet
     */
    private mapping: Record<string, string>;

    /**
     * @brief Reverse mapping from ciphertext to plaintext alphabet
     */
    private inverse: Record<string, string>;

    /**
     * @brief Constructor for Monoalphabetic cipher
     * @param mapAlphabet 26-letter substitution alphabet (default: empty string)
     * @throws Error if mapAlphabet doesn't contain exactly 26 letters
     * @details Creates both forward and reverse mappings from the provided substitution alphabet.
     */
    constructor(mapAlphabet: string = "") {
        super();

        const sanitizedMap = this.sanitize(mapAlphabet);

        if (sanitizedMap.length !== 26) {
            throw new Error("mapAlphabet must have 26 letters");
        }

        this.mapping = {};
        this.inverse = {};

        for (let i = 0; i < 26; i++) {
            this.mapping[MonoalphabeticCipher.ALPHABET[i]] = sanitizedMap[i];
            this.inverse[sanitizedMap[i]] = MonoalphabeticCipher.ALPHABET[i];
        }
    }

    /**
     * @brief Encodes plaintext using the custom substitution alphabet
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with custom alphabet substitution applied
     * @details Maps each plaintext character to its corresponding position
     *          in the provided substitution alphabet. Non-alphabetic characters unchanged.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(c => this.mapping[c.toUpperCase()] ?? c)
            .join("");
    }

    /**
     * @brief Decodes monoalphabetic cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with substitutions reversed
     * @details Uses the inverse mapping to convert each ciphertext character
     *          back to its original standard alphabet position.
     */
    decode(cipherText: string = ""): string {
        return cipherText
            .split("")
            .map(c => this.inverse[c.toUpperCase()] ?? c)
            .join("");
    }
}
