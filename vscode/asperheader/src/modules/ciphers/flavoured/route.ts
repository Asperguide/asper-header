import { BaseCipher } from "../base/baseCipher";

/**
 * The Route Cipher writes text row-by-row into a rectangular grid
 * and then reads it off following a spiral route.
 */
export class RouteCipher extends BaseCipher {
    readonly CipherName = "Route";

    constructor() {
        super();
    }

    /**
     * Encodes plaintext using a spiral route pattern through a rectangular grid.
     * @param plaintext The text to encode
     * @param width Number of columns in the grid
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
