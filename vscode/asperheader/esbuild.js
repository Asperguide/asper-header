/**
 * @file esbuild.js
 * @brief Custom build script for VSCode extension packaging.
 *
 * Handles TypeScript bundling, JSON minification, asset copying with guard
 * checks, and problem matcher integration for developer feedback.
 */

import fs from "fs";
import path from "path";
import esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";

const logLevel = 'info'; // 'silent' | 'info' | 'warning' | 'error'

/**
 * Recursively walks through a directory tree and checks if any file
 * matches the expected suffix (after glob simplification).
 *
 * @param {string} dir - Directory to traverse recursively.
 * @param {string} suffix - File suffix to match (e.g., ".txt", ".min.json").
 * @returns {boolean} True if at least one match is found, otherwise false.
 */
function walk(dir, suffix) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (walk(fullPath, suffix)) {
				return true;
			}
		} else if (fullPath.endsWith(suffix.replace("*", ""))) {
			return true;
		}
	}
	return false;
}

/**
 * Minimal glob-like existence check using Node built-ins.
 * Does not attempt to fully emulate globbing libraries.
 *
 * @param {string | string[]} from - Path or glob-like pattern(s) to check.
 * Supports:
 *   - `*.ext` → any file ending with .ext
 *   - `prefix*` → any file starting with prefix
 *   - `<recursive>/*.ext` → recursive search for .ext files
 *   - Direct file paths
 * @returns {boolean} True if at least one match is found.
 * @throws {Error} If a base directory in a pattern does not exist.
 * @note `<recursive>` is represented by `**` in the pattern.
 */
function patternExists(from) {
	const patterns = Array.isArray(from) ? from : [from];

	return patterns.some(pat => {
		// Handle recursive glob like **/*.ext
		if (pat.includes("**/")) {
			const [baseDir, suffix] = pat.split("**/");
			if (!fs.existsSync(baseDir)) {
				return false;
			}

			let found = walk(baseDir, suffix);
			return found;
		}

		// Handle simple wildcard patterns like *.json, *.txt
		if (/[?*]/.test(pat)) {
			const dir = path.dirname(pat);
			if (!fs.existsSync(dir)) {
				return false;
			}

			const basename = path.basename(pat);
			const files = fs.readdirSync(dir);

			// *.ext → check suffix
			if (basename.startsWith("*.")) {
				const ext = basename.slice(1);
				const foundFile = files.some(f => f.endsWith(ext));
				return foundFile;
			}

			// prefix* → check startsWith
			if (basename.endsWith("*")) {
				const prefix = basename.slice(0, -1);
				const foundFile = files.some(f => f.startsWith(prefix));
				return foundFile;
			}

			return false;
		}

		// Direct file path
		return fs.existsSync(pat);
	});
}

/**
 * Wrapper around esbuild-plugin-copy that ensures each "from"
 * pattern resolves to at least one file before proceeding.
 *
 * @param {Parameters<typeof copy>[0]} options - Copy plugin options.
 * @returns {import('esbuild').Plugin} Wrapped copy plugin.
 * @throws {Error} If any "from" pattern resolves to no files.
 */
function checkedCopy(options) {
	for (const asset of options.assets || []) {
		if (!patternExists(asset.from)) {
			throw new Error(
				`❌ checkedCopy: No files matched pattern: ${asset.from}`
			);
		}
	}
	return copy(options);
}

const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

/**
 * Minify JSON by reading a source file, parsing, and re-stringifying.
 *
 * @param {string} src - Path to source JSON file.
 * @param {string} dest - Destination path for minified JSON.
 */
function minifyJSON(src, dest) {
	console.log(`Minifying ${src} to ${dest}`);
	const data = JSON.parse(fs.readFileSync(src, "utf8"));
	fs.writeFileSync(dest, JSON.stringify(data));
}


// Pre-minify known assets
minifyJSON("assets/formatingRules/languages.json", "assets/formatingRules/languages.min.json");
minifyJSON("assets/bonus/ditf.json", "assets/bonus/ditf.min.json");
minifyJSON("assets/bonus/watermark.json", "assets/bonus/watermark.min.json");


/**
 * Problem matcher plugin for esbuild.
 * Helps VSCode surface build errors in Problems panel.
 */
const esbuildProblemMatcherPlugin = {
	name: 'esbuild-problem-matcher',

	setup(build) {
		build.onStart(() => {
			console.log('[watch] build started');
		});
		build.onEnd((result) => {
			if (result.errors.length > 0) {
				result.errors.forEach(({ text, location }) => {
					console.error(`✘ [ERROR] ${text}`);
					if (location) {
						console.error(`    ${location.file}:${location.line}:${location.column}`);
					}
				});
			}
			console.log('[watch] build finished');
		});
	},
};

/**
 * Main build entry point.
 * - Bundles extension
 * - Copies assets with validation
 * - Runs in watch or production mode
 */
async function main() {
	const ctx = await esbuild.context({
		entryPoints: [
			'src/extension.ts'
		],
		bundle: true,
		format: 'cjs',
		minify: production,
		sourcemap: !production,
		sourcesContent: false,
		platform: 'node',
		outfile: 'dist/extension.js',
		external: ['vscode'],
		logLevel: logLevel,
		plugins: [
			/* add to the end of plugins array */
			esbuildProblemMatcherPlugin,
			checkedCopy({
				assets: [
					{
						from: ['./assets/formatingRules/languages.min.json'],
						to: ['./assets/formatingRules/']
					},
					{
						from: ['./assets/icon/icon_v2_cleaned.png'],
						to: ['./assets/icon/'],
					},
					{
						from: ['./README.md', './CHANGELOG.md'],
						to: ['./'],
					},
					{
						from: ["./assets/asciiArt/**/*.txt"],
						to: ['./assets/asciiArt/'],
					},
					{
						from: ['./assets/bonus/*.min.json'],
						to: ['./assets/bonus/'],
					}
				],
				verbose: true,
			}),
		],
	});
	if (watch) {
		await ctx.watch();
	} else {
		await ctx.rebuild();
		await ctx.dispose();
	}
}

// Entrypoint
main().catch(e => {
	console.error(e);
	process.exit(1);
});
