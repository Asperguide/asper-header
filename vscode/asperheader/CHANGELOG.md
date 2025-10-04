# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
and this project adheres to [Semantic Versioning](https://semver.org/).

---

## [1.0.8] - 04/10/2025

### Added

- A text to morse and morse to text translator.

### Changed

- Update the doxygen documentation

---

## [1.0.7] - 04/10/2025

### Changed

- Update the package dependency versions
- Update the comment choices in the comment dictionnary so that they are as silent as possible

---

## [1.0.6] - 03/10/2025

### Fixed

- Debug functions that should check if debug is enabled before firering
- Debug option that was set to true by default, it is now false.

---

## [1.0.5] - 03/10/2025

### Added

- Full multilingual support for the AsperHeader module, now supporting:
  - English (UK) `en`
  - French `fr`
  - Italian `it`
  - Spanish `es`
  - German `de`
  - Japanese `ja`
  - Korean `ko`
  - Russian `ru`
  - Portuguese (Brazil) `pt-br`
  - Turkish `tr`
  - Polish `pl`
  - Czech `cs`
  - Hungarian `hu`
  - Simplified Chinese `zh-cn`
  - Traditional Chinese `zh-tw`
- Complete translations for all existing message keys, preserving parameter placeholders and functionality across languages.
- Automatic fallback to English (`en`) for missing translations to ensure consistent behavior.

### Changed

- Updated `messageReference.ts` to integrate the new language translations.

---

## [1.0.4] - 03/10/2025

### Added

- More unit tests for module stability

### Changed

- The logger so that the non-gui based can be visible in non-debug mode
- The doxygen comments to make the code clearer
- Some minor sections of the code

### Fixed

- The copy button functionality
- The import path in the file regarding the required json file as the name had changed but not been reflected in the code

---

## [1.0.3] - 02/10/2025

### Added

- Check in build process to prevent publishing duplicate VSIX versions.
- VSCode ignore rules to exclude unnecessary videos.

### Changed

- Updated extension modules logo.
- Functions updated to work with older VSCode versions.
- Extension logo and `.vscodeignore` cleaned of unused files.
- `package_extension.sh` improved for more robust local builds.
- `package.json` version updated.
- `esbuild.js` updated to throw an error when a file does not exist.

### Fixed

- Esbuild script now fails on missing files.
- Upload path/version handling for OpenVSX.
- Module query for VSCE uses `@vscode/vsce`.

---

## [1.0.2] - 01/10/2025

### Added

- More supported VSCode languages.
- Mac equivalents in keybindings.

### Fixed

- File format parsing error.

---

## [1.0.1] - 28/09/2025

### Added

- Added `.tsx` file format to comment identification logic.

---

## [1.0.0] - 28/09/2025

### Added

- Initial release of **AsperHeader**.
- Supports injecting structured headers with ASCII logos.
- Automatic last modified date updates on save.
- Configurable settings for flexible formatting.
- Optional random logo insertion.
- VSCode module to inject headers in files with a supported extension.
- Scripts to convert images to ASCII art automatically.
- Scripts to generate JSON files and directory mapping.
- Easter eggs functionality.
- Description for configurable settings in `settings.json`.
- Doxygen resources for documentation generation.
- Backgroundless version of the extension icon.
- Templates for issue section and community guidelines.

---
