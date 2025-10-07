import { BaseCipher } from "../base/baseCipher";

export class PigpenCipher extends BaseCipher {
    readonly CipherName = "Pigpen";

    private map: Record<string, string> = {};
    private inv: Record<string, string> = {};

    constructor() {
        super();

        // define simple textual mapping for Pigpen (non-graphical)
        const symbols = [
            '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',', '-', '.', '/',
            ':', ';', '<', '=', '>', '?', '@', '[', ']', '^', '_'
        ];

        for (let i = 0; i < 26; i++) {
            this.map[PigpenCipher.ALPHABET[i]] = symbols[i];
            this.inv[symbols[i]] = PigpenCipher.ALPHABET[i];
        }
    }

    encode(plainText: string = ""): string {
        return plainText
            .split('')
            .map(c => this.map[c.toUpperCase()] ?? c)
            .join('');
    }

    decode(cipherText: string = ""): string {
        return cipherText
            .split('')
            .map(c => this.inv[c] ?? c)
            .join('');
    }
}
