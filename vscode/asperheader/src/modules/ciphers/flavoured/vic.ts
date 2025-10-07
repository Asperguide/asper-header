import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";
import { VigenereCipher } from "./vigenere";

/**
 * Simplified VIC Cipher
 * 
 * The historical VIC cipher was a highly complex Soviet cipher combining
 * multiple steps: transposition, digit conversion, and polyalphabetic substitution.
 * 
 * This simplified version models its spirit by chaining:
 *   1. Columnar Transposition (using key)
 *   2. Vigenère Cipher (using same key)
 */
export class VICCipher extends BaseCipher {
    readonly CipherName = "VIC";

    constructor() {
        super();
    }

    /**
     * Encode plaintext using Columnar → Vigenère
     */
    encode(plaintext: string, key: string): string {
        const columnar = new ColumnarCipher();
        const vigenere = new VigenereCipher();

        const sanitized = this.sanitize(plaintext);
        const transposed = columnar.encode(sanitized, key);
        return vigenere.encode(transposed, key);
    }

    /**
     * Decode ciphertext using Vigenère → Columnar
     */
    decode(ciphertext: string, key: string): string {
        const columnar = new ColumnarCipher();
        const vigenere = new VigenereCipher();

        const intermediate = vigenere.decode(ciphertext, key);
        return columnar.decode(intermediate, key);
    }
}
