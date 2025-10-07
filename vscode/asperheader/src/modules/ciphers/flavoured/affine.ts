import { BaseCipher } from "../base/baseCipher";

export class AffineCipher extends BaseCipher {
    private readonly a: number;
    private readonly b: number;
    readonly CipherName = "Affine";
    constructor(a: number = 5, b: number = 8) {
        super();
        this.a = a;
        this.b = b;
        if (this.gcd(this.a, 26) !== 1) {
            throw new Error("a must be coprime with 26");
        }
    }

    private gcd(a: number, b: number): number {
        return b === 0 ? a : this.gcd(b, a % b);
    }

    encode(plainText: string = ""): string {
        return plainText
            .toUpperCase()
            .split("")
            .map(ch => {
                const i = BaseCipher.ALPHABET.indexOf(ch);
                if (i === -1) {
                    return ch;
                }// preserve non-letters
                return BaseCipher.ALPHABET[this.mod(this.a * i + this.b, 26)];
            })
            .join("");
    }

    decode(cipherText: string = ""): string {
        const invA = this.modInverse(this.a, 26);
        return cipherText
            .toUpperCase()
            .split("")
            .map(ch => {
                const i = BaseCipher.ALPHABET.indexOf(ch);
                if (i === -1) {
                    return ch;
                }
                return BaseCipher.ALPHABET[this.mod(invA * (i - this.b), 26)];
            })
            .join("");
    }
}
