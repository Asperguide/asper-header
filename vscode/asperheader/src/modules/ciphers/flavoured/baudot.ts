/**
 * @file baudot.ts
 * @brief Implementation of the Baudot telegraph code
 * @details The Baudot code is a 5-bit character encoding used in early telegraph
 *          systems. This implementation uses Morse code patterns for demonstration.
 *          Named after Émile Baudot who developed the printing telegraph.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class BaudotCipher
 * @brief Implementation of Baudot telegraph code encoding
 * @details Converts letters to telegraph code patterns (using Morse-like notation
 *          for simplicity). Historically used 5-bit codes for teleprinter systems.
 */
export class BaudotCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Baudot";

    /**
     * @brief Mapping from letters to telegraph code patterns
     */
    private readonly letters: Record<string, string>;

    /**
     * @brief Reverse mapping from code patterns to letters
     */
    private readonly inverseLetters: Record<string, string>;

    /**
     * @brief Constructor for Baudot code cipher
     * @details Initializes the letter-to-code mapping tables using Morse-like patterns
     *          for demonstration purposes.
     */
    constructor() {
        super();

        this.letters = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
            'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
            'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
            'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
            'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..'
        };

        this.inverseLetters = {};
        for (const letter in this.letters) {
            this.inverseLetters[this.letters[letter]] = letter;
        }
    }

    /**
     * @brief Encodes plaintext using Baudot telegraph code patterns
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with letters as telegraph code patterns
     * @details Converts each alphabetic character to its Baudot code equivalent.
     *          Non-alphabetic characters are preserved unchanged. Spaces separate codes.
     */
    encode(plainText: string = ""): string {
        const encodedTokens: string[] = [];

        for (const ch of plainText) {
            const token = this.letters[ch.toUpperCase()] ?? ch;
            encodedTokens.push(token);
        }

        return encodedTokens.join(" ");
    }

    /**
     * @brief Decodes Baudot telegraph code back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext with letters restored from telegraph codes
     * @details Converts space-separated telegraph code patterns back to
     *          their corresponding alphabet letters using the reverse mapping.
     */
    decode(cipherText: string = ""): string {
        const decodedTokens: string[] = [];

        const tokens = cipherText.split(" ");
        for (const token of tokens) {
            decodedTokens.push(this.inverseLetters[token] ?? token);
        }

        return decodedTokens.join("");
    }
}
