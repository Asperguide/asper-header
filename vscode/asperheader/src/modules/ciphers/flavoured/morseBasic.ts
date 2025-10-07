import { BaseCipher } from "../base/baseCipher";

export class MorseBasicCipher extends BaseCipher {
    readonly CipherName = "MorseBasic";

    private map: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
        'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.'
    };

    encode(plainText: string = ""): string {
        return plainText
            .split("")
            .map(c => this.map[c.toUpperCase()] ?? c)
            .join(" ");
    }

    decode(cipherText: string = ""): string {
        const inverseMap: Record<string, string> = {};
        for (const key in this.map) {
            inverseMap[this.map[key]] = key;
        }

        return cipherText
            .split(" ")
            .map(code => inverseMap[code] ?? code)
            .join("");
    }
}
