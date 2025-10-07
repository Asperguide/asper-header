/**
 * @file polybius.ts
 * @brief Implementation of the Polybius Square cipher
 * @details The Polybius Square is an ancient Greek cipher that uses a 5×5 grid
 *          to encode letters as pairs of numbers (row, column). Letters I and J
 *          share the same cell to fit the 26-letter alphabet into 25 grid positions.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class PolybiusCipher
 * @brief Implementation of the Polybius Square substitution cipher
 * @details Uses a 5×5 grid where each letter is represented by its row and column
 *          coordinates. The grid arrangement allows letters to be encoded as two-digit
 *          numbers, enabling transmission via limited signaling methods.
 */
export class PolybiusCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Polybius";

    /**
     * @brief Forward mapping from letters to grid coordinates
     */
    private grid: Record<string, string> = {};

    /**
     * @brief Reverse mapping from grid coordinates to letters
     */
    private inverse: Record<string, string> = {};

    /**
     * @brief Constructor for Polybius Square cipher
     * @details Builds the 5×5 grid mapping with letters A-Z (I and J share position).
     *          Creates both forward and inverse lookup tables for encoding/decoding.
     */
    constructor() {
        super();

        // Create 5x5 grid for letters A-Z (merge I/J)
        const letters = PolybiusCipher.ALPHABET.replace('J', '');
        let idx = 0;

        for (let r = 1; r <= 5; r++) {
            for (let c = 1; c <= 5; c++) {
                const ch = letters[idx++];
                const key = `${r}${c}`;
                this.grid[ch] = key;
                this.inverse[key] = ch;
            }
        }
    }

    /**
     * @brief Encodes plaintext using Polybius Square coordinates
     * @param plainText The text to encode (default: empty string)
     * @return Space-separated coordinate pairs representing each letter
     * @details Each letter becomes its grid coordinates (row, column). Letters I and J
     *          both encode to the same coordinates. Non-alphabetic characters are preserved.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(ch => {
                const up = ch.toUpperCase();
                if (up === 'J') {
                    return this.grid['I'];
                }
                if (/[A-Z]/.test(up)) {
                    return this.grid[up] ?? ch;
                }
                return ch;
            })
            .join(' ');
    }

    /**
     * @brief Decodes Polybius Square coordinates back to plaintext
     * @param cipherText The coordinate pairs to decode (default: empty string)
     * @return The decoded plaintext letters
     * @details Splits input by spaces and converts each coordinate pair back to its
     *          corresponding letter using the inverse grid mapping.
     */
    decode(cipherText: string = ""): string {
        return cipherText
            .split(/\s+/)
            .map(tok => this.inverse[tok] ?? tok)
            .join('');
    }
}
