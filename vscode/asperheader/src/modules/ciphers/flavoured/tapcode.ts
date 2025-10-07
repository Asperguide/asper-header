import { BaseCipher } from "../base/baseCipher";

/**
 * The Tap Code Cipher encodes letters using a 5x5 Polybius square
 * (I and J share the same cell). Each letter is represented by
 * two groups of dots — the first for the row, the second for the column.
 */
export class TapCodeCipher extends BaseCipher {
    readonly CipherName = "Tap Code";

    // 5x5 grid of letters, excluding J
    static readonly ALPHABET: string = "ABCDEFGHIKLMNOPQRSTUVWXYZ";

    constructor() {
        super();
    }

    /**
     * Encode plaintext into Tap Code notation (dot groups separated by spaces).
     * Example: "HELLO" → ".. .... / . ..... / ... . / ... . / .... ..."
     */
    encode(plaintext: string): string {
        const letters = TapCodeCipher.ALPHABET;
        const result: string[] = [];

        for (const ch of plaintext.toUpperCase()) {
            if (ch === 'J') {
                // I/J share the same position (I)
                result.push('.. ...');
            }
            else if (/[A-Z]/.test(ch)) {
                const index = letters.indexOf(ch === 'J' ? 'I' : ch);
                const row = Math.floor(index / 5) + 1;
                const col = (index % 5) + 1;

                result.push('.'.repeat(row) + ' ' + '.'.repeat(col));
            }
            else {
                // Preserve non-alphabetic characters
                result.push(ch);
            }
        }

        return result.join(' / ');
    }

    /**
     * Decode Tap Code back into plaintext.
     */
    decode(ciphertext: string): string {
        const letters = TapCodeCipher.ALPHABET;

        return ciphertext
            .split(' / ')
            .map(token => {
                if (!token.trim()) {
                    return '';
                }

                const [rowDots, colDots] = token.split(' ');

                // Handle malformed tokens gracefully
                if (!rowDots || !colDots) {
                    return token;
                }

                const row = rowDots.length;
                const col = colDots.length;
                const index = (row - 1) * 5 + (col - 1);

                return letters[index] ?? '?';
            })
            .join('');
    }
}
