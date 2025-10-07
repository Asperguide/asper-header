import { BaseCipher } from "../base/baseCipher";

export class BaconCipher extends BaseCipher {
    readonly CipherName = "Bacon";

    constructor() {
        super();
    }

    private encodeChar(ch: string): string {
        const index = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
        if (index === -1) {
            return ch;
        }

        const binary = index.toString(2).padStart(5, "0");
        return binary.replace(/0/g, "A").replace(/1/g, "B");
    }

    private decodeToken(token: string): string {
        if (!/^[AB]{5}$/.test(token)) {
            return token;
        }

        const binary = token.replace(/A/g, "0").replace(/B/g, "1");
        const index = parseInt(binary, 2);
        return BaseCipher.ALPHABET[index] ?? "?";
    }

    encode(plainText: string = ""): string {
        const tokens: string[] = [];

        for (const ch of plainText) {
            tokens.push(this.encodeChar(ch));
        }

        return tokens.join(" ");
    }

    decode(cipherText: string = ""): string {
        const tokens: string[] = cipherText.split(/\s+/);
        const output: string[] = [];

        for (const token of tokens) {
            output.push(this.decodeToken(token));
        }

        return output.join("");
    }
}
