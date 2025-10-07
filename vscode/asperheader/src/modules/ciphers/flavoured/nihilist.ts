/**
 * @file nihilist.ts
 * @brief Implementation of the Nihilist cipher
 * @details The Nihilist cipher combines Polybius square coordinates with additive
 *          key encryption. Both plaintext and key are converted to number pairs,
 *          then the key numbers are added to plaintext numbers modulo arithmetic.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

/**
 * @class NihilistCipher
 * @brief Implementation of the Nihilist additive coordinate cipher
 * @details First converts both plaintext and key to Polybius coordinates,
 *          then adds corresponding coordinate values to create encrypted numbers.
 *          Used by Russian nihilist revolutionaries in the 19th century.
 */
export class NihilistCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Nihilist";

    /**
     * @brief Constructor for Nihilist cipher
     * @details Initializes the cipher using Polybius square for coordinate conversion.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Nihilist coordinate addition
     * @param plainText The text to encode (default: empty string)
     * @param key The encryption key (default: empty string)
     * @return Space-separated numbers representing encrypted coordinates
     * @details Converts both text and key to Polybius coordinates, then adds
     *          key coordinates to text coordinates cyclically.
     */
    encode(plainText: string = "", key: string = ""): string {
        const poly = new PolybiusCipher();

        // Convert key to numbers via Polybius
        const keyNums = this.sanitize(key)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Convert plaintext to numbers via Polybius
        const plainNums = this.sanitize(plainText)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Add key numbers to plaintext numbers cyclically
        const encodedNums = plainNums.map((num, i) => num + keyNums[i % keyNums.length]);

        return encodedNums.join(" ");
    }

    /**
     * @brief Decodes Nihilist cipher text back to plaintext
     * @param cipherText Space-separated numbers representing encrypted coordinates (default: empty string)
     * @param key The decryption key used for encoding (default: empty string)
     * @return The decoded plaintext with coordinate arithmetic reversed
     * @details Subtracts key coordinate values from ciphertext numbers cyclically,
     *          then converts resulting Polybius coordinates back to letters.
     */
    decode(cipherText: string = "", key: string = ""): string {
        const poly = new PolybiusCipher();

        // Convert key to numbers via Polybius
        const keyNums = this.sanitize(key)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Convert ciphertext to numbers
        const cipherNums = cipherText.split(" ").map(n => Number(n));

        // Subtract key numbers cyclically and decode via Polybius
        const letters = cipherNums.map((num, i) => {
            const val = num - keyNums[i % keyNums.length];
            return poly.decode(String(val));
        });

        return letters.join("");
    }
}
