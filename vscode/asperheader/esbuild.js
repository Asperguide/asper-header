const logLevel = 'info'; // 'silent' | 'info' | 'warning' | 'error'


import fs from "fs";
import esbuild from "esbuild";
import { copy } from "esbuild-plugin-copy";


const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

function minifyJSON(src, dest) {
 console.log(`Minifying ${src} to ${dest}`);
  const data = JSON.parse(fs.readFileSync(src, "utf8"));
  fs.writeFileSync(dest, JSON.stringify(data));
}

minifyJSON("assets/formatingRules/languages.json", "assets/formatingRules/languages.min.json");
minifyJSON("assets/bonus/ditf.json", "assets/bonus/ditf.min.json");
minifyJSON("assets/bonus/watermark.json", "assets/bonus/watermark.min.json");


/**
 * @type {import('esbuild').Plugin}
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
			copy({
				assets: [
					{
						from: ['./assets/formatingRules/languagesReorganised.min.json'],
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
						from: ['./assets/asciiArt/**/*.min.json', "./assets/asciiArt/**/*.txt"],
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

main().catch(e => {
	console.error(e);
	process.exit(1);
});
