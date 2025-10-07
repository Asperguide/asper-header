/**
 * @file scytale.ts
 * @brief Implementation of the Scytale cipher
 * @details The Scytale cipher is an ancient Greek transposition cipher that wraps
 *          text around a rod of a given diameter. The message is written row-by-row
 *          around the rod, then read column-by-column when the rod is unwrapped.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class ScytaleCipher
 * @brief Implementation of the ancient Scytale transposition cipher
 * @details Simulates wrapping text around a cylindrical rod by arranging characters
 *          in a grid format, then reading them in a different order to create the
 *          transposition effect.
 */
export class ScytaleCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Scytale";

    /**
     * @brief Constructor for Scytale cipher
     * @details Initializes the cipher. The rod diameter is specified during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Scytale transposition
     * @param plaintext The message to encode
     * @param diameter Number of rows (the "wrap" around the rod)
     * @return The encoded text with characters rearranged by column reading
     * @details Arranges text in a grid with the specified number of rows,
     *          then reads column-by-column to create the transposition.
     */
    encode(plaintext: string, diameter: number): string {
        const cols = Math.ceil(plaintext.length / diameter);
        let result = "";

        // Read column by column after filling the grid row by row
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < diameter; r++) {
                const index = c + r * cols;
                if (index < plaintext.length) {
                    result += plaintext[index];
                }
            }
        }

        return result;
    }

    /**
     * Decode ciphertext given the diameter (number of rows).
     * @param ciphertext The encoded message
     * @param diameter Number of rows used during encoding
     */
    decode(ciphertext: string, diameter: number): string {
        const cols = Math.ceil(ciphertext.length / diameter);
        const grid: string[] = Array(diameter * cols).fill("");
        let pos = 0;

        // Reconstruct grid in column-major order
        for (let c = 0; c < cols; c++) {
            for (let r = 0; r < diameter; r++) {
                const index = c + r * cols;
                if (pos < ciphertext.length) {
                    grid[index] = ciphertext[pos++];
                }
            }
        }

        // Read off row by row to recover plaintext
        return grid.join("").trimEnd();
    }
}
