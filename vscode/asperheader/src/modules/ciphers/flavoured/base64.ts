import { BaseCipher } from "../base/baseCipher";

export class Base64Cipher extends BaseCipher {
    readonly CipherName = "Base64";

    constructor() {
        super();
    }

    encode(plainText: string = ""): string {
        const buffer = Buffer.from(plainText);
        const encoded = buffer.toString("base64");
        return encoded;
    }

    decode(cipherText: string = ""): string {
        const buffer = Buffer.from(cipherText, "base64");
        const decoded = buffer.toString();
        return decoded;
    }
}
