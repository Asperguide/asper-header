/**
 * @file tapcode.ts
 * @brief Implementation of the Tap Code cipher
 * @details The Tap Code cipher encodes letters using a 5×5 Polybius square
 *          where I and J share the same cell. Each letter is represented by
 *          two groups of dots — the first for the row, the second for the column.
 *          Used by prisoners of war for covert communication.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class TapCodeCipher
 * @brief Implementation of the Tap Code prisoner communication cipher
 * @details Uses a 5×5 grid where each letter is encoded as two groups of dots
 *          representing row and column positions. Originally used by American
 *          POWs in Vietnam for silent communication through wall tapping.
 */
export class TapCodeCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Tap Code";

    /**
     * @brief Modified alphabet for 5×5 grid (excludes J, shares with I)
     */
    static readonly ALPHABET: string = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    /**
     * @brief Constructor for Tap Code cipher
     * @details Initializes the cipher using the 25-letter alphabet (I/J combined).
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext into Tap Code notation (dot groups separated by spaces)
     * @param plaintext The text to encode
     * @return Tap code representation with dots and spaces
     * @details Converts each letter to row/column coordinates, then represents
     *          each coordinate as a group of dots. Example: "HELLO" → ".. .... / . ..... / ... . / ... . / .... ..."
     */
    encode(plaintext: string): string {
        const letters = TapCodeCipher.ALPHABET;
        const result: string[] = [];

        for (const ch of plaintext.toUpperCase()) {
            if (ch === 'J') {
                // I/J share the same position (I)
                result.push('.. ...');
            }
            else if (/[A-Z]/.test(ch)) {
                const index = letters.indexOf(ch === 'J' ? 'I' : ch);
                const row = Math.floor(index / 5) + 1;
                const col = (index % 5) + 1;

                result.push('.'.repeat(row) + ' ' + '.'.repeat(col));
            }
            else {
                // Preserve non-alphabetic characters
                result.push(ch);
            }
        }

        return result.join(' / ');
    }

    /**
     * @brief Decodes Tap Code cipher text back to plaintext
     * @param ciphertext The encoded text with dot groups and slashes
     * @return The decoded plaintext with letters restored from tap patterns
     * @details Converts groups of dots back to row/column coordinates, then maps
     *          coordinates to letters using the 5×5 grid (I/J share same position).
     */
    decode(ciphertext: string): string {
        const letters = TapCodeCipher.ALPHABET;

        return ciphertext
            .split(' / ')
            .map(token => {
                if (!token.trim()) {
                    return '';
                }

                const [rowDots, colDots] = token.split(' ');

                // Handle malformed tokens gracefully
                if (!rowDots || !colDots) {
                    return token;
                }

                const row = rowDots.length;
                const col = colDots.length;
                const index = (row - 1) * 5 + (col - 1);

                return letters[index] ?? '?';
            })
            .join('');
    }
}
