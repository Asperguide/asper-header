export interface CipherI {
    encode(plaintext: string, key?: string | number | any): string;
    decode(ciphertext: string, key?: string | number | any): string;
}
