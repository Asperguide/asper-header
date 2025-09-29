# AsperHeader

![AsperHeader Logo](./images/icon/favicon.png)

**AsperHeader** is a Visual Studio Code extension built primarily for the **Asperguide development team**.
It provides an easy and standardized way to generate, insert, and maintain structured file headers across projects.

Although tailored for Asperguide, it is available on the VS Code Marketplace for anyone who may find it useful.

---

## Features

- Insert structured headers into your source files with a single command.
- Embed an **ASCII logo** at the top of the header.
- Automatically include:
  - Project name
  - File name
  - Creation date
  - Last modified date (auto-updates on save)
  - Description block (supports multiline)
  - Copyright
  - Tags / keywords (optional)
  - Purpose section
  - Watermark
- Configurable formatting:
  - Customize comment styles and separators.
  - Adjust scan length for detecting headers.
  - Random ASCII logo option.
- Commands available via Command Palette or keyboard shortcuts:
  - `AsperHeader: Add a header to the file` (`Ctrl+Alt+H`), for Mac: (`Cmd+Alt+H`)
  - `AsperHeader: Refresh the header` (`Ctrl+Alt+U`), for Mac: (`Cmd+Alt+U`)
  - `AsperHeader: Display a random logo (in a new window)` (`Ctrl+Alt+Shift+L`), for Mac: (`Cmd+Alt+Shift+L`)
  - `AsperHeader: easter egg` (`Ctrl+Alt+Shift+D`), for Mac: (`Cmd+Alt+Shift+D`)
  - `AsperHeader: diplay the author's name` (`Ctrl+Alt+Shift+A`), for Mac: (`Cmd+Alt+Shift+A`)

### Demo

![Header insertion demo](images/header-demo.gif)

*Above: Injecting a structured header into a file.*

![Zooming in ASCII logo](images/logo-zoom.gif)

*Above: Displaying and zooming an ASCII art logo.*

---

## Requirements

None. The extension works out of the box with Visual Studio Code.

---

## Extension Settings

AsperHeader contributes the following settings:

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `asperheader.extensionName` | string | `"AsperHeader"` | Name of the extension being used. |
| `asperheader.projectCopyright` | string | `"(c) Asperguide"` | Copyright message for the header. |
| `asperheader.headerOpenerDecorationOpen` | string | `"+==== "` | Opening text for the header frame. |
| `asperheader.headerOpenerDecorationClose` | string | `" =================+"` | Closing text for the header frame. |
| `asperheader.headerCommentSpacing` | string | `" "` | Spacing between the comment symbol and the header text. |
| `asperheader.telegraphBegin` | string | `"BEGIN"` | Text used for header begin marker. |
| `asperheader.telegraphEnd` | string | `"END"` | Text used for header end marker. |
| `asperheader.telegraphBlockStop` | string | `"/STOP"` | Marks the end of a header block section. |
| `asperheader.telegraphEndOfTransmission` | string | `"// AR"` | End-of-transmission marker. |
| `asperheader.headerAddBlankLineAfterMultiline` | boolean | `false` | Insert a blank line after multiline blocks. |
| `asperheader.headerKeyDefinitionSeparator` | string | `": "` | Separator between key and value in header. |
| `asperheader.headerLogoKey` | string | `"LOGO"` | Header key for ASCII logo. |
| `asperheader.headerProjectKey` | string | `"PROJECT"` | Header key for project name. |
| `asperheader.headerFileKey` | string | `"FILE"` | Header key for file name. |
| `asperheader.headerCreationDateKey` | string | `"CREATION DATE"` | Header key for creation date. |
| `asperheader.headerLastModifiedKey` | string | `"LAST Modified"` | Header key for last modified date. |
| `asperheader.headerDescriptionKey` | string | `"DESCRIPTION"` | Header key for file description. |
| `asperheader.headerCopyrightKey` | string | `"COPYRIGHT"` | Header key for copyright. |
| `asperheader.headerTagKey` | string | `"TAG"` | Header key for tags. |
| `asperheader.headerPurposeKey` | string | `"PURPOSE"` | Header key for purpose section. |
| `asperheader.headerTimeSeperatorHour` | string | `":"` | Separator for hours in timestamps. |
| `asperheader.headerTimeSeperatorMinute` | string | `":"` | Separator for minutes in timestamps. |
| `asperheader.headerTimeSeperatorSecond` | string | `""` | Separator for seconds in timestamps. |
| `asperheader.headerTimeAndDateSeperator` | string | `" "` | Separator between time and date. |
| `asperheader.headerDateSeperatorDay` | string | `"-"` | Separator for day in dates. |
| `asperheader.headerDateSeperatorMonth` | string | `"-"` | Separator for month in dates. |
| `asperheader.headerDateSeperatorYear` | string | `""` | Separator for year in dates. |
| `asperheader.headerLogo` | string[] | *[ASCII logo default]* | Default ASCII logo array. |
| `asperheader.maxScanLength` | number | `100` | Maximum lines scanned for existing headers. |
| `asperheader.enableDebug` | boolean | `true` | Enable debug logging. |
| `asperheader.refreshOnSave` | boolean | `true` | Automatically refresh header on file save. |
| `asperheader.promptToCreateIfMissing` | boolean | `true` | Prompt to create header if missing. |
| `asperheader.randomLogo` | boolean | `false` | Insert a random ASCII logo on each header generation. |
| `asperheader.extensionIgnore` | string[] | `[]` | File extensions to ignore when saving. |
| `asperheader.useWorkspaceNameWhenAvailable` | boolean | `false` | Use the workspace name when available. |

---

## Known Issues

None so far.

---

## Release Notes

### 1.0.0

- Initial release of **AsperHeader**.
- Supports injecting structured headers with ASCII logos.
- Automatic last modified date updates on save.
- Configurable settings for flexible formatting.
- Optional random logo insertion.

### 1.0.1

- Add the missing `.tsx` file format to the comment identification logic

### 1.0.2

- Fix file format parsing error
- Add more supported vscode languages
- Add the mac equivalent in keybindings

---

## Following Extension Guidelines

This extension follows [VS Code Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines).

---

## For More Information

- [VS Code Extension Marketplace](https://marketplace.visualstudio.com/)
- [VS Code Docs](https://code.visualstudio.com/docs)

---

**Enjoy using AsperHeader!**
