/**
 * @file adfgvx.ts
 * @brief Implementation of the ADFGVX cipher
 * @details The ADFGVX cipher is a fractionating transposition cipher used by
 *          German forces in WWI. It combines Polybius square substitution with
 *          columnar transposition, using only the letters A,D,F,G,V,X as symbols
 *          (chosen for their distinct Morse code patterns).
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";

/**
 * @class ADFGVXCipher
 * @brief Implementation of the ADFGVX fractionating transposition cipher
 * @details First encodes characters using a 6×6 Polybius square containing A-Z and 0-9,
 *          representing coordinates with the letters ADFGVX. Then applies columnar
 *          transposition to the resulting coordinate pairs for additional security.
 */
export class ADFGVXCipher extends BaseCipher {
    /**
     * @brief The six coordinate labels used in the cipher
     * @details These specific letters were chosen for their distinct Morse code patterns
     */
    private readonly labels = ['A', 'D', 'F', 'G', 'V', 'X'];

    /**
     * @brief The 6×6 grid containing all alphanumeric characters
     * @details Contains A-Z (26 letters) and 0-9 (10 digits) = 36 characters total
     */
    private readonly square: string[];

    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "ADFGVX";

    /**
     * @brief Constructor for ADFGVX cipher
     * @details Initializes the 6×6 character grid with alphabet and digits.
     *          The grid arrangement is fixed for this implementation.
     */
    constructor() {
        super();
        // 6x6 square with A-Z and 0-9
        this.square = (BaseCipher.ALPHABET + '0123456789').split('');
    }

    /**
     * @brief Encodes plaintext using ADFGVX fractionating transposition
     * @param plainText The text to encode (default: empty string)
     * @param key The keyword for columnar transposition (default: empty string)
     * @return The encoded text with coordinate pairs and transposition applied
     * @details First converts each character to ADFGVX coordinate pairs using the 6×6 grid,
     *          then applies columnar transposition to the resulting coordinate string.
     */
    encode(plainText: string = '', key: string = ''): string {
        const clean = plainText.toUpperCase();
        let pairs = '';
        for (const ch of clean) {
            const idx = this.square.indexOf(ch);
            if (idx === -1) {
                pairs += ch; continue;
            }
            const r = Math.floor(idx / 6), c = idx % 6;
            pairs += this.labels[r] + this.labels[c];
        }
        // then columnar transposition
        return new ColumnarCipher().encode(pairs, key);
    }

    /**
     * @brief Decodes ADFGVX cipher text back to plaintext
     * @param ciphertext The encoded text to decode (default: empty string)
     * @param key The keyword used for encoding (default: empty string)
     * @return The decoded plaintext with characters restored from coordinates
     * @details Reverses the process: undoes columnar transposition, then converts
     *          ADFGVX coordinate pairs back to original characters using the 6×6 grid.
     */
    decode(ciphertext: string = '', key: string = ''): string {
        const pairs = new ColumnarCipher().decode(ciphertext, key).match(/../g) || [];
        let out = '';
        for (const p of pairs) {
            const r = this.labels.indexOf(p[0]);
            const c = this.labels.indexOf(p[1]);
            if (r === -1 || c === -1) {
                out += p;
            } else {
                out += this.square[r * 6 + c];
            }
        }
        return out;
    }
}
