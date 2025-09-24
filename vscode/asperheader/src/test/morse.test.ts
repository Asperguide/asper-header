import * as assert from 'assert';
import { MorseTranslator } from '../modules/morseCode';

suite('MorseTranslator Tests', () => {
    test('Hello converts correctly', () => {
        const result = MorseTranslator.toMorse("HELLO");
        assert.strictEqual(result, ".... . .-.. .-.. ---");
    });

    test('Handles two words', () => {
        const result = MorseTranslator.toMorse("Hi bye");
        assert.strictEqual(result, ".... .. / -... -.-- .");
    });

    test('Handles two words and an end of line', () => {
        const result = MorseTranslator.toMorse("Hi bye\n");
        assert.strictEqual(result, ".... .. / -... -.-- . //");
    });

    test('Handles a word and punctuation', () => {
        const result = MorseTranslator.toMorse("Hi!");
        assert.strictEqual(result, ".... .. -.-.--");
    });

    test('Handles spaces, words and punctuation', () => {
        const result = MorseTranslator.toMorse("Hello world!\n");
        assert.strictEqual(result, ".... . .-.. .-.. --- / .-- --- .-. .-.. -.. //");
    });
});
