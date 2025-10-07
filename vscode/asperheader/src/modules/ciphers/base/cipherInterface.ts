/**
 * @file cipherInterface.ts
 * @brief Interface definition for all cipher implementations
 * @author AsperGuide
 * @version 1.0.0
 * @date 2025
 */

/**
 * @interface CipherI
 * @brief Common interface that all cipher implementations must follow
 * @details This interface ensures consistent encode/decode method signatures
 *          across all cipher types, enabling polymorphic usage and 
 *          interchangeability of cipher implementations.
 */
export interface CipherI {
    /**
     * @brief Encodes plaintext using the cipher algorithm
     * @param plaintext The input text to be encrypted
     * @param key Optional encryption key (type varies by cipher)
     * @return The encoded/encrypted text
     * @throws Error if invalid parameters are provided
     */
    encode(plaintext: string, key?: string | number | any): string;

    /**
     * @brief Decodes ciphertext using the cipher algorithm
     * @param ciphertext The encrypted text to be decrypted
     * @param key Optional decryption key (should match encoding key)
     * @return The decoded/decrypted plaintext
     * @throws Error if invalid parameters or corrupted ciphertext
     */
    decode(ciphertext: string, key?: string | number | any): string;
}
