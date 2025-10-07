/**
 * @file keyWord.ts
 * @brief Implementation of the Keyword cipher
 * @details The Keyword cipher is a monoalphabetic substitution cipher that uses
 *          a keyword to generate the cipher alphabet. The keyword is placed at
 *          the beginning, followed by the remaining letters in order.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class KeywordCipher
 * @brief Implementation of the Keyword monoalphabetic substitution cipher
 * @details Creates a substitution alphabet by placing the keyword first (removing
 *          duplicates), then filling with remaining alphabet letters in order.
 *          Each plaintext letter maps to its corresponding cipher alphabet position.
 */
export class KeywordCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Keyword";

    /**
     * @brief Forward mapping from plaintext to ciphertext alphabet
     */
    private mapping: Record<string, string>;

    /**
     * @brief Reverse mapping from ciphertext to plaintext alphabet
     */
    private inverse: Record<string, string>;

    /**
     * @brief Constructor for Keyword cipher
     * @param keyword The keyword to generate the cipher alphabet (default: empty string)
     * @details Builds the substitution alphabet by placing unique keyword letters first,
     *          then appending remaining alphabet letters. Creates both forward and reverse mappings.
     */
    constructor(keyword: string = "") {
        super();

        const sanitizedKeyword = this.sanitize(keyword);
        const seen = new Set<string>();
        const keyAlphabet: string[] = [];

        // Add unique letters from the keyword first
        for (const ch of sanitizedKeyword) {
            if (!seen.has(ch)) {
                seen.add(ch);
                keyAlphabet.push(ch);
            }
        }

        // Fill in the rest of the alphabet
        for (const ch of KeywordCipher.ALPHABET) {
            if (!seen.has(ch)) {
                keyAlphabet.push(ch);
            }
        }

        // Build mapping and inverse mapping
        this.mapping = {};
        this.inverse = {};
        for (let i = 0; i < 26; i++) {
            this.mapping[KeywordCipher.ALPHABET[i]] = keyAlphabet[i];
            this.inverse[keyAlphabet[i]] = KeywordCipher.ALPHABET[i];
        }
    }

    /**
     * @brief Encodes plaintext using keyword-generated substitution alphabet
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with keyword-based character substitution
     * @details Uses the pre-built mapping to substitute each plaintext character
     *          with its corresponding character from the keyword-generated alphabet.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(c => this.mapping[c.toUpperCase()] ?? c)
            .join("");
    }

    /**
     * @brief Decodes keyword cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with substitutions reversed
     * @details Uses the inverse mapping to convert ciphertext characters back
     *          to their original plaintext equivalents.
     */
    decode(cipherText: string = ""): string {
        return cipherText
            .split("")
            .map(c => this.inverse[c.toUpperCase()] ?? c)
            .join("");
    }
}
