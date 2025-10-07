/**
 * @file affine.ts
 * @brief Implementation of the Affine cipher
 * @details The Affine cipher is a mathematical substitution cipher that uses
 *          the formula E(x) = (ax + b) mod 26 for encryption and
 *          D(x) = a^(-1)(x - b) mod 26 for decryption, where 'a' and 'b'
 *          are the cipher keys and 'a' must be coprime to 26.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class AffineCipher
 * @brief Implementation of the Affine substitution cipher
 * @details Uses linear mathematical transformation E(x) = (ax + b) mod 26 where
 *          'a' is the multiplicative key (must be coprime to 26) and 'b' is the
 *          additive key. This provides more complexity than simple Caesar cipher.
 */
export class AffineCipher extends BaseCipher {
    /**
     * @brief Multiplicative coefficient (must be coprime to 26)
     */
    private readonly a: number;

    /**
     * @brief Additive coefficient
     */
    private readonly b: number;

    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Affine";

    /**
     * @brief Constructor for Affine cipher
     * @param a Multiplicative key (default: 5, must be coprime to 26)
     * @param b Additive key (default: 8)
     * @throws Error if 'a' is not coprime to 26
     * @details Initializes the cipher with the given coefficients. The multiplicative
     *          coefficient 'a' must be coprime to 26 to ensure the cipher is reversible.
     */
    constructor(a: number = 5, b: number = 8) {
        super();
        this.a = a;
        this.b = b;
        if (this.gcd(this.a, 26) !== 1) {
            throw new Error("a must be coprime with 26");
        }
    }

    /**
     * @brief Calculates the Greatest Common Divisor of two numbers
     * @param a First number
     * @param b Second number
     * @return The GCD of a and b
     * @details Uses Euclidean algorithm to determine if 'a' is coprime to 26
     */
    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    /**
     * @brief Encodes plaintext using the Affine cipher formula E(x) = (ax + b) mod 26
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with mathematical transformation applied
     * @details Applies the linear transformation to each alphabetic character.
     *          Non-alphabetic characters are preserved unchanged.
     */
    encode(plainText: string = ""): string {
        return plainText
            .toUpperCase()
            .split("")
            .map(ch => {
                const i = BaseCipher.ALPHABET.indexOf(ch);
                if (i === -1) {
                    return ch;
                }// preserve non-letters
                return BaseCipher.ALPHABET[this.mod(this.a * i + this.b, 26)];
            })
            .join("");
    }

    /**
     * @brief Decodes Affine cipher text using the inverse formula D(x) = a^(-1)(x - b) mod 26
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with inverse transformation applied
     * @details Applies the inverse Affine transformation by first calculating the
     *          modular multiplicative inverse of 'a', then applying the decryption formula.
     *          Non-alphabetic characters are preserved unchanged.
     */
    decode(cipherText: string = ""): string {
        const invA = this.modInverse(this.a, 26);
        return cipherText
            .toUpperCase()
            .split("")
            .map(ch => {
                const i = BaseCipher.ALPHABET.indexOf(ch);
                if (i === -1) {
                    return ch;
                }
                return BaseCipher.ALPHABET[this.mod(invA * (i - this.b), 26)];
            })
            .join("");
    }
}
