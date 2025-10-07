import { BaseCipher } from "../base/baseCipher";
import { ColumnarCipher } from "./columnar";

export class DoubleTranspositionCipher extends BaseCipher {
    readonly CipherName = "DoubleTransposition";

    constructor() {
        super();
    }

    encode(plainText: string = "", key1: string = "", key2?: string): string {
        const firstKey = key1;
        const secondKey = key2 ?? key1;

        const columnar1 = new ColumnarCipher();
        const columnar2 = new ColumnarCipher();

        const firstPass = columnar1.encode(plainText, firstKey);
        const secondPass = columnar2.encode(firstPass, secondKey);

        return secondPass;
    }

    decode(cipherText: string = "", key1: string = "", key2?: string): string {
        const firstKey = key1;
        const secondKey = key2 ?? key1;

        const columnar1 = new ColumnarCipher();
        const columnar2 = new ColumnarCipher();

        const intermediate = columnar2.decode(cipherText, secondKey);
        const finalText = columnar1.decode(intermediate, firstKey);

        return finalText;
    }
}
