/**
 * @file ciphers.ts
 * @brief Main cipher management and orchestration module
 * @details This module provides the central Cipher class that manages all available
 *          cipher implementations, offering a unified interface for encoding and
 *          decoding operations across different cipher types.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

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

/**
 * @class Cipher
 * @brief Central cipher management class providing unified access to all cipher implementations
 * @details This class acts as a registry and factory for cipher operations, allowing
 *          users to encode/decode text using any available cipher by name. It handles
 *          cipher instantiation, normalization of cipher names, and provides a consistent
 *          interface for all cryptographic operations.
 */
export class Cipher {
    /**
     * @brief Internal registry mapping normalized cipher names to instances
     * @details Uses lowercase, space-removed keys for case-insensitive lookup
     */
    private cipherMap: Record<string, BaseCipher> = {};

    /**
     * @brief Constructor initializing all available cipher implementations
     * @details Instantiates all cipher classes and registers them in the internal
     *          cipher map with normalized names for consistent lookup.
     */
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

    /**
     * @brief Normalizes cipher names for consistent lookup
     * @param name The cipher name to normalize
     * @return Lowercase name with spaces removed
     * @details Enables case-insensitive cipher lookup by converting names
     *          to a standard format (lowercase, no spaces)
     */
    private normalize(name: string): string {
        return name.toLowerCase().replace(/\s+/g, '');
    }

    /**
     * @brief Encodes plaintext using the specified cipher
     * @param plaintext The text to encode
     * @param key Optional cipher-specific key parameter
     * @param cipherName The name of the cipher to use
     * @return The encoded text
     * @throws Error if cipher name is missing or cipher not found
     * @details Looks up the cipher by name and delegates encoding to the
     *          appropriate cipher implementation
     */
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

    /**
     * @brief Decodes ciphertext using the specified cipher
     * @param ciphertext The text to decode
     * @param key Optional cipher-specific key parameter (should match encoding key)
     * @param cipherName The name of the cipher to use
     * @return The decoded text
     * @throws Error if cipher name is missing or cipher not found
     * @details Looks up the cipher by name and delegates decoding to the
     *          appropriate cipher implementation
     */
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

    /**
     * @brief Lists all available cipher names
     * @return Array of normalized cipher names
     * @details Returns the keys from the cipher registry, useful for
     *          discovering available ciphers or validation
     */
    listCiphers(): string[] {
        return Object.keys(this.cipherMap);
    }
}

/**
 * @brief Comprehensive object containing all cipher classes and utilities
 * @details Provides access to both the Cipher management class and all
 *          individual cipher implementations for direct instantiation.
 *          Useful for scenarios requiring direct cipher access or batch
 *          operations across multiple cipher types.
 */
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
