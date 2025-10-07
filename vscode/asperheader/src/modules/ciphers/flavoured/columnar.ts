import { BaseCipher } from "../base/baseCipher";

export class ColumnarCipher extends BaseCipher {
    readonly CipherName = "Columnar";

    constructor() {
        super();
    }

    private getOrder(key: string = ""): number[] {
        const cleanKey = this.sanitize(key);
        const indexedChars: { ch: string; i: number }[] = [];

        for (let i = 0; i < cleanKey.length; i++) {
            indexedChars.push({ ch: cleanKey[i], i });
        }

        indexedChars.sort((a, b) => a.ch.localeCompare(b.ch));

        const order: number[] = [];
        for (const item of indexedChars) {
            order.push(item.i);
        }

        return order;
    }

    encode(plainText: string = "", key: string = ""): string {
        const order = this.getOrder(key);
        const cols = order.length;
        const rows = Math.ceil(plainText.length / cols);
        const grid: string[] = Array(cols).fill("");

        for (let i = 0; i < plainText.length; i++) {
            const colIndex = i % cols;
            grid[colIndex] += plainText[i];
        }

        let output = "";
        for (const colIndex of order) {
            output += grid[colIndex];
        }

        return output;
    }

    decode(cipherText: string = "", key: string = ""): string {
        const order = this.getOrder(key);
        const cols = order.length;
        const rows = Math.ceil(cipherText.length / cols);

        // Calculate lengths of each column
        const colLengths: number[] = Array(cols).fill(Math.floor(cipherText.length / cols));
        let remainder = cipherText.length - colLengths.reduce((sum, len) => sum + len, 0);
        for (let i = 0; i < remainder; i++) {
            colLengths[i]++;
        }

        // Fill each column from cipherText
        const columns: string[] = Array(cols).fill("");
        let pos = 0;
        for (let i = 0; i < cols; i++) {
            const colIndex = order[i];
            columns[colIndex] = cipherText.substr(pos, colLengths[i]);
            pos += colLengths[i];
        }

        // Read row by row to reconstruct plaintext
        let output = "";
        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                output += columns[c][r] ?? "";
            }
        }

        return output;
    }
}
