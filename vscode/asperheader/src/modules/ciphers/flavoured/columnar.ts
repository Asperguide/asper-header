/**
 * @file columnar.ts
 * @brief Implementation of the Columnar Transposition cipher
 * @details The Columnar Transposition cipher rearranges plaintext by writing it
 *          into a grid row by row, then reading it column by column in an order
 *          determined by the alphabetical sorting of the key characters.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class ColumnarCipher
 * @brief Implementation of the Columnar Transposition cipher
 * @details Arranges plaintext in a rectangular grid based on key length,
 *          then reads columns in the order determined by sorting the key.
 *          This provides a transposition-based encryption method.
 */
export class ColumnarCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Columnar";

    /**
     * @brief Constructor for Columnar Transposition cipher
     * @details Initializes the cipher. The key is provided during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Determines the column reading order based on alphabetical key sorting
     * @param key The keyword used for column ordering (default: empty string)
     * @return Array of column indices in the order they should be read
     * @details Sorts key characters alphabetically and returns the original indices
     *          in their new sorted positions, defining the column reading sequence.
     */
    private getOrder(key: string = ""): number[] {
        const cleanKey = this.sanitize(key);
        const indexedChars: { ch: string; i: number }[] = [];

        for (let i = 0; i < cleanKey.length; i++) {
            indexedChars.push({ ch: cleanKey[i], i });
        }

        indexedChars.sort((a, b) => a.ch.localeCompare(b.ch));

        const order: number[] = [];
        for (const item of indexedChars) {
            order.push(item.i);
        }

        return order;
    }

    /**
     * @brief Encodes plaintext using Columnar Transposition
     * @param plainText The text to encode (default: empty string)
     * @param key The keyword determining column order (default: empty string)
     * @return The encoded text with characters rearranged by column transposition
     * @details Arranges plaintext in a grid with columns equal to key length,
     *          then reads columns in the order determined by alphabetical key sorting.
     */
    encode(plainText: string = "", key: string = ""): string {
        const order = this.getOrder(key);
        const cols = order.length;
        const rows = Math.ceil(plainText.length / cols);
        const grid: string[] = Array(cols).fill("");

        for (let i = 0; i < plainText.length; i++) {
            const colIndex = i % cols;
            grid[colIndex] += plainText[i];
        }

        let output = "";
        for (const colIndex of order) {
            output += grid[colIndex];
        }

        return output;
    }

    /**
     * @brief Decodes Columnar Transposition cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key The keyword used for encoding (default: empty string)
     * @return The decoded plaintext with original character order restored
     * @details Reverses the columnar transposition by redistributing characters
     *          back to their original grid positions based on the key order.
     */
    decode(cipherText: string = "", key: string = ""): string {
        const order = this.getOrder(key);
        const cols = order.length;
        const rows = Math.ceil(cipherText.length / cols);

        // Calculate lengths of each column
        const colLengths: number[] = Array(cols).fill(Math.floor(cipherText.length / cols));
        let remainder = cipherText.length - colLengths.reduce((sum, len) => sum + len, 0);
        for (let i = 0; i < remainder; i++) {
            colLengths[i]++;
        }

        // Fill each column from cipherText
        const columns: string[] = Array(cols).fill("");
        let pos = 0;
        for (let i = 0; i < cols; i++) {
            const colIndex = order[i];
            columns[colIndex] = cipherText.substr(pos, colLengths[i]);
            pos += colLengths[i];
        }

        // Read row by row to reconstruct plaintext
        let output = "";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                output += columns[c][r] ?? "";
            }
        }

        return output;
    }
}
