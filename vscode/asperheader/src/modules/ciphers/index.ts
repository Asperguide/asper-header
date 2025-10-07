/**
 * @file index.ts
 * @brief Main export file for the cipher module
 * @details This module provides a comprehensive collection of cryptographic ciphers
 *          including classical, substitution, transposition, and modern encoding techniques.
 *          All ciphers implement a common interface for consistent encode/decode operations.
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

// Export base cipher infrastructure
export { BaseCipher, CipherI } from './base';

// Export all cipher implementations
export {
    ADFGVXCipher, AffineCipher, AtbashCipher, AutokeyCipher,
    BaconCipher, Base64Cipher, BaudotCipher, BeaufortCipher,
    BifidCipher, CaesarCipher, ColumnarCipher, DoubleTranspositionCipher,
    EnigmaCipher, FractionatedMorseCipher, GronsfeldCipher, KeywordCipher,
    MonoalphabeticCipher, MorseBasicCipher, NihilistCipher, PigpenCipher,
    PolybiusCipher, PortaCipher, RailFenceCipher, ROT13Cipher, RouteCipher,
    ScytaleCipher, TapCodeCipher, TrifidCipher, VICCipher, VigenereCipher,
    XORCipher
} from './flavoured';

// Export cipher management utilities
export { Cipher, ALLCiphers } from './ciphers';
