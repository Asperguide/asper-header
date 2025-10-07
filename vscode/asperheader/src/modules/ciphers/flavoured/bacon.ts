/**
 * @file bacon.ts
 * @brief Implementation of the Bacon cipher
 * @details Bacon's cipher is a steganographic cipher that encodes letters as
 *          5-bit binary representations using only two symbols (A and B).
 *          Invented by Francis Bacon in 1605, it can be hidden in text formatting.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class BaconCipher
 * @brief Implementation of Bacon's binary steganographic cipher
 * @details Converts each letter to a 5-bit binary code represented by A (0) and B (1).
 *          The position of each letter in the alphabet determines its binary value.
 *          Originally designed to be hidden in typographic variations.
 */
export class BaconCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Bacon";

    /**
     * @brief Constructor for Bacon cipher
     * @details Initializes the cipher. No configuration needed as encoding
     *          is based on fixed alphabetic positions.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes a single character to 5-bit Bacon representation
     * @param ch The character to encode
     * @return 5-character string of A's and B's, or original character if non-alphabetic
     * @details Converts alphabetic position to 5-bit binary, then replaces 0→A, 1→B
     */
    private encodeChar(ch: string): string {
        const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
        if (index === -1) {
            return ch;
        }

        const binary = index.toString(2).padStart(5, "0");
        return binary.replace(/0/g, "A").replace(/1/g, "B");
    }

    /**
     * @brief Decodes a 5-character Bacon token back to a letter
     * @param token 5-character string of A's and B's to decode
     * @return Single decoded character, or original token if invalid format
     * @details Converts A→0, B→1 to get binary, then converts to alphabetic position
     */
    private decodeToken(token: string): string {
        if (!/^[AB]{5}$/.test(token)) {
            return token;
        }

        const binary = token.replace(/A/g, "0").replace(/B/g, "1");
        const index = parseInt(binary, 2);
        return BaseCipher.ALPHABET[index] ?? "?";
    }

    /**
     * @brief Encodes plaintext using Bacon's binary representation
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with each letter as 5-bit AAAAA/BBBBB patterns
     * @details Converts each alphabetic character to its 5-bit Bacon representation.
     *          Non-alphabetic characters are preserved unchanged. Spaces separate tokens.
     */
    encode(plainText: string = ""): string {
        const tokens: string[] = [];

        for (const ch of plainText) {
            tokens.push(this.encodeChar(ch));
        }

        return tokens.join(" ");
    }

    /**
     * @brief Decodes Bacon cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with letters restored from 5-bit patterns
     * @details Splits input into 5-character tokens and converts each AAAAA/BBBBB
     *          pattern back to its corresponding alphabet letter.
     */
    decode(cipherText: string = ""): string {
        const tokens: string[] = cipherText.split(/\s+/);
        const output: string[] = [];

        for (const token of tokens) {
            output.push(this.decodeToken(token));
        }

        return output.join("");
    }
}
