import { BaseCipher } from "../base/baseCipher";

export class MonoalphabeticCipher extends BaseCipher {
    readonly CipherName = "Monoalphabetic";

    private mapping: Record<string, string>;
    private inverse: Record<string, string>;

    constructor(mapAlphabet: string = "") {
        super();

        const sanitizedMap = this.sanitize(mapAlphabet);

        if (sanitizedMap.length !== 26) {
            throw new Error("mapAlphabet must have 26 letters");
        }

        this.mapping = {};
        this.inverse = {};

        for (let i = 0; i < 26; i++) {
            this.mapping[MonoalphabeticCipher.ALPHABET[i]] = sanitizedMap[i];
            this.inverse[sanitizedMap[i]] = MonoalphabeticCipher.ALPHABET[i];
        }
    }

    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(c => this.mapping[c.toUpperCase()] ?? c)
            .join("");
    }

    decode(cipherText: string = ""): string {
        return cipherText
            .split("")
            .map(c => this.inverse[c.toUpperCase()] ?? c)
            .join("");
    }
}
