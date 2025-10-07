/**
 * @file trifid.ts
 * @brief Implementation of the Trifid cipher
 * @details The Trifid cipher is a fractionating transposition cipher that
 *          combines Polybius-like encoding with grouped coordinate transposition.
 *          Uses a 3D coordinate system and period-based grouping for enhanced security.
 *          Invented by Félix Delastelle as an extension of the Bifid cipher.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

/**
 * @class TrifidCipher
 * @brief Implementation of the Trifid fractionating transposition cipher
 * @details Uses 3D coordinates (row, column, depth) and period-based grouping
 *          to create a more complex cipher than Bifid. Coordinates are rearranged
 *          in groups before being converted back to letters.
 */
export class TrifidCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Trifid";

    /**
     * @brief The grouping period for coordinate transposition
     * @details Determines how many characters are processed as a group for transposition
     */
    private period: number;

    /**
     * @brief Constructor for Trifid cipher
     * @param period The grouping period for coordinate transposition (default: 5)
     * @details Initializes the cipher with configurable period. Common historical value is 5.
     */
    constructor(period: number = 5) {
        super();
        this.period = period; // Default period = 5 (common historical value)
    }

    /**
     * @brief Converts plaintext into 3D coordinates
     * @param plaintext The text to convert to coordinates
     * @return Array of coordinate triplets [row, column, depth]
     * @details Uses Polybius-style grid and adds a dummy "depth" dimension
     *          for the 3D coordinate system required by Trifid algorithm.
     */
    private toCoordinates(plaintext: string): number[][] {
        const poly = new PolybiusCipher();
        const sanitized = this.sanitize(plaintext);
        const coordinates: number[][] = [];

        for (const ch of sanitized) {
            const encoded = poly.encode(ch).replace(/\s/g, ''); // e.g. '23'
            const row = Number(encoded[0]);
            const col = Number(encoded[1]);
            const depth = 1; // Placeholder depth (Trifid normally uses 3x3x3)
            coordinates.push([row, col, depth]);
        }

        return coordinates;
    }

    /**
     * @brief Converts 3D coordinates back to plaintext
     * @param coords Array of coordinate triplets to convert back to text
     * @return The reconstructed plaintext string
     * @details Uses the Polybius cipher to convert row/column pairs back to characters.
     *          Ignores the depth dimension as it's mainly used for the transposition.
     */
    private fromCoordinates(coords: number[][]): string {
        const poly = new PolybiusCipher();
        const output: string[] = [];

        for (const [row, col] of coords) {
            const code = `${row}${col}`;
            output.push(poly.decode(code));
        }

        return output.join('');
    }

    /**
     * @brief Encodes plaintext using Trifid fractionating transposition
     * @param plaintext The text to encode
     * @return The encoded text with 3D coordinate transposition applied
     * @details Converts text to 3D coordinates, groups by period, rearranges
     *          coordinates within groups, then converts back to letters.
     */
    encode(plaintext: string): string {
        const coords = this.toCoordinates(plaintext);
        const flattened = coords.flat(); // e.g. [r1, c1, d1, r2, c2, d2, ...]
        const blocks: number[][] = [];

        // Split flattened coordinates into period-sized chunks
        for (let i = 0; i < flattened.length; i += this.period * 3) {
            blocks.push(flattened.slice(i, i + this.period * 3));
        }

        const encodedCoords: number[][] = [];

        // Regroup each block’s coordinates
        for (const block of blocks) {
            const third = Math.ceil(block.length / 3);

            for (let i = 0; i < third; i++) {
                const triplet = [
                    block[i] ?? 1,
                    block[i + third] ?? 1,
                    block[i + 2 * third] ?? 1,
                ];
                encodedCoords.push(triplet);
            }
        }

        return this.fromCoordinates(encodedCoords);
    }

    /**
     * @brief Decodes Trifid cipher text back to plaintext
     * @param ciphertext The encoded text to decode
     * @return The decoded plaintext with coordinate transposition reversed
     * @details Reverses the Trifid process: converts to coordinates, regroups by period,
     *          restores original coordinate arrangement, then converts back to letters.
     */
    decode(ciphertext: string): string {
        const coords = this.toCoordinates(ciphertext);
        const flattened = coords.flat();
        const blocks: number[][] = [];

        for (let i = 0; i < flattened.length; i += this.period * 3) {
            blocks.push(flattened.slice(i, i + this.period * 3));
        }

        const decodedCoords: number[][] = [];

        for (const block of blocks) {
            const third = Math.ceil(block.length / 3);

            for (let i = 0; i < third; i++) {
                const triplet = [
                    block[i] ?? 1,
                    block[i + third] ?? 1,
                    block[i + 2 * third] ?? 1,
                ];
                decodedCoords.push(triplet);
            }
        }

        return this.fromCoordinates(decodedCoords);
    }
}
