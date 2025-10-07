/**
 * @file bifid.ts
 * @brief Implementation of the Bifid cipher
 * @details The Bifid cipher combines the Polybius square with transposition.
 *          It first converts letters to coordinate pairs, then rearranges these
 *          coordinates by separating and recombining them before converting back
 *          to letters. Invented by Félix Delastelle in 1901.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

/**
 * @class BifidCipher
 * @brief Implementation of the Bifid fractionating transposition cipher
 * @details Combines Polybius square substitution with coordinate transposition.
 *          The process: letters → coordinates → rearrange → letters.
 *          This creates a more complex cipher than simple substitution.
 */
export class BifidCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Bifid";

    /**
     * @brief Constructor for Bifid cipher
     * @details Initializes the Bifid cipher. Uses PolybiusCipher internally
     *          for coordinate conversion operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Bifid cipher coordinate transposition
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with rearranged coordinate-based substitution
     * @details Converts to Polybius coordinates, separates row/column digits,
     *          rearranges them, then converts back to letters.
     */
    encode(plainText: string = ""): string {
        const poly = new PolybiusCipher();
        const sanitizedText = this.sanitize(plainText);

        // Convert each character to Polybius coordinates without spaces
        const pairs: string[] = [];
        for (const ch of sanitizedText) {
            pairs.push(poly.encode(ch).replace(/\s/g, ""));
        }

        // Flatten into single digits array
        const coords: number[] = pairs.join("").split("").map(Number);

        // Split and rearrange coordinates
        const half = Math.ceil(coords.length / 2);
        const rearranged = coords.slice(0, half).concat(coords.slice(half));

        // Reconstruct letters from paired coordinates
        const output: string[] = [];
        for (let i = 0; i < rearranged.length; i += 2) {
            const code = String(rearranged[i]) + String(rearranged[i + 1]);
            output.push(poly.decode(code));
        }

        return output.join("");
    }

    /**
     * @brief Decodes Bifid cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with coordinate transposition reversed
     * @details Reverses the Bifid process: converts to coordinates, separates into halves,
     *          reconstructs original coordinate pairs, then converts back to letters.
     */
    decode(cipherText: string = ""): string {
        const poly = new PolybiusCipher();
        const sanitizedText = this.sanitize(cipherText);

        // Convert each character to Polybius coordinates without spaces
        const pairs: string[] = [];
        for (const ch of sanitizedText) {
            pairs.push(poly.encode(ch).replace(/\s/g, ""));
        }

        // Flatten into single digits array
        const coords: number[] = pairs.join("").split("").map(Number);

        // Split coordinates into two halves
        const half = Math.floor(coords.length / 2);
        const firstHalf = coords.slice(0, half);
        const secondHalf = coords.slice(half);

        // Reconstruct letters from paired coordinates
        const output: string[] = [];
        for (let i = 0; i < firstHalf.length; i++) {
            const code = String(firstHalf[i]) + String(secondHalf[i]);
            output.push(poly.decode(code));
        }

        return output.join("");
    }
}
