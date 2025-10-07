import { BaseCipher } from "../base/baseCipher";

export class KeywordCipher extends BaseCipher {
    readonly CipherName = "Keyword";

    private mapping: Record<string, string>;
    private inverse: Record<string, string>;

    constructor(keyword: string = "") {
        super();

        const sanitizedKeyword = this.sanitize(keyword);
        const seen = new Set<string>();
        const keyAlphabet: string[] = [];

        // Add unique letters from the keyword first
        for (const ch of sanitizedKeyword) {
            if (!seen.has(ch)) {
                seen.add(ch);
                keyAlphabet.push(ch);
            }
        }

        // Fill in the rest of the alphabet
        for (const ch of KeywordCipher.ALPHABET) {
            if (!seen.has(ch)) {
                keyAlphabet.push(ch);
            }
        }

        // Build mapping and inverse mapping
        this.mapping = {};
        this.inverse = {};
        for (let i = 0; i < 26; i++) {
            this.mapping[KeywordCipher.ALPHABET[i]] = keyAlphabet[i];
            this.inverse[keyAlphabet[i]] = KeywordCipher.ALPHABET[i];
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
