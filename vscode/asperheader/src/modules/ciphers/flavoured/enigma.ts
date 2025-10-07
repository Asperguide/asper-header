import { BaseCipher } from "../base/baseCipher";

export class EnigmaCipher extends BaseCipher {
    readonly CipherName = "Enigma";

    rotors: string[];
    reflector: string;
    positions: number[];

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

    private step(): void {
        this.positions[0] = this.mod(this.positions[0] + 1, 26);

        for (let i = 0; i < this.positions.length - 1; i++) {
            if (this.positions[i] === 0) {
                this.positions[i + 1] = this.mod(this.positions[i + 1] + 1, 26);
            }
        }
    }

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

    decode(cipherText: string = ""): string {
        // Enigma is symmetrical
        return this.encode(cipherText);
    }
}
