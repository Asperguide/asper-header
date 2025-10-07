/**
 * @file xor.ts
 * @brief Implementation of the XOR (Exclusive OR) cipher
 * @details The XOR cipher is a symmetric encryption method that performs bitwise
 *          exclusive OR operations between plaintext and a repeating key. It's
 *          cryptographically secure when used with a truly random key of equal
 *          or greater length than the message (one-time pad).
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class XORCipher
 * @brief Implementation of XOR (Exclusive OR) encryption/decryption
 * @details Performs byte-wise XOR operations between input data and a repeating key.
 *          The same operation serves for both encryption and decryption due to the
 *          self-inverse property of XOR. Output is hex-encoded for safe text transport.
 */
export class XORCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "XOR";

    /**
     * @brief Constructor for XOR cipher
     * @details Initializes the XOR cipher implementation. No additional
     *          configuration is required as all parameters are provided
     *          during encode/decode operations.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using XOR operation with the provided key
     * @param plaintext The text to encrypt
     * @param key The encryption key (repeats if shorter than plaintext)
     * @return Hexadecimal string representation of the encrypted data
     * @throws Error if key is not provided or empty
     * @details Performs byte-wise XOR between plaintext bytes and repeating key bytes.
     *          Result is converted to hexadecimal for safe text representation and transport.
     */
    encode(plaintext: string, key: string): string {
        if (!key) {
            throw new Error("Key required");
        }

        const keyBuffer = Buffer.from(key);
        const plainBuffer = Buffer.from(plaintext);
        const output = Buffer.alloc(plainBuffer.length);

        for (let i = 0; i < plainBuffer.length; i++) {
            output[i] = plainBuffer[i] ^ keyBuffer[i % keyBuffer.length];
        }

        return output.toString("hex");
    }

    /**
     * @brief Decodes hexadecimal XOR ciphertext using the same key
     * @param ciphertext The hexadecimal encoded encrypted data
     * @param key The decryption key (must match the encoding key)
     * @return The original plaintext string
     * @throws Error if key is not provided, empty, or ciphertext is invalid hex
     * @details Converts hex ciphertext back to bytes, performs XOR with repeating key,
     *          and converts result back to string. Due to XOR's self-inverse property,
     *          the same operation serves for both encryption and decryption.
     */
    decode(ciphertext: string, key: string): string {
        if (!key) {
            throw new Error("Key required");
        }

        const keyBuffer = Buffer.from(key);
        const cipherBuffer = Buffer.from(ciphertext, "hex");
        const output = Buffer.alloc(cipherBuffer.length);

        for (let i = 0; i < cipherBuffer.length; i++) {
            output[i] = cipherBuffer[i] ^ keyBuffer[i % keyBuffer.length];
        }

        return output.toString();
    }
}
