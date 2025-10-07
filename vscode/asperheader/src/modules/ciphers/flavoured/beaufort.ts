import { BaseCipher } from "../base/baseCipher";

export class BeaufortCipher extends BaseCipher {
    readonly CipherName = "Beaufort";

    constructor() {
        super();
    }

    encode(plainText: string = "", key: string = ""): string {
        const cleanKey = this.sanitize(key);
        const cleanText = this.sanitize(plainText);
        const output: string[] = [];

        for (let i = 0; i < cleanText.length; i++) {
            const ch = cleanText[i];
            const textIndex = BaseCipher.ALPHABET.indexOf(ch);
            if (textIndex === -1) {
                output.push(ch);
                continue;
            }

            const keyIndex = BaseCipher.ALPHABET.indexOf(cleanKey[i % cleanKey.length]);
            const cipherIndex = this.mod(keyIndex - textIndex, 26);
            output.push(BaseCipher.ALPHABET[cipherIndex]);
        }

        return output.join("");
    }

    decode(cipherText: string = "", key: string = ""): string {
        // Beaufort is symmetric; encoding and decoding are identical
        return this.encode(cipherText, key);
    }
}
