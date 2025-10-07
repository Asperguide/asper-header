import { BaseCipher } from "../base/baseCipher";

/**
 * The Scytale Cipher is a simple transposition cipher
 * that wraps text around a rod of a given diameter.
 * 
 * Encoding writes text row-by-row, then reads it column-by-column.
 */
export class ScytaleCipher extends BaseCipher {
    readonly CipherName = "Scytale";

    constructor() {
        super();
    }

    /**
     * Encode plaintext using a Scytale (transposition by diameter).
     * @param plaintext The message to encode
     * @param diameter Number of rows (the "wrap" around the rod)
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
