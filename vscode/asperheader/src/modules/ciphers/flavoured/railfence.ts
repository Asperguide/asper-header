import { BaseCipher } from "../base/baseCipher";

export class RailFenceCipher extends BaseCipher {
    readonly CipherName = "RailFence";

    constructor() {
        super();
    }

    encode(plainText: string, rails: number = 3): string {
        if (rails <= 1) {
            return plainText;
        }

        const rows: string[][] = Array.from({ length: rails }, () => []);
        let currentRow = 0;
        let direction = 1; // 1 = down, -1 = up

        for (const character of plainText) {
            rows[currentRow].push(character);

            currentRow += direction;

            // Change direction when hitting top or bottom rail
            if (currentRow === rails - 1 || currentRow === 0) {
                direction *= -1;
            }
        }

        // Combine all rows into a single string
        const cipherText = rows.map(row => row.join("")).join("");

        return cipherText;
    }

    decode(cipherText: string, rails: number = 3): string {
        if (rails <= 1) {
            return cipherText;
        }

        const textLength = cipherText.length;
        const railPattern: number[] = [];

        let currentRow = 0;
        let direction = 1;

        // Determine the zigzag pattern used during encoding
        for (let i = 0; i < textLength; i++) {
            railPattern.push(currentRow);

            currentRow += direction;

            if (currentRow === rails - 1 || currentRow === 0) {
                direction *= -1;
            }
        }

        // Count how many characters belong to each rail
        const railCharacterCounts = Array(rails).fill(0);
        for (const rowIndex of railPattern) {
            railCharacterCounts[rowIndex]++;
        }

        // Slice the ciphertext into its rails
        const railsContent: string[][] = Array.from({ length: rails }, () => []);
        let currentPosition = 0;

        for (let rowIndex = 0; rowIndex < rails; rowIndex++) {
            const rowLength = railCharacterCounts[rowIndex];
            const rowCharacters = cipherText
                .slice(currentPosition, currentPosition + rowLength)
                .split("");

            railsContent[rowIndex] = rowCharacters;
            currentPosition += rowLength;
        }

        // Reconstruct plaintext by following the original pattern
        const rowIndices = Array(rails).fill(0);
        let plainText = "";

        for (const rowIndex of railPattern) {
            plainText += railsContent[rowIndex][rowIndices[rowIndex]];
            rowIndices[rowIndex]++;
        }

        return plainText;
    }
}
