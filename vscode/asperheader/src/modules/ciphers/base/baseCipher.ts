import { CipherI } from "./cipherInterface";


export abstract class BaseCipher implements CipherI {
    abstract encode(plaintext: string, key?: any): string;
    abstract decode(ciphertext: string, key?: any): string;
    abstract readonly CipherName: string;

    static readonly ALPHABET: string = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    // Optional shared utility methods
    protected sanitize(text: string): string {
        return text.toUpperCase().replace(/[^A-Z]/g, '');
    }

    protected mod(n: number, m: number): number {
        return ((n % m) + m) % m;
    }

    protected modInverse(a: number, m: number): number {
        a = this.mod(a, m);
        for (let x = 1; x < m; x++) {
            if (this.mod(a * x, m) === 1) {
                return x;
            }
        }
        throw new Error("No modular inverse");
    }
    protected shiftChar(ch: string, shift: number): string {
        const i = BaseCipher.ALPHABET.indexOf(ch.toUpperCase());
        if (i === -1) {
            return ch;
        };
        return BaseCipher.ALPHABET[this.mod(i + shift, 26)];
    }
}
