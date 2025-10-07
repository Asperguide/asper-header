import {
    ADFGVXCipher, AffineCipher, AtbashCipher, AutokeyCipher,
    BaconCipher, Base64Cipher, BaudotCipher, BeaufortCipher,
    BifidCipher, CaesarCipher, ColumnarCipher, DoubleTranspositionCipher,
    EnigmaCipher, FractionatedMorseCipher, GronsfeldCipher, KeywordCipher,
    MonoalphabeticCipher, MorseBasicCipher, NihilistCipher, PigpenCipher,
    PolybiusCipher, PortaCipher, RailFenceCipher, ROT13Cipher, RouteCipher,
    ScytaleCipher, TapCodeCipher, TrifidCipher, VICCipher, VigenereCipher,
    XORCipher
} from './flavoured';


import { BaseCipher } from "./base/baseCipher";

export class Cipher {
    private cipherMap: Record<string, BaseCipher> = {};

    constructor() {
        const cipherClasses = [
            CaesarCipher,
            ROT13Cipher,
            AtbashCipher,
            MonoalphabeticCipher,
            KeywordCipher,
            AffineCipher,
            BaconCipher,
            PolybiusCipher,
            VigenereCipher,
            AutokeyCipher,
            BeaufortCipher,
            GronsfeldCipher,
            PortaCipher,
            RailFenceCipher,
            ColumnarCipher,
            RouteCipher,
            ScytaleCipher,
            DoubleTranspositionCipher,
            MorseBasicCipher,
            PigpenCipher,
            TapCodeCipher,
            ADFGVXCipher,
            FractionatedMorseCipher,
            BaudotCipher,
            NihilistCipher,
            VICCipher,
            BifidCipher,
            TrifidCipher,
            EnigmaCipher,
            XORCipher,
            Base64Cipher
        ];

        for (const CipherClass of cipherClasses) {
            const instance = new CipherClass();
            // Lowercase the key for case-insensitive lookup
            this.cipherMap[this.normalize(instance.CipherName)] = instance;
        }
    }

    private normalize(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '');
    }

    encode(plaintext: string, key?: any, cipherName?: string): string {
        if (!cipherName) {
            throw new Error("Cipher name required");
        }
        const cipher = this.cipherMap[this.normalize(cipherName)];
        if (!cipher) {
            throw new Error(`Cipher "${cipherName}" not found`);
        }
        return cipher.encode(plaintext, key);
    }

    decode(ciphertext: string, key?: any, cipherName?: string): string {
        if (!cipherName) {
            throw new Error("Cipher name required");
        }
        const cipher = this.cipherMap[this.normalize(cipherName)];
        if (!cipher) {
            throw new Error(`Cipher "${cipherName}" not found`);
        }
        return cipher.decode(ciphertext, key);
    }

    listCiphers(): string[] {
        return Object.keys(this.cipherMap);
    }
}


export const ALLCiphers = {
    Cipher,
    CaesarCipher,
    ROT13Cipher,
    AtbashCipher,
    MonoalphabeticCipher,
    KeywordCipher,
    AffineCipher,
    BaconCipher,
    PolybiusCipher,
    VigenereCipher,
    AutokeyCipher,
    BeaufortCipher,
    GronsfeldCipher,
    PortaCipher,
    RailFenceCipher,
    ColumnarCipher,
    RouteCipher,
    ScytaleCipher,
    DoubleTranspositionCipher,
    MorseBasicCipher,
    PigpenCipher,
    TapCodeCipher,
    ADFGVXCipher,
    FractionatedMorseCipher,
    BaudotCipher,
    NihilistCipher,
    VICCipher,
    BifidCipher,
    TrifidCipher,
    EnigmaCipher,
    XORCipher,
    Base64Cipher
};
