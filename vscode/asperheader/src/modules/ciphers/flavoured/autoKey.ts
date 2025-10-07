/**
 * @file autoKey.ts
 * @brief Implementation of the Autokey cipher
 * @details The Autokey cipher is a polyalphabetic substitution cipher that extends
 *          the Vigenère cipher by using the plaintext itself to extend the key.
 *          This eliminates key repetition patterns that make Vigenère vulnerable.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class AutokeyCipher
 * @brief Implementation of the Autokey polyalphabetic substitution cipher
 * @details Extends Vigenère by appending plaintext to the key, creating a
 *          non-repeating key stream. The key starts with the provided keyword
 *          followed by the plaintext characters themselves.
 */
export class AutokeyCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Autokey";

    /**
     * @brief Constructor for Autokey cipher
     * @details Initializes the cipher. The initial key and plaintext are provided
     *          during encode/decode operations to build the extended key.
     */
    constructor() {
        super();
    }

    /**
     * @brief Encodes plaintext using Autokey cipher with self-extending key
     * @param plainText The text to encode (default: empty string)
     * @param key The initial keyword (default: empty string)
     * @return The encoded text using the extended autokey
     * @details Creates an extended key by concatenating the initial key with plaintext,
     *          then applies Vigenère-style shifting using this non-repeating key.
     */
    encode(plainText: string = "", key: string = ""): string {
        const cleanPT = this.sanitize(plainText);
        const cleanKey = this.sanitize(key);
        let fullKey = (cleanKey + cleanPT).slice(0, cleanPT.length);

        let out = "";
        for (let i = 0; i < cleanPT.length; i++) {
            const p = BaseCipher.ALPHABET.indexOf(cleanPT[i]);
            const k = BaseCipher.ALPHABET.indexOf(fullKey[i]);
            out += BaseCipher.ALPHABET[this.mod(p + k, 26)];
        }
        return out;
    }

    /**
     * @brief Decodes Autokey cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @param key The initial keyword used for encoding (default: empty string)
     * @return The decoded plaintext
     * @details Progressively decodes each character using the rolling key window,
     *          appending each decoded character to extend the key for the next character.
     */
    decode(cipherText: string = "", key: string = ""): string {
        const cleanCT = this.sanitize(cipherText);
        let fullKey = this.sanitize(key).split("");

        let out = "";
        for (const ch of cleanCT) {
            const c = BaseCipher.ALPHABET.indexOf(ch);
            const k = BaseCipher.ALPHABET.indexOf(fullKey[0]);
            const p = BaseCipher.ALPHABET[this.mod(c - k, 26)];

            out += p;
            fullKey.push(p); // append plaintext to key
            fullKey.shift(); // maintain rolling window
        }
        return out;
    }
}
