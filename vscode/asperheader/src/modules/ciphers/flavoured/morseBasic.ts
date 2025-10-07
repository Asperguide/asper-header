/**
 * @file morseBasic.ts
 * @brief Implementation of basic Morse code encoding/decoding
 * @details Morse code represents letters and digits as sequences of dots (.) and
 *          dashes (-). Developed by Samuel Morse for telegraph communication,
 *          it assigns shorter codes to more frequent letters for efficiency.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class MorseBasicCipher
 * @brief Implementation of Morse code encoding and decoding
 * @details Converts alphabetic and numeric characters to/from Morse code using
 *          standard International Morse Code patterns. Spaces separate individual
 *          character codes in the encoded output.
 */
export class MorseBasicCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "MorseBasic";

    /**
     * @brief Mapping table from characters to Morse code patterns
     * @details Contains standard International Morse Code for letters A-Z and digits 0-9
     */
    private map: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
        'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.'
    };

    /**
     * @brief Encodes plaintext to Morse code
     * @param plainText The text to encode (default: empty string)
     * @return Morse code with dots, dashes, and spaces separating characters
     * @details Converts each alphanumeric character to its Morse code equivalent.
     *          Characters not in the mapping are preserved unchanged. Spaces separate codes.
     */
    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(c => this.map[c.toUpperCase()] ?? c)
            .join(" ");
    }

    /**
     * @brief Decodes Morse code back to plaintext
     * @param cipherText The Morse code to decode (default: empty string)
     * @return The decoded plaintext characters
     * @details Splits input by spaces and converts each Morse code pattern back
     *          to its corresponding character using inverse mapping.
     */
    decode(cipherText: string = ""): string {
        const inverseMap: Record<string, string> = {};
        for (const key in this.map) {
            inverseMap[this.map[key]] = key;
        }

        return cipherText
            .split(" ")
            .map(code => inverseMap[code] ?? code)
            .join("");
    }
}
