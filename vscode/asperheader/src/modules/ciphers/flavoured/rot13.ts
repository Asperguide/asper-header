/**
 * @file rot13.ts
 * @brief Implementation of the ROT13 cipher
 * @details ROT13 ("rotate by 13 places") is a simple Caesar cipher variant
 *          that shifts each letter by 13 positions. Since there are 26 letters
 *          in the alphabet, ROT13 is its own inverse (applying it twice restores
 *          the original text). Commonly used for obscuring spoilers and offensive content.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class ROT13Cipher
 * @brief Implementation of the ROT13 substitution cipher
 * @details A special case of Caesar cipher with a fixed shift of 13. Due to the
 *          26-letter alphabet, shifting by 13 twice (13 + 13 = 26 ≡ 0 mod 26)
 *          returns to the original character, making ROT13 self-inverse.
 */
export class ROT13Cipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "ROT13";

    /**
     * @brief Constructor for ROT13 cipher
     * @details Initializes the ROT13 cipher. No parameters needed as the shift
     *          is always fixed at 13 positions.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes text using ROT13 substitution (13-position alphabet shift)
     * @param input The string to encode
     * @return The encoded string with each letter shifted by 13 positions
     * @details Each alphabetic character is shifted by 13 positions in the alphabet.
     *          Non-alphabetic characters remain unchanged. Since 13 is exactly half
     *          of 26, this operation is self-inverse.
     */
    encode(input: string): string {
        return input
            .split("")
            .map(character => this.shiftChar(character, 13))
            .join("");
    }

    /**
     * @brief Decodes ROT13 encoded text back to original
     * @param input The ROT13 encoded string to decode
     * @return The decoded original string
     * @details ROT13 is symmetric - encoding and decoding use the same operation.
     *          Applying ROT13 twice restores the original text due to the self-inverse
     *          property (13 + 13 = 26 ≡ 0 mod 26).
     */
    decode(input: string): string {
        return this.encode(input);
    }
}
