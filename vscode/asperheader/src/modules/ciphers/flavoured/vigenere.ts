/**
 * @file vigenere.ts
 * @brief Implementation of the Vigenère cipher
 * @details The Vigenère cipher is a classic polyalphabetic substitution cipher
 *          that uses a repeating keyword to determine character shifts. Each letter
 *          is shifted according to the corresponding key letter (A=0, B=1, ..., Z=25).
 *          Named after Blaise de Vigenère, though actually invented by Giovan Bellaso.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class VigenereCipher
 * @brief Implementation of the Vigenère polyalphabetic substitution cipher
 * @details Uses a keyword that repeats cyclically to determine the shift amount
 *          for each plaintext character. More secure than monoalphabetic ciphers
 *          due to the changing substitution alphabet for each character position.
 */
export class VigenereCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Vigenere";

    /**
     * @brief Encodes plaintext using Vigenère cipher with repeating key
     * @param plaintext The text to encode
     * @param key The keyword for encryption (repeats cyclically)
     * @return The encoded text with Vigenère transformations applied
     * @throws Error if key is empty or invalid
     * @details Each character is shifted by the value of the corresponding key character.
     *          Non-alphabetic characters are preserved unchanged.
     */
    encode(plaintext: string, key: string): string {
        const sanitizedKey = this.sanitize(key);
        if (!sanitizedKey) {
            throw new Error("Key required");
        }

        let keyIndex = 0;

        return plaintext
            .split("")
            .map((char) => {
                const plainIndex = VigenereCipher.ALPHABET.indexOf(char.toUpperCase());
                if (plainIndex === -1) {
                    return char; // Non-alphabetic character
                }

                const shift = VigenereCipher.ALPHABET.indexOf(
                    sanitizedKey[keyIndex % sanitizedKey.length]
                );

                keyIndex++;
                return VigenereCipher.ALPHABET[
                    this.mod(plainIndex + shift, 26)
                ];
            })
            .join("");
    }

    /**
     * @brief Decodes Vigenère cipher text back to plaintext
     * @param ciphertext The encoded text to decode
     * @param key The keyword used for encoding (must match encoding key)
     * @return The decoded plaintext
     * @throws Error if key is empty or invalid
     * @details Reverses the Vigenère process by subtracting key character values
     *          from ciphertext characters. Uses the same cyclical key repetition.
     */
    decode(ciphertext: string, key: string): string {
        const sanitizedKey = this.sanitize(key);
        if (!sanitizedKey) {
            throw new Error("Key required");
        }

        let keyIndex = 0;

        return ciphertext
            .split("")
            .map((char) => {
                const cipherIndex = VigenereCipher.ALPHABET.indexOf(char.toUpperCase());
                if (cipherIndex === -1) {
                    return char;
                }

                const shift = VigenereCipher.ALPHABET.indexOf(
                    sanitizedKey[keyIndex % sanitizedKey.length]
                );

                keyIndex++;
                return VigenereCipher.ALPHABET[
                    this.mod(cipherIndex - shift, 26)
                ];
            })
            .join("");
    }
}
