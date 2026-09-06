# AGENTS.md — AsperHeader Agent Guide

This file encodes Henry Letellier's coding and documenting style for the **Asperguide/asper-header** repository. Agents (and humans) must follow it unless the user explicitly overrides it. It was reverse-engineered from `COMMIT_CONVENTION.md`, `CONTRIBUTING.md`, `doxygen_generation/Doxyfile`, `vscode/asperheader/src/**/*.ts`, `package.json`, and the `package_extension.sh` workflow.

---

## 1. Project Overview

* **Stack:** VS Code extension (TypeScript `ES2022`, `Node16`, `strict: true`, `lib: ES2022`). No `noImplicitReturns`/`noUnusedParameters` — keep them off.
* **Purpose:** Inject/refresh structured file headers with ASCII logo, telegraph markers, timestamps, description/purpose/copyright. Features: random logo, versioned logos (`headerLogoVersions` since `1.0.21`), Morse, Darling/Watermark easter-eggs.
* **Versioning:** `vscode/asperheader/package.json:version` is the release version (`1.0.21`). When cutting a release, bump:
  * `doxygen_generation/Doxyfile:PROJECT_NUMBER` (must match `package.json:version` — this is the published project number).
  * `CHANGELOG.md` and `README.md` Release Notes (root) — `vscode/asperheader/README.md`/`CHANGELOG.md` are **copies** made by `package_extension.sh:19-23` (`cp -vf ../../README.md`, `cp -vf ../../CHANGELOG.md`). Edit root, then copy or edit both identically.
  * **Do not blindly bump every `@version`.** File header semantics in this repo:
    * `@version` = version when **this file was last materially changed** (e.g., `constants.ts` got `headerLogoVersions` in `1.0.21`, so its `@version` is `1.0.21`; a file untouched since `1.0.10` stays at `1.0.10`).
    * `@since` = version when **this file was initially created** (never changes, e.g., `1.0.0` for core modules).
  * Only update a file's `@version` if you actually changed that file in this release; leave `@since` alone. Same rule applies to the second `@version` block for exported `messages` in `messageReference.ts`.

---

## 2. Repository Layout

```
./README.md, ./CHANGELOG.md, ./LICENSE    # canonical docs (copied to vscode/ on package)
./vscode/asperheader/
  package.json, package-lock.json
  src/constants.ts                         # single source of truth for defaults
  src/extension.ts                         # activation, commands, WeakSet save guard
  src/modules/{commentGenerator,processConfiguration,messageReference,messageProvider,logger,randomLogo,lazyFileLoad,darling,watermark,morseCode,querier}
  src/modules/ciphers/{base,flavoured}
  src/test/*.test.ts                       # mocha suite/test + assert
  src/utils/jsoncLoader.ts
  assets/formatingRules/languages.{json,min.json}
  assets/asciiArt/, assets/bonus/
  doxygen_generation/{Doxyfile,html,latex}
```

* Keep `vscode/asperheader/src` as `rootDir` (see `tsconfig.json:rootDir`). Imports use relative paths; `import * as vscode from 'vscode'`.

---

## 3. Coding Conventions

### 3.1 Style & Lint

* `eslint.config.mjs` rules: `curly: warn`, `eqeqeq: warn`, `no-throw-literal: warn`, `semi: warn`, `@typescript-eslint/naming-convention: {import: [camelCase, PascalCase]}`. Match them.
* **Naming:** `PascalCase` classes/interfaces (`CommentGenerator`, `CommentStyle`, `Configuration`), `camelCase` vars/functions (`getFileInfo`, `determineCorrectComment`), `camelCase` exported constants (`defaultHeaderLogo`, `headerLogoVersions`) — do **not** use `SCREAMING_SNAKE` for constants despite centralization. Private fields have no `_` prefix (`private headerLogo: string[]`).
* **Sections:** Group constants with `// ============================================================================` banners (see `constants.ts:43-331`). Group config properties with comments like `// Header decoration and formatting settings`.
* **No magic values:** Define everything in `constants.ts` first, then expose via `processConfiguration.ts`. Never hardcode strings/numbers in modules.

### 3.2 TypeScript

* `strict: true` — provide explicit types for `Record<string,string[]>` logos, `vscode.TextDocument`, `vscode.EndOfLine`, etc.
* Prefer `async/await` for VS Code edits (`vscode.workspace.applyEdit`, `editor.edit`). Use `Promise<void>` return types documented with `@return Promise<void>`.
* Use `Record<string, string>` for `languagePrepend/Append`, `Record<string,string[]>` for `headerLogoVersions`.

### 3.3 Concurrency & Safety

* Save handler uses `WeakSet<vscode.TextDocument>` (`extension.ts:65 updatingDocuments` + `updateSaveSafe`) to prevent re-entrancy. Preserve this pattern for any document-mutating handler.
* Guard every public entry: `if (!editor) { logger.Gui.error(getMessage("noActiveEditor")); return; }`, `if (this.documentBody===undefined) return undefined`, `if (document.isClosed)`.
* Fallback chain: `CodeConfig.get(key) ?? CONST[key]` (`processConfiguration.ts:302`). Never throw on missing config; use defaults.

### 3.4 Logging & i18n — Mandatory

* **Every** function starts with `logger.debug(getMessage("inFunction", "functionName", "ClassName"))`. Follow the existing `inFunction` pattern.
* Use `logger.Gui.*` for user-visible notifications (`error`, `warning`, `info`), `logger.*` for console/panel (`info`, `debug`, `error`). Example: `logger.Gui.error(getMessage("headerLogoReferenceNotFoundGUI", id))` + `logger.error(getMessage("headerLogoReferenceNotFound", id))`.
* **Never hardcode user-facing strings.** Use `getMessage(key, ...args)` via `messageProvider`. Keys are `camelCase` (`headerWriteSuccess`, `chooseSingleLineCommentOption`). Add new keys as **functions** in `messageReference.ts:332` (`key: (param: string): string => `...${param}...``). Provide **all 15 locales** (`en`, `fr`, `it`, `es`, `de`, `ja`, `ko`, `ru`, `pt-br`, `tr`, `pl`, `cs`, `hu`, `zh-cn`, `zh-tw`). Fallback is `en`. Validate with `python3` counting `^[a-zA-Z_][a-zA-Z0-9_]*\s*[:,]` — `en` must equal others (currently 148 keys; see `messageReference.ts:412 headerLogoVersionDisabled`).

### 3.5 Configuration

* Singletons: `CodeConfig` (`processConfiguration.ts:340 instance`) and `logger`. Import them, don't instantiate new `Configuration`.
* New settings: add to `constants.ts` (default), `processConfiguration.ts` (private field + `refreshVariables()` + `get()` fallback), `package.json:contributes.configuration.properties` (with `type`, `default`, `description`), and `README.md:Extension Settings` table (mirrored in `vscode/asperheader/README.md`). Order in table must follow `package.json` order (`headerLogo` → `headerLogoVersions`/`useHeaderLogoVersion`/`headerLogoVersionReference` → `maxScanLength`).

### 3.6 Tests

* Framework: `mocha` `suite`/`test` + `assert` (see `src/test/constants.test.ts:5`). File header has Doxygen `@version 1.0.10` etc. Each test has `@brief` + `@test`. Keep `node` and `vscode` types (`@types/mocha`, `@types/node`, `@types/vscode`).
* Add tests for new constants: validate ASCII logo char set `/^[.\#\+\s]*$/` (supports `#` legacy and `+` modern), dimensional checks, and that `defaultHeaderLogo === headerLogoVersions["v2"]`.

---

## 4. Documentation Standards (Doxygen + Markdown)

### 4.1 Doxygen is First-Class

* **Every file** starts with:

  ```ts
  /**
   * @file filename.ts
   * @brief One-line summary
   * @author Henry Letellier
   * @version 1.0.21  // last changed in this version — not necessarily package.json; see §1 Versioning
   * @since 1.0.0     // creation version — never bump
   * @date 2025[-MM-DD] // keep existing date unless new file
   * @copyright (c) 2025 Asperguide - All rights reserved // for core modules
   *
   * @details Extensive architecture overview with @section/@subsection:
   *  Architecture, Configuration Domains, Design Principles, etc.
   *  Include @example code blocks.
   */
  ```

* **Every class/interface/method/constant** has `@brief` (one line), `@details`, `@param`, `@return`, `@since` (add `1.0.21` for new members), `@see`, `@example` where useful. Use Doxygen commands: `@class`, `@interface`, `@section`, `@subsection`, `@code{.typescript}`/`@endcode`.
* **Private members** still get `/** @brief ... */` one-liners (see `commentGenerator.ts:164-189`). Fix duplicated placeholder text — each field must have a distinct brief (e.g., `Default logo` vs `Versioned logo collection` vs `Flag enabling versioned logo`).
* **Doxyfile:** `PROJECT_NAME = "Asper Header"`, `PROJECT_NUMBER = 1.0.21`, `EXTRACT_ALL = YES`, `WARN_IF_UNDOCUMENTED = YES` (disabled by `EXTRACT_ALL`), `INPUT = vscode/asperheader README.md ...`, `RECURSIVE = YES`, `FILE_PATTERNS = *.ts *.tsx *.js ...`, `EXTENSION_MAPPING = ts=JavaScript`. Don't change without reason.

### 4.2 Markdown

* `README.md` structure (root and `vscode/` must stay identical after package step):
  * Logo + intro → Source repo / discussions → Developer docs (doxygen) → Features → Demo (gif+mp4) → Requirements → **Extension Settings** table → Known Issues → Supported Languages (15 locales table) → **Release Notes** per version → Community → Guidelines → More Info.
* `CHANGELOG.md` follows Keep a Changelog + SemVer. Each version has `### Added/Fixed/Changed/Updated`. `1.0.21` entry is the current head.
* When adding a package setting, update **both** tables (root + vscode) or rely on `package_extension.sh` copy — but verify with `diff -u README.md vscode/asperheader/README.md`.

---

## 5. Commit & PR Workflow

* **Commit messages:** `[VERB] description` where `VERB` is uppercase infinitive in brackets. Allowed: `ADD`, `FIX`, `UPDATE`, `REMOVE`, `EDIT`, `REFACTOR`, `RENAME`, `MERGE` (`COMMIT_CONVENTION.md:33`). Example: `[ADD] a feature to allow storing and selection of previous verisons for logos` (real history) / `[UPDATE] the documentation to reflect the features of the current version`. No `feat:`, no lowercase prefix, no gerunds.
* **Branches:** `feature/<description>` or `fix/<description>` (`CONTRIBUTING.md:52`). Keep `main` clean.
* **PR:** Title = commit-style verb, link issues, ensure `npm run check-types && npm run lint && node esbuild.mjs --production` + `npm run test` pass. The `package_extension.sh` runs `npm install`, `npm run package`, `npm run test`, then `vsce package` + `vsce ls`.

---

## 6. Packaging & Release

* Bump `vscode/asperheader/package.json:version` + `doxygen_generation/Doxyfile:PROJECT_NUMBER` (must match). Only bump a file's `@version` if that file actually changed (see §1); never touch `@since`.
* Update `CHANGELOG.md` (both copies) and `README.md` Release Notes.
* Run `vscode/asperheader/package_extension.sh` locally to verify `vsce ls` output and generated `.vsix`.
* The `vsce` manifest uses `publisher: HenryLetellier`, `engines.vscode: ^1.104.0`, `categories: [Formatters, Other]`, keywords include `header`, `multilingual`, `morse-code`.

---

## 7. Agent Do/Don't

* **Do:** Preserve `logger.debug(getMessage("inFunction"...))` at function entry; preserve `messageReference` fallback discipline; centralize constants; add exhaustive Doxygen; keep README/CHANGELOG copies in sync; run `python3` locale-key count check after touching `messageReference.ts`.
* **Don't:** Hardcode user strings, add `SCREAMING_SNAKE` constants, use `conventional commits`, change `tsconfig` strictness, remove `WeakSet` guard, edit `vscode/asperheader/README.md` without editing root, or leave `headerLogoVersions` undocumented. **Never run altering git commands** (`commit`, `amend`, `push`, `pull`, `fetch --prune`, `reset`, `rebase`, `checkout --`, `clean`, `branch -D`, `tag -d`, etc.) unless the user explicitly asks — the repository is the lifeline. Stick to read-only git (`status`, `diff`, `log --oneline`, `show`, `ls-files`, `grep`).
* **Verify:** After changes, run `npx tsc --noEmit --project vscode/asperheader/tsconfig.json` (ignore known `Buffer`/`path` errors if `@types/node` missing; focus on `messageReference.ts` having no errors) and `npm run lint`.

---

*Generated for agents. Source of truth is the code itself — when in doubt, mimic the nearest existing module's structure and verbosity.*
