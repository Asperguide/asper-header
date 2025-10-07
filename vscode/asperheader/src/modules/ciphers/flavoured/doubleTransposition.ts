/**
 * @file doubleTransposition.ts
 * @brief Implementation of the Double Transposition cipher
 * @details The Double Transposition cipher applies two successive columnar
 *          transpositions using potentially different keys. This significantly
 *          increases security compared to single transposition ciphers.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";

/**
 * @class DoubleTranspositionCipher
 * @brief Implementation of double columnar transposition cipher
 * @details Applies two successive columnar transpositions to greatly increase
 *          cipher strength. Can use the same key twice or two different keys
 *          for the two transposition operations.
 */
export class DoubleTranspositionCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "DoubleTransposition";

    /**
     * @brief Constructor for Double Transposition cipher
     * @details Initializes the cipher using two ColumnarCipher instances.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using double columnar transposition
     * @param plainText The text to encode (default: empty string)
     * @param key1 First transposition key (default: empty string)
     * @param key2 Second transposition key (optional, defaults to key1)
     * @return The encoded text after two transposition passes
     * @details Applies first columnar transposition, then applies second
     *          transposition to the result for enhanced security.
     */
    encode(plainText: string = "", key1: string = "", key2?: string): string {
        const firstKey = key1;
        const secondKey = key2 ?? key1;

        const columnar1 = new ColumnarCipher();
        const columnar2 = new ColumnarCipher();

        const firstPass = columnar1.encode(plainText, firstKey);
        const secondPass = columnar2.encode(firstPass, secondKey);

        return secondPass;
    }

    /**
     * @brief Decodes double transposition cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key1 First transposition key used for encoding (default: empty string)
     * @param key2 Second transposition key used for encoding (optional, defaults to key1)
     * @return The decoded plaintext with both transpositions reversed
     * @details Reverses the double transposition by first undoing the second
     *          transposition, then undoing the first transposition.
     */
    decode(cipherText: string = "", key1: string = "", key2?: string): string {
        const firstKey = key1;
        const secondKey = key2 ?? key1;

        const columnar1 = new ColumnarCipher();
        const columnar2 = new ColumnarCipher();

        const intermediate = columnar2.decode(cipherText, secondKey);
        const finalText = columnar1.decode(intermediate, firstKey);

        return finalText;
    }
}
