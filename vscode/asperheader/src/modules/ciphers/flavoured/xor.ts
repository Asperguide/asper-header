import { BaseCipher } from "../base/baseCipher";

/**
 * XOR Cipher
 *
 * Performs a simple byte-wise XOR of plaintext with the repeating key.
 * Output is encoded as hexadecimal for safe transport.
 */
export class XORCipher extends BaseCipher {
    readonly CipherName = "XOR";

    constructor() {
        super();
    }

    /**
     * Encode plaintext using XOR with the provided key.
     * Returns a hexadecimal string.
     */
    encode(plaintext: string, key: string): string {
        if (!key) {
            throw new Error("Key required");
        }

        const keyBuffer = Buffer.from(key);
        const plainBuffer = Buffer.from(plaintext);
        const output = Buffer.alloc(plainBuffer.length);

        for (let i = 0; i < plainBuffer.length; i++) {
            output[i] = plainBuffer[i] ^ keyBuffer[i % keyBuffer.length];
        }

        return output.toString("hex");
    }

    /**
     * Decode a hexadecimal XOR ciphertext using the same key.
     */
    decode(ciphertext: string, key: string): string {
        if (!key) {
            throw new Error("Key required");
        }

        const keyBuffer = Buffer.from(key);
        const cipherBuffer = Buffer.from(ciphertext, "hex");
        const output = Buffer.alloc(cipherBuffer.length);

        for (let i = 0; i < cipherBuffer.length; i++) {
            output[i] = cipherBuffer[i] ^ keyBuffer[i % keyBuffer.length];
        }

        return output.toString();
    }
}
