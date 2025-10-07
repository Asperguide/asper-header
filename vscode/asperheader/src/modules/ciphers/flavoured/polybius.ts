import { BaseCipher } from "../base/baseCipher";

export class PolybiusCipher extends BaseCipher {
    readonly CipherName = "Polybius";

    private grid: Record<string, string> = {};
    private inverse: Record<string, string> = {};

    constructor() {
        super();

        // Create 5x5 grid for letters A-Z (merge I/J)
        const letters = PolybiusCipher.ALPHABET.replace('J', '');
        let idx = 0;

        for (let r = 1; r <= 5; r++) {
            for (let c = 1; c <= 5; c++) {
                const ch = letters[idx++];
                const key = `${r}${c}`;
                this.grid[ch] = key;
                this.inverse[key] = ch;
            }
        }
    }

    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(ch => {
                const up = ch.toUpperCase();
                if (up === 'J') {
                    return this.grid['I'];
                }
                if (/[A-Z]/.test(up)) {
                    return this.grid[up] ?? ch;
                }
                return ch;
            })
            .join(' ');
    }

    decode(cipherText: string = ""): string {
        return cipherText
            .split(/\s+/)
            .map(tok => this.inverse[tok] ?? tok)
            .join('');
    }
}
