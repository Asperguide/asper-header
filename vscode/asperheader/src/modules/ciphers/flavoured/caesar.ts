import { BaseCipher } from "../base/baseCipher";

export class CaesarCipher extends BaseCipher {
    private shift: number;
    readonly CipherName = "Caesar";

    constructor(shift: number = 3) {
        super();
        this.shift = shift;
    }

    encode(plainText: string = ""): string {
        const output: string[] = [];

        for (const ch of plainText) {
            const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (index === -1) {
                output.push(ch);
                continue;
            }

            const cipherIndex = this.mod(index + this.shift, 26);
            output.push(BaseCipher.ALPHABET[cipherIndex]);
        }

        return output.join("");
    }

    decode(cipherText: string = ""): string {
        const output: string[] = [];

        for (const ch of cipherText) {
            const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (index === -1) {
                output.push(ch);
                continue;
            }

            const plainIndex = this.mod(index - this.shift, 26);
            output.push(BaseCipher.ALPHABET[plainIndex]);
        }

        return output.join("");
    }
}
