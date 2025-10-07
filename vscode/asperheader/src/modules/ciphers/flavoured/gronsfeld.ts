import { BaseCipher } from "../base/baseCipher";

export class GronsfeldCipher extends BaseCipher {
    readonly CipherName = "Gronsfeld";

    constructor() {
        super();
    }

    encode(plainText: string = "", key: string = ""): string {
        const numericKey = key.replace(/[^0-9]/g, '');
        if (!numericKey) {
            throw new Error('Numeric key required');
        }

        let keyIndex = 0;
        return plainText.split('').map(ch => {
            const charIndex = GronsfeldCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (charIndex === -1) {
                return ch;
            }

            const shift = Number(numericKey[keyIndex % numericKey.length]);
            keyIndex++;
            return GronsfeldCipher.ALPHABET[this.mod(charIndex + shift, 26)];
        }).join('');
    }

    decode(cipherText: string = "", key: string = ""): string {
        const numericKey = key.replace(/[^0-9]/g, '');
        if (!numericKey) {
            throw new Error('Numeric key required');
        }

        let keyIndex = 0;
        return cipherText.split('').map(ch => {
            const charIndex = GronsfeldCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (charIndex === -1) {
                return ch;
            }

            const shift = Number(numericKey[keyIndex % numericKey.length]);
            keyIndex++;
            return GronsfeldCipher.ALPHABET[this.mod(charIndex - shift, 26)];
        }).join('');
    }
}
