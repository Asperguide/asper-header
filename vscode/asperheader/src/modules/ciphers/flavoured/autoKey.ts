import { BaseCipher } from "../base/baseCipher";

export class AutokeyCipher extends BaseCipher {
    readonly CipherName = "Autokey";

    constructor() {
        super();
    }

    encode(plainText: string = "", key: string = ""): string {
        const cleanPT = this.sanitize(plainText);
        const cleanKey = this.sanitize(key);
        let fullKey = (cleanKey + cleanPT).slice(0, cleanPT.length);

        let out = "";
        for (let i = 0; i < cleanPT.length; i++) {
            const p = BaseCipher.ALPHABET.indexOf(cleanPT[i]);
            const k = BaseCipher.ALPHABET.indexOf(fullKey[i]);
            out += BaseCipher.ALPHABET[this.mod(p + k, 26)];
        }
        return out;
    }

    decode(cipherText: string = "", key: string = ""): string {
        const cleanCT = this.sanitize(cipherText);
        let fullKey = this.sanitize(key).split("");

        let out = "";
        for (const ch of cleanCT) {
            const c = BaseCipher.ALPHABET.indexOf(ch);
            const k = BaseCipher.ALPHABET.indexOf(fullKey[0]);
            const p = BaseCipher.ALPHABET[this.mod(c - k, 26)];

            out += p;
            fullKey.push(p); // append plaintext to key
            fullKey.shift(); // maintain rolling window
        }
        return out;
    }
}
