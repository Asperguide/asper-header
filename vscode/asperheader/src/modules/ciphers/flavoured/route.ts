/**
 * @file route.ts
 * @brief Implementation of the Route cipher
 * @details The Route cipher writes text row-by-row into a rectangular grid
 *          and then reads it following a spiral route pattern. This creates
 *          a transposition cipher where the reading path determines the encryption.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class RouteCipher
 * @brief Implementation of the Route transposition cipher
 * @details Arranges plaintext in a rectangular grid, then reads it following
 *          a predetermined spiral route to create the ciphertext. The route
 *          pattern determines the specific transposition applied.
 */
export class RouteCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Route";

    /**
     * @brief Constructor for Route cipher
     * @details Initializes the cipher. Grid dimensions are specified during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using spiral route pattern through rectangular grid
     * @param plaintext The text to encode
     * @param width Number of columns in the grid
     * @return The encoded text following the spiral reading route
     * @details Fills grid row-by-row, then reads following a clockwise spiral
     *          pattern starting from the top-left corner.
     */
    encode(plaintext: string, width: number): string {
        const w = width;
        const h = Math.ceil(plaintext.length / w);

        // Fill grid row by row
        const grid: string[][] = Array.from({ length: h }, () => Array(w).fill(" "));
        let index = 0;
        for (let r = 0; r < h; r++) {
            for (let c = 0; c < w; c++) {
                grid[r][c] = plaintext[index++] ?? " ";
            }
        }

        // Spiral traversal
        const result: string[] = [];
        let top = 0, bottom = h - 1;
        let left = 0, right = w - 1;

        while (top <= bottom && left <= right) {
            // Move right along the top row
            for (let c = left; c <= right; c++) {
                result.push(grid[top][c]);
            }
            top++;

            // Move down the rightmost column
            for (let r = top; r <= bottom; r++) {
                result.push(grid[r][right]);
            }
            right--;

            // Move left along the bottom row
            if (top <= bottom) {
                for (let c = right; c >= left; c--) {
                    result.push(grid[bottom][c]);
                }
                bottom--;
            }

            // Move up the leftmost column
            if (left <= right) {
                for (let r = bottom; r >= top; r--) {
                    result.push(grid[r][left]);
                }
                left++;
            }
        }

        return result.join("");
    }

    /**
     * Decodes a spiral route cipher given the ciphertext and grid width.
     * @param ciphertext The encoded text
     * @param width Number of columns used during encoding
     */
    decode(ciphertext: string, width: number): string {
        const w = width;
        const h = Math.ceil(ciphertext.length / w);
        const grid: string[][] = Array.from({ length: h }, () => Array(w).fill(" "));

        let top = 0, bottom = h - 1;
        let left = 0, right = w - 1;
        let index = 0;

        // Fill the grid in spiral order
        while (top <= bottom && left <= right) {
            for (let c = left; c <= right; c++) {
                grid[top][c] = ciphertext[index++] ?? " ";
            }
            top++;

            for (let r = top; r <= bottom; r++) {
                grid[r][right] = ciphertext[index++] ?? " ";
            }
            right--;

            if (top <= bottom) {
                for (let c = right; c >= left; c--) {
                    grid[bottom][c] = ciphertext[index++] ?? " ";
                }
                bottom--;
            }

            if (left <= right) {
                for (let r = bottom; r >= top; r--) {
                    grid[r][left] = ciphertext[index++] ?? " ";
                }
                left++;
            }
        }

        // Read row by row
        return grid.map(row => row.join("")).join("");
    }
}
