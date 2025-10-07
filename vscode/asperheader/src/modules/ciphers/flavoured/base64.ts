/**
 * @file base64.ts
 * @brief Implementation of Base64 encoding/decoding
 * @details Base64 is a binary-to-text encoding scheme that represents binary data
 *          in an ASCII string format. It's commonly used for encoding data in
 *          protocols and file formats that only support text data.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class Base64Cipher
 * @brief Implementation of Base64 encoding and decoding
 * @details Base64 uses 64 ASCII characters (A-Z, a-z, 0-9, +, /) to represent
 *          binary data. Each character represents 6 bits, and padding with '='
 *          characters ensures the output length is a multiple of 4.
 */
export class Base64Cipher extends BaseCipher {
    /**
     * @brief Identifier name for this encoding scheme
     */
    readonly CipherName = "Base64";

    /**
     * @brief Constructor for Base64 encoder/decoder
     * @details Initializes the Base64 cipher implementation using Node.js
     *          built-in Buffer functionality for reliable encoding/decoding.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext to Base64 format
     * @param plainText The text to encode (default: empty string)
     * @return Base64 encoded string
     * @details Converts the input text to a Buffer and then to Base64 encoding.
     *          This ensures proper handling of Unicode characters and binary data.
     */
    encode(plainText: string = ""): string {
        const buffer = Buffer.from(plainText);
        const encoded = buffer.toString("base64");
        return encoded;
    }

    /**
     * @brief Decodes Base64 encoded text back to plaintext
     * @param cipherText The Base64 encoded text to decode (default: empty string)
     * @return The decoded plaintext string
     * @details Converts the Base64 string back to a Buffer and then to UTF-8 text.
     *          Handles proper restoration of Unicode characters and special symbols.
     * @throws Error if the input is not valid Base64 format
     */
    decode(cipherText: string = ""): string {
        const buffer = Buffer.from(cipherText, "base64");
        const decoded = buffer.toString();
        return decoded;
    }
}
