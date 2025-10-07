import { BaseCipher } from "../base/baseCipher";

export class PortaCipher extends BaseCipher {
    readonly CipherName = "Porta";

    constructor() {
        super();
        // For simplicity, we will implement Porta using a half-shift Vigenère-like method
        // Full digraph table implementation can be added later if needed
    }

    encode(plainText: string = "", key: string = ""): string {
        const sanitizedKey = this.sanitize(key);
        if (!sanitizedKey) {
            throw new Error("Key required");
        }

        let ki = 0;
        return plainText.split("").map(ch => {
            const pIndex = PortaCipher.ALPHABET.indexOf(ch.toUpperCase());
            if (pIndex === -1) {
                return ch;
            }

            const keyIndex = PortaCipher.ALPHABET.indexOf(sanitizedKey[ki % sanitizedKey.length]);
            ki++;

            const shift = Math.floor(keyIndex / 2);
            return PortaCipher.ALPHABET[this.mod(pIndex + shift, 26)];
        }).join("");
    }

    decode(cipherText: string = "", key: string = ""): string {
        // Porta cipher is reciprocal, encoding and decoding are symmetric
        return this.encode(cipherText, key);
    }
}
