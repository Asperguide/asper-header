import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

export class NihilistCipher extends BaseCipher {
    readonly CipherName = "Nihilist";

    constructor() {
        super();
    }

    encode(plainText: string = "", key: string = ""): string {
        const poly = new PolybiusCipher();

        // Convert key to numbers via Polybius
        const keyNums = this.sanitize(key)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Convert plaintext to numbers via Polybius
        const plainNums = this.sanitize(plainText)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Add key numbers to plaintext numbers cyclically
        const encodedNums = plainNums.map((num, i) => num + keyNums[i % keyNums.length]);

        return encodedNums.join(" ");
    }

    decode(cipherText: string = "", key: string = ""): string {
        const poly = new PolybiusCipher();

        // Convert key to numbers via Polybius
        const keyNums = this.sanitize(key)
            .split("")
            .map(ch => Number(poly.encode(ch).replace(/\s/g, "")));

        // Convert ciphertext to numbers
        const cipherNums = cipherText.split(" ").map(n => Number(n));

        // Subtract key numbers cyclically and decode via Polybius
        const letters = cipherNums.map((num, i) => {
            const val = num - keyNums[i % keyNums.length];
            return poly.decode(String(val));
        });

        return letters.join("");
    }
}
