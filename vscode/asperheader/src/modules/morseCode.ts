import { logger, LogType } from "./logger";
import { getMessage } from "./messageProvider";

export class MorseTranslator {
    private static readonly log: LogType = logger;
    private static readonly MORSE_CODE: Record<string, string> = {
        'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..',
        'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
        'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
        'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
        'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-',
        'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
        'Y': '-.--', 'Z': '--..',
        '0': '-----', '1': '.----', '2': '..---', '3': '...--',
        '4': '....-', '5': '.....', '6': '-....', '7': '--...',
        '8': '---..', '9': '----.',
        '.': '.-.-.-', ',': '--..--', '?': '..--..',
        "'": '.----.', '!': '-.-.--', '/': '-..-.',
        '(': '-.--.', ')': '-.--.-', '&': '.-...',
        ':': '---...', ';': '-.-.-.', '=': '-...-',
        '+': '.-.-.', '-': '-....-', '_': '..--.-',
        '"': '.-..-.', '$': '...-..-', '@': '.--.-.',
        ' ': '/',       // space between words
        '\n': '//'      // end of sentence or line
    };
    private static readonly REVERSE_MORSE_CODE: Record<string, string> = (() => {
        const rev: Record<string, string> = {};
        for (const [char, code] of Object.entries(MorseTranslator.MORSE_CODE)) {
            rev[code] = char;
        }
        return rev;
    })();


    public static toMorse(input: string): string {
        const final: string = input
            .toUpperCase()
            .split('')
            .map(char => MorseTranslator.MORSE_CODE[char] ?? '')
            .join(' ');
        this.log.info(getMessage("morseConverted", input, final));
        return final;
    }
    public static fromMorse(morseInput: string): string {
        const decoded = morseInput
            .split(' ')
            .map(symbol => MorseTranslator.REVERSE_MORSE_CODE[symbol] ?? '')
            .join('')
            .replace(/\/\//g, '\n')
            .replace(/\//g, ' ');

        this.log.info(getMessage("morseDecoded", morseInput, decoded));
        return decoded;
    }

};
