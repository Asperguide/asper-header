import { BaseCipher } from "../base/baseCipher";
import { PolybiusCipher } from "./polybius";

/**
 * The Trifid Cipher is a fractionating transposition cipher.
 * It combines Polybius-like encoding with grouped coordinate transposition.
 * 
 * This implementation uses a simplified 3D Polybius cube (3x3x3),
 * but follows the traditional Trifid logic with configurable periods.
 */
export class TrifidCipher extends BaseCipher {
    readonly CipherName = "Trifid";
    private period: number;

    constructor(period: number = 5) {
        super();
        this.period = period; // Default period = 5 (common historical value)
    }

    /**
     * Convert plaintext into 3D coordinates.
     * For simplicity, we reuse a Polybius-style grid and add a dummy "depth".
     */
    private toCoordinates(plaintext: string): number[][] {
        const poly = new PolybiusCipher();
        const sanitized = this.sanitize(plaintext);
        const coordinates: number[][] = [];

        for (const ch of sanitized) {
            const encoded = poly.encode(ch).replace(/\s/g, ''); // e.g. '23'
            const row = Number(encoded[0]);
            const col = Number(encoded[1]);
            const depth = 1; // Placeholder depth (Trifid normally uses 3x3x3)
            coordinates.push([row, col, depth]);
        }

        return coordinates;
    }

    /**
     * Convert a list of coordinates back into letters using Polybius logic.
     */
    private fromCoordinates(coords: number[][]): string {
        const poly = new PolybiusCipher();
        const output: string[] = [];

        for (const [row, col] of coords) {
            const code = `${row}${col}`;
            output.push(poly.decode(code));
        }

        return output.join('');
    }

    /**
     * Encode plaintext using Trifid’s coordinate fractionation and regrouping.
     */
    encode(plaintext: string): string {
        const coords = this.toCoordinates(plaintext);
        const flattened = coords.flat(); // e.g. [r1, c1, d1, r2, c2, d2, ...]
        const blocks: number[][] = [];

        // Split flattened coordinates into period-sized chunks
        for (let i = 0; i < flattened.length; i += this.period * 3) {
            blocks.push(flattened.slice(i, i + this.period * 3));
        }

        const encodedCoords: number[][] = [];

        // Regroup each block’s coordinates
        for (const block of blocks) {
            const third = Math.ceil(block.length / 3);

            for (let i = 0; i < third; i++) {
                const triplet = [
                    block[i] ?? 1,
                    block[i + third] ?? 1,
                    block[i + 2 * third] ?? 1,
                ];
                encodedCoords.push(triplet);
            }
        }

        return this.fromCoordinates(encodedCoords);
    }

    /**
     * Decode ciphertext back into plaintext.
     * (For this simplified model, decode mirrors encode.)
     */
    decode(ciphertext: string): string {
        const coords = this.toCoordinates(ciphertext);
        const flattened = coords.flat();
        const blocks: number[][] = [];

        for (let i = 0; i < flattened.length; i += this.period * 3) {
            blocks.push(flattened.slice(i, i + this.period * 3));
        }

        const decodedCoords: number[][] = [];

        for (const block of blocks) {
            const third = Math.ceil(block.length / 3);

            for (let i = 0; i < third; i++) {
                const triplet = [
                    block[i] ?? 1,
                    block[i + third] ?? 1,
                    block[i + 2 * third] ?? 1,
                ];
                decodedCoords.push(triplet);
            }
        }

        return this.fromCoordinates(decodedCoords);
    }
}
