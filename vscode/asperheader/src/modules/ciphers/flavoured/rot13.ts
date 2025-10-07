import { BaseCipher } from "../base/baseCipher";

export class ROT13Cipher extends BaseCipher {
    readonly CipherName = "ROT13";

    constructor() {
        super();
    }

    /**
     * Encodes (or decodes) a string using the ROT13 substitution.
     * Each letter is shifted by 13 positions in the alphabet.
     */
    encode(input: string): string {
        return input
            .split("")
            .map(character => this.shiftChar(character, 13))
            .join("");
    }

    /**
     * ROT13 is symmetrical — encoding twice restores the original.
     */
    decode(input: string): string {
        return this.encode(input);
    }
}
