/**
 * @file vic.ts
 * @brief Implementation of a simplified VIC cipher
 * @details The VIC cipher was a complex Soviet cipher used during the Cold War
 *          combining multiple encryption steps. This simplified version chains
 *          Columnar Transposition followed by Vigenère cipher to model its spirit.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";
import { VigenereCipher } from "./vigenere";

/**
 * @class VICCipher
 * @brief Simplified implementation of the VIC (Soviet spy) cipher
 * @details Chains two cipher operations: Columnar Transposition followed by
 *          Vigenère substitution. The historical VIC was much more complex,
 *          involving digit conversion and multiple transposition steps.
 */
export class VICCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "VIC";

    /**
     * @brief Constructor for simplified VIC cipher
     * @details Initializes the cipher components (Columnar and Vigenère).
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using chained Columnar → Vigenère operations
     * @param plaintext The text to encode
     * @param key The encryption key used for both cipher steps
     * @return The encoded text after dual transformation
     * @details First applies columnar transposition, then Vigenère substitution
     *          using the same key for both operations.
     */
    encode(plaintext: string, key: string): string {
        const columnar = new ColumnarCipher();
        const vigenere = new VigenereCipher();

        const sanitized = this.sanitize(plaintext);
        const transposed = columnar.encode(sanitized, key);
        return vigenere.encode(transposed, key);
    }

    /**
     * @brief Decodes VIC cipher text back to plaintext
     * @param ciphertext The encoded text to decode
     * @param key The decryption key used for both cipher steps
     * @return The decoded plaintext with both cipher operations reversed
     * @details Reverses the VIC process: first undoes Vigenère substitution,
     *          then undoes columnar transposition to restore original text.
     */
    decode(ciphertext: string, key: string): string {
        const columnar = new ColumnarCipher();
        const vigenere = new VigenereCipher();

        const intermediate = vigenere.decode(ciphertext, key);
        return columnar.decode(intermediate, key);
    }
}
