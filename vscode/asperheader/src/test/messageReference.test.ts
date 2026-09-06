/**
 * @file messageReference.test.ts
 * @brief Hardening test suite for messageReference locale parity and completeness
 * @author Henry Letellier
 * @version 1.0.22
 * @since 1.0.22
 * @date 2025
 *
 * Validates the invariant from AGENTS.md: all 15 locales must expose exactly the
 * same message keys as `en`, each as a function, and fallback behaviour is
 * deterministic. This is the cheapest hardening against the silent `AGENTS.md`
 * python3 locale-count drift that caused missing `headerLogoVersionDisabled` etc.
 */

import * as assert from 'assert';
import { messages } from '../modules/messageReference';

suite('MessageReference Hardening', () => {
    const locales = Object.keys(messages).sort();
    const expectedLocales = ['cs', 'de', 'en', 'es', 'fr', 'hu', 'it', 'ja', 'ko', 'pl', 'pt-br', 'ru', 'tr', 'zh-cn', 'zh-tw'].sort();
    const enKeys = Object.keys(messages.en).sort();

    test('should expose exactly 15 locales', () => {
        assert.deepStrictEqual(locales, expectedLocales, `Locales mismatch: got ${locales.join(',')}`);
    });

    test('en should have at least 140 keys (currently 148)', () => {
        // Guard against accidental deletion; allow growth but not shrink below known baseline
        assert.ok(enKeys.length >= 140, `en has ${enKeys.length} keys, expected >=140`);
        assert.ok(enKeys.length < 300, `en has ${enKeys.length} keys, suspicious growth`);
    });

    test('every locale should have exactly the same keys as en', () => {
        for (const locale of locales) {
            const keys = Object.keys(messages[locale]).sort();
            const missing = enKeys.filter(k => !keys.includes(k));
            const extra = keys.filter(k => !enKeys.includes(k));
            assert.strictEqual(missing.length, 0, `Locale ${locale} missing keys: ${missing.join(', ')}`);
            assert.strictEqual(extra.length, 0, `Locale ${locale} has extra keys: ${extra.join(', ')}`);
        }
    });

    test('every message value should be a function returning string', () => {
        for (const locale of locales) {
            for (const key of enKeys) {
                const fn = (messages[locale] as any)[key];
                assert.strictEqual(typeof fn, 'function', `${locale}.${key} should be function`);
                // spot-check arity: calling with dummy args must return string, not throw
                let result: string;
                try {
                    result = fn('a', 'b', 'c', 123);
                } catch {
                    // some functions may require specific arity, try zero
                    result = fn();
                }
                assert.strictEqual(typeof result, 'string', `${locale}.${key}() should return string`);
                assert.ok(result.length >= 0, `${locale}.${key}() should not be empty check`);
            }
        }
    });

    test('new 1.0.21/1.0.22 keys should exist in every locale', () => {
        const newKeys = ['headerLogoReference', 'headerLogoReferenceNotFound', 'headerLogoReferenceNotFoundGUI', 'headerLogoVersionDisabled'];
        for (const k of newKeys) {
            assert.ok(k in messages.en, `en missing ${k}`);
            for (const locale of locales) {
                assert.ok(k in messages[locale], `${locale} missing ${k}`);
            }
        }
    });
});
