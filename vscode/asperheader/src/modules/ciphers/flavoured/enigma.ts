/**
 * @file enigma.ts
 * @brief Implementation of a simplified Enigma machine cipher
 * @details The Enigma machine was used by German forces during WWII for secure
 *          communication. This implementation simulates the rotor mechanism with
 *          stepping rotors and a reflector, though simplified compared to the
 *          actual historical machine.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

import { BaseCipher } from "../base/baseCipher";

/**
 * @class EnigmaCipher
 * @brief Simplified implementation of the Enigma machine polyalphabetic cipher
 * @details Simulates the Enigma's rotor mechanism where each keypress advances
 *          the rotors, creating a different substitution alphabet for each character.
 *          Uses multiple rotors with stepping mechanism and a reflector.
 */
export class EnigmaCipher extends BaseCipher {
    /**
     * @brief Identifier name for this cipher
     */
    readonly CipherName = "Enigma";

    /**
     * @brief Array of rotor substitution alphabets
     * @details Each rotor defines a substitution alphabet that rotates with each use
     */
    rotors: string[];

    /**
     * @brief Reflector alphabet for the return path
     * @details The reflector ensures that encryption and decryption are symmetric
     */
    reflector: string;

    /**
     * @brief Current positions of each rotor (0-25)
     * @details Tracks the rotation state of each rotor for proper stepping
     */
    positions: number[];

    /**
     * @brief Constructor for Enigma cipher
     * @param rotors Array of rotor substitution alphabets (default: 3 historical rotors)
     * @param reflector Reflector substitution alphabet (default: historical reflector B)
     * @details Initializes the Enigma machine with specified rotors and reflector.
     *          All rotors start at position 0.
     */
    constructor(
        rotors: string[] = [
            "EKMFLGDQVZNTOWYHXUSPAIBRCJ",
            "AJDKSIRUXBLHWTMCQGZNPYFVOE",
            "BDFHJLCPRTXVZNYEIWGAKMUSQO"
        ],
        reflector: string = "YRUHQSLDPXNGOKMIEBFZCWVJAT"
    ) {
        super();
        this.rotors = rotors;
        this.reflector = reflector;
        this.positions = Array(rotors.length).fill(0);
    }

    /**
     * @brief Advances the rotor positions for the next encryption
     * @details Implements the rotor stepping mechanism. The first rotor always advances,
     *          and subsequent rotors advance when the previous rotor completes a full rotation.
     *          This creates the polyalphabetic nature of the Enigma cipher.
     */
    private step(): void {
        this.positions[0] = this.mod(this.positions[0] + 1, 26);

        for (let i = 0; i < this.positions.length - 1; i++) {
            if (this.positions[i] === 0) {
                this.positions[i + 1] = this.mod(this.positions[i + 1] + 1, 26);
            }
        }
    }

    /**
     * @brief Encodes plaintext using the Enigma machine simulation
     * @param plainText The text to encode (default: empty string)
     * @return The encoded text with Enigma rotor transformations applied
     * @details For each character: steps rotors, passes through rotors forward,
     *          reflects through reflector, then passes back through rotors in reverse.
     *          Non-alphabetic characters are preserved unchanged.
     */
    encode(plainText: string = ""): string {
        let output = "";

        for (const ch of plainText.toUpperCase()) {
            if (!/[A-Z]/.test(ch)) {
                output += ch;
                continue;
            }

            this.step();

            // Initial index in alphabet
            let idx = EnigmaCipher.ALPHABET.indexOf(ch);

            // Forward through rotors
            for (let r = 0; r < this.rotors.length; r++) {
                const rotor = this.rotors[r];
                const shifted = this.mod(idx + this.positions[r], 26);
                const mappedChar = rotor[shifted];
                idx = this.mod(EnigmaCipher.ALPHABET.indexOf(mappedChar) - this.positions[r], 26);
            }

            // Reflector
            idx = EnigmaCipher.ALPHABET.indexOf(this.reflector[idx]);

            // Back through rotors (reverse)
            for (let r = this.rotors.length - 1; r >= 0; r--) {
                const rotor = this.rotors[r];
                const shifted = this.mod(idx + this.positions[r], 26);
                const pos = rotor.indexOf(EnigmaCipher.ALPHABET[shifted]);
                idx = this.mod(pos - this.positions[r], 26);
            }

            output += EnigmaCipher.ALPHABET[idx];
        }

        return output;
    }

    /**
     * @brief Decodes Enigma cipher text back to plaintext
     * @param cipherText The encoded text to decode (default: empty string)
     * @return The decoded plaintext
     * @details Due to the symmetric nature of the Enigma machine (reciprocal cipher),
     *          the same encoding process serves for decoding. The reflector ensures
     *          that E(E(x)) = x for any character x.
     */
    decode(cipherText: string = ""): string {
        // Enigma is symmetrical
        return this.encode(cipherText);
    }
}
