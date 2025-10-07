import { BaseCipher } from "../base/baseCipher";
import { MorseBasicCipher } from "./morseBasic";

export class FractionatedMorseCipher extends BaseCipher {
    readonly CipherName = "FractionatedMorse";

    private alphabet: string;
    private table: Record<string, string>;

    constructor() {
        super();
        this.alphabet = FractionatedMorseCipher.ALPHABET + '0123456789';
        this.table = {};

        // For simplicity, map each character to itself (placeholder table)
        for (const ch of this.alphabet) {
            this.table[ch] = ch;
        }

        // TODO: Implement proper triplet-to-character mapping for real fractionated Morse
    }

    encode(plainText: string = ""): string {
        // Currently uses MorseBasicCipher as a placeholder
        const morse = new MorseBasicCipher();
        return morse.encode(plainText);
    }

    decode(cipherText: string = ""): string {
        const morse = new MorseBasicCipher();
        return morse.decode(cipherText);
    }
}
