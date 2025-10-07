import { BaseCipher } from "../base/baseCipher";

export class BaudotCipher extends BaseCipher {
    readonly CipherName = "Baudot";
    private readonly letters: Record<string, string>;
    private readonly inverseLetters: Record<string, string>;

    constructor() {
        super();

        this.letters = {
            'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
            'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
            'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
            'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
            'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
            'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
            'Y': '-.--', 'Z': '--..'
        };

        this.inverseLetters = {};
        for (const letter in this.letters) {
            this.inverseLetters[this.letters[letter]] = letter;
        }
    }

    encode(plainText: string = ""): string {
        const encodedTokens: string[] = [];

        for (const ch of plainText) {
            const token = this.letters[ch.toUpperCase()] ?? ch;
            encodedTokens.push(token);
        }

        return encodedTokens.join(" ");
    }

    decode(cipherText: string = ""): string {
        const decodedTokens: string[] = [];

        const tokens = cipherText.split(" ");
        for (const token of tokens) {
            decodedTokens.push(this.inverseLetters[token] ?? token);
        }

        return decodedTokens.join("");
    }
}
