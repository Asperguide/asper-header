import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

export class BifidCipher extends BaseCipher {
    readonly CipherName = "Bifid";

    constructor() {
        super();
    }

    encode(plainText: string = ""): string {
        const poly = new PolybiusCipher();
        const sanitizedText = this.sanitize(plainText);

        // Convert each character to Polybius coordinates without spaces
        const pairs: string[] = [];
        for (const ch of sanitizedText) {
            pairs.push(poly.encode(ch).replace(/\s/g, ""));
        }

        // Flatten into single digits array
        const coords: number[] = pairs.join("").split("").map(Number);

        // Split and rearrange coordinates
        const half = Math.ceil(coords.length / 2);
        const rearranged = coords.slice(0, half).concat(coords.slice(half));

        // Reconstruct letters from paired coordinates
        const output: string[] = [];
        for (let i = 0; i < rearranged.length; i += 2) {
            const code = String(rearranged[i]) + String(rearranged[i + 1]);
            output.push(poly.decode(code));
        }

        return output.join("");
    }

    decode(cipherText: string = ""): string {
        const poly = new PolybiusCipher();
        const sanitizedText = this.sanitize(cipherText);

        // Convert each character to Polybius coordinates without spaces
        const pairs: string[] = [];
        for (const ch of sanitizedText) {
            pairs.push(poly.encode(ch).replace(/\s/g, ""));
        }

        // Flatten into single digits array
        const coords: number[] = pairs.join("").split("").map(Number);

        // Split coordinates into two halves
        const half = Math.floor(coords.length / 2);
        const firstHalf = coords.slice(0, half);
        const secondHalf = coords.slice(half);

        // Reconstruct letters from paired coordinates
        const output: string[] = [];
        for (let i = 0; i < firstHalf.length; i++) {
            const code = String(firstHalf[i]) + String(secondHalf[i]);
            output.push(poly.decode(code));
        }

        return output.join("");
    }
}
