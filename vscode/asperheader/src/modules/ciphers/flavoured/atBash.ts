import { BaseCipher } from "../base/baseCipher";

export class AtbashCipher extends BaseCipher {
    readonly CipherName = "Atbash";
    private readonly map: Record<string, string>;

    constructor() {
        super();
        this.map = {};

        const alphabet = BaseCipher.ALPHABET;
        for (let i = 0; i < alphabet.length; i++) {
            this.map[alphabet[i]] = alphabet[alphabet.length - 1 - i];
        }
    }

    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(ch => this.map[ch.toUpperCase()] ?? ch)
            .join("");
    }

    decode(cipherText: string = ""): string {
        // Atbash is symmetric — same as encode
        return this.encode(cipherText);
    }
}
