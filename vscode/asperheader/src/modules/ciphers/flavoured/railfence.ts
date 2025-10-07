/**
 * @file railfence.ts
 * @brief Implementation of the Rail Fence (Zigzag) cipher
 * @details The Rail Fence cipher is a transposition cipher that writes the message
 *          in a zigzag pattern across multiple "rails" (rows), then reads off the
 *          letters row by row. The number of rails determines the encryption strength.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class RailFenceCipher
 * @brief Implementation of the Rail Fence transposition cipher
 * @details Arranges plaintext in a zigzag pattern across multiple rails (rows),
 *          then reads the text row-wise to create the ciphertext. The pattern
 *          alternates direction when reaching the top or bottom rail.
 */
export class RailFenceCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "RailFence";

    /**
     * @brief Constructor for Rail Fence cipher
     * @details Initializes the Rail Fence cipher. The number of rails is specified
     *          during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Rail Fence zigzag pattern
     * @param plainText The text to encode
     * @param rails Number of rails (rows) for the zigzag pattern (default: 3)
     * @return The encoded text with characters rearranged by rail order
     * @details Creates a zigzag pattern by placing characters on alternating rails,
     *          changing direction at top and bottom. Then concatenates all rails.
     */
    encode(plainText: string, rails: number = 3): string {
        if (rails <= 1) {
            return plainText;
        }

        const rows: string[][] = Array.from({ length: rails }, () => []);
        let currentRow = 0;
        let direction = 1; // 1 = down, -1 = up

        for (const character of plainText) {
            rows[currentRow].push(character);

            currentRow += direction;

            // Change direction when hitting top or bottom rail
            if (currentRow === rails - 1 || currentRow === 0) {
                direction *= -1;
            }
        }

        // Combine all rows into a single string
        const cipherText = rows.map(row => row.join("")).join("");

        return cipherText;
    }

    /**
     * @brief Decodes Rail Fence cipher text back to original plaintext
     * @param cipherText The encoded text to decode
     * @param rails Number of rails used during encoding (default: 3)
     * @return The decoded plaintext with original character order restored
     * @details Reconstructs the zigzag pattern, determines character distribution
     *          across rails, then follows the original pattern to rebuild plaintext.
     */
    decode(cipherText: string, rails: number = 3): string {
        if (rails <= 1) {
            return cipherText;
        }

        const textLength = cipherText.length;
        const railPattern: number[] = [];

        let currentRow = 0;
        let direction = 1;

        // Determine the zigzag pattern used during encoding
        for (let i = 0; i < textLength; i++) {
            railPattern.push(currentRow);

            currentRow += direction;

            if (currentRow === rails - 1 || currentRow === 0) {
                direction *= -1;
            }
        }

        // Count how many characters belong to each rail
        const railCharacterCounts = Array(rails).fill(0);
        for (const rowIndex of railPattern) {
            railCharacterCounts[rowIndex]++;
        }

        // Slice the ciphertext into its rails
        const railsContent: string[][] = Array.from({ length: rails }, () => []);
        let currentPosition = 0;

        for (let rowIndex = 0; rowIndex < rails; rowIndex++) {
            const rowLength = railCharacterCounts[rowIndex];
            const rowCharacters = cipherText
                .slice(currentPosition, currentPosition + rowLength)
                .split("");

            railsContent[rowIndex] = rowCharacters;
            currentPosition += rowLength;
        }

        // Reconstruct plaintext by following the original pattern
        const rowIndices = Array(rails).fill(0);
        let plainText = "";

        for (const rowIndex of railPattern) {
            plainText += railsContent[rowIndex][rowIndices[rowIndex]];
            rowIndices[rowIndex]++;
        }

        return plainText;
    }
}
