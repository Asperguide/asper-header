import { BaseCipher } from "../base/baseCipher";

/**
 * Vigenère Cipher
 * 
 * A classic polyalphabetic substitution cipher.
 * Each letter of the plaintext is shifted according to the corresponding
 * letter of the key (A=0 shift, B=1, ..., Z=25).
 */
export class VigenereCipher extends BaseCipher {
    readonly CipherName = "Vigenere";

    /**
     * Encode plaintext using the provided key.
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
     * Decode ciphertext using the provided key.
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
