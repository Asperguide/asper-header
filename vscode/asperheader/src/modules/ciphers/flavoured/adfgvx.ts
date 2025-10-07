import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";

export class ADFGVXCipher extends BaseCipher {
    private readonly labels = ['A', 'D', 'F', 'G', 'V', 'X'];
    private readonly square: string[];

    readonly CipherName = "ADFGVX";

    constructor() {
        super();
        // 6x6 square with A-Z and 0-9
        this.square = (BaseCipher.ALPHABET + '0123456789').split('');
    }
    encode(plainText: string = '', key: string = ''): string {
        const clean = plainText.toUpperCase();
        let pairs = '';
        for (const ch of clean) {
            const idx = this.square.indexOf(ch);
            if (idx === -1) {
                pairs += ch; continue;
            }
            const r = Math.floor(idx / 6), c = idx % 6;
            pairs += this.labels[r] + this.labels[c];
        }
        // then columnar transposition
        return new ColumnarCipher().encode(pairs, key);
    }
    decode(ciphertext: string = '', key: string = ''): string {
        const pairs = new ColumnarCipher().decode(ciphertext, key).match(/../g) || [];
        let out = '';
        for (const p of pairs) {
            const r = this.labels.indexOf(p[0]);
            const c = this.labels.indexOf(p[1]);
            if (r === -1 || c === -1) {
                out += p;
            } else {
                out += this.square[r * 6 + c];
            }
        }
        return out;
    }
}
