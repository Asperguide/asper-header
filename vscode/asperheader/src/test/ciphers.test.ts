/**
 * @file ciphers.test.ts
 * @brief Smoke hardening for ciphers module (previously 0% coverage)
 * @author Henry Letellier
 * @version 1.0.22
 * @since 1.0.22
 * @date 2025
 *
 * The entire `src/modules/ciphers/**` (30 flavoured ciphers) had no tests.
 * This suite adds the cheapest hardening: registry smoke + round-trip for
 * deterministic ciphers. It catches missing export, broken `CipherName`,
 * or `encode`/`decode` throwing after refactor.
 */

import * as assert from 'assert';
import { Cipher, ALLCiphers } from '../modules/ciphers';

suite('Ciphers Hardening', () => {
    test('should expose at least 30 ciphers', () => {
        const c = new Cipher();
        const list = c.listCiphers();
        assert.ok(list.length >= 30, `Expected >=30 ciphers, got ${list.length}: ${list.join(', ')}`);
    });

    test('every flavoured cipher should have CipherName and encode/decode as functions', () => {
        const instances = Object.values(ALLCiphers).filter(v => typeof v === 'function' && v !== (ALLCiphers as any).Cipher);
        for (const Cls of instances as any[]) {
            const inst = new Cls();
            assert.ok(typeof inst.CipherName === 'string' && inst.CipherName.length > 0, `${Cls.name} missing CipherName`);
            assert.strictEqual(typeof inst.encode, 'function', `${Cls.name}.encode should be function`);
            assert.strictEqual(typeof inst.decode, 'function', `${Cls.name}.decode should be function`);
        }
    });

    test('Cipher registry should round-trip for keyless ciphers (Caesar, ROT13, Atbash, Base64)', () => {
        const c = new Cipher();
        const plain = 'HELLO WORLD';
        // Caesar (default shift 3) -> encode -> decode should return uppercased plain (BaseCipher sanitizes)
        for (const name of ['caesar', 'rot13', 'atbash', 'base64']) {
            const enc = c.encode(plain, undefined, name);
            assert.strictEqual(typeof enc, 'string', `${name} encode should return string`);
            assert.ok(enc.length > 0, `${name} encode should not be empty`);
            const dec = c.decode(enc, undefined, name);
            assert.strictEqual(typeof dec, 'string', `${name} decode should return string`);
            // For these ciphers, decode(encode) is either original uppercased or for base64 exact
            if (name === 'base64') {
                assert.strictEqual(dec, plain, 'Base64 round-trip should be exact');
            } else {
                // sanitized to A-Z, spaces preserved by Caesar/Atbash as-is per implementation, but we check contains HELLO
                assert.ok(dec.includes('HELLO'), `${name} round-trip should contain HELLO, got ${dec}`);
            }
        }
    });

    test('should throw on unknown cipher and on missing name', () => {
        const c = new Cipher();
        assert.throws(() => c.encode('hi', undefined, undefined as any), /Cipher name required/);
        assert.throws(() => c.encode('hi', undefined, 'nonexistent'), /not found/);
        assert.throws(() => c.decode('hi', undefined, undefined as any), /Cipher name required/);
        assert.throws(() => c.decode('hi', undefined, 'nonexistent'), /not found/);
    });

    test('listCiphers keys should be normalized lower-case without spaces', () => {
        const c = new Cipher();
        const list = c.listCiphers();
        for (const k of list) {
            assert.strictEqual(k, k.toLowerCase(), `${k} should be lower-case`);
            assert.ok(!k.includes(' '), `${k} should not contain spaces`);
        }
    });

    test('encode/decode should handle empty string without throwing (all ciphers)', () => {
        const c = new Cipher();
        const list = c.listCiphers();
        // Keys that satisfy different cipher families: alphabetic (vigenere), numeric (gronsfeld), generic
        const candidateKeys: (string | undefined)[] = [undefined, 'KEY', '123', 'TESTKEY', 'A'];
        for (const name of list) {
            let encodeOk = false;
            let lastEncodeError: any = null;
            for (const k of candidateKeys) {
                try {
                    c.encode('', k as any, name);
                    encodeOk = true;
                    break;
                } catch (e) {
                    lastEncodeError = e;
                    // Try next candidate; many ciphers throw on undefined/missing key which is expected for this smoke test
                }
            }
            assert.ok(encodeOk, `${name} encode('') should handle empty string with some valid key, last error: ${lastEncodeError}`);

            let decodeOk = false;
            let lastDecodeError: any = null;
            for (const k of candidateKeys) {
                try {
                    c.decode('', k as any, name);
                    decodeOk = true;
                    break;
                } catch (e) {
                    lastDecodeError = e;
                }
            }
            assert.ok(decodeOk, `${name} decode('') should handle empty string with some valid key, last error: ${lastDecodeError}`);
        }
    });
});
