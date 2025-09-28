import * as fs from 'fs/promises';
import * as path from 'path';
import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";

export interface logo {
    logoContent: string[],
    fileName: string
}
export class randomLogo {
    private cwd: string | undefined = undefined;
    private rootDir: string | undefined = undefined;
    private liveLogoFiles: LazyFileLoader[] = [];

    constructor(rootDir: string | undefined = undefined, cwd: string | undefined = undefined) {
        if (rootDir) {
            this.rootDir = rootDir;
            this.gatherAllLogoFiles(this.rootDir);
        }
        if (cwd) {
            this.cwd = cwd;
        }
    }

    async updateRootDir(basePath: string): Promise<boolean> {
        this.rootDir = basePath;
        try {
            this.gatherAllLogoFiles(this.rootDir);
            return true;
        } catch (e) {
            logger.error(getMessage("logoRootDirUpdateError", String(e)));
            return false;
        }
    }

    updateCurrentWorkingDirectory(cwd: string): boolean {
        this.cwd = cwd;
        return true;
    }

    private getRandomNumber(maxValue: number): number {
        return Math.floor(Math.random() * maxValue);
    }

    /** Recursively gather all files under the given folder */
    private async gatherAllLogoFiles(rootDir: string | undefined = undefined): Promise<void> {
        if (!rootDir && !this.rootDir) {
            throw Error(getMessage("logoNoRootDir"));
        }
        if (!rootDir && this.rootDir) {
            rootDir = this.rootDir;
        }
        if (rootDir) {
            const dirents = await fs.readdir(rootDir, { withFileTypes: true });

            for (const dirent of dirents) {
                const resolvedPath = path.resolve(rootDir, dirent.name);
                if (dirent.isDirectory()) {
                    await this.gatherAllLogoFiles(resolvedPath);
                } else if (resolvedPath.endsWith(".txt")) {
                    this.liveLogoFiles.push(new LazyFileLoader(resolvedPath, this.cwd));
                } else {
                    logger.info(getMessage("logoMessage", resolvedPath));
                }
            }
        }
    }
    private copyButtonScript(): string {
        return `
<script>
    if (!vscode) {
        const vscode = acquireVsCodeApi();
        console.log(\`vscode = \${vscode}\`);
    }
    document.getElementById('copyBtn').addEventListener('click', () => {
        const content = document.getElementById('ascii').innerText;
        navigator.clipboard.writeText(content).then(() => {
        vscode.postMessage({ type: 'copied' });
        });
    });
</script>
  `;
    }

    private zoomScript(): string {
        return `
<script>
    let currentSize = 20;
    function updateFontSize(sizeDifference) {
        console.log(\`sizeDifference = \${sizeDifference}\`);
        const asciiPre = document.getElementById('ascii');
        console.log(\`asciiPre = \${JSON.stringify(asciiPre)}\`);
        console.log(\`currentSize = \${currentSize}\`);
        if (currentSize + sizeDifference >= 2) {
            currentSize += sizeDifference;
            console.log(\`currentSize (after update) = \${currentSize}\`);
        } else {
            console.log(\`currentSize (no update) = \${currentSize}\`);
        }
        asciiPre.style.fontSize = currentSize + "px";
        asciiPre.style.lineHeight = currentSize + "px";
        console.log(\`newSize = \${asciiPre.style.fontSize}\`);
    }

    document.getElementById('zoomInBtn').addEventListener('click', () => {
        updateFontSize((2));
    });

    document.getElementById('zoomOutBtn').addEventListener('click', () => {
        updateFontSize((-2));
    });

    // init
    updateFontSize();
</script>
    `;
    }

    private pageStyle(): string {
        return `
        <style>
    body { font-family: sans-serif; padding: 20px; }
    h1 { font-size: 20px; margin-bottom: 0.2em; }
    h2 { margin-top: 1.2em; }
    pre { font-size: 10px; line-height: 10px; white-space: pre; }
    button { margin: 10px 0; padding: 5px 12px; font-size: 14px; }
  </style>
        `;
    }

    /** Pick a random logo file from the live folder list and read its content */
    async getRandomLogoFromFolder(): Promise<logo> {
        if (this.liveLogoFiles.length === 0) {
            await this.gatherAllLogoFiles();
        }

        if (this.liveLogoFiles.length === 0) {
            const errMsg = getMessage("watermarkJsonFileInvalid");
            logger.Gui.error(errMsg);
            throw new Error(errMsg);
        }

        const chosenIndex = this.getRandomNumber(this.liveLogoFiles.length);
        const chosenFile = this.liveLogoFiles[chosenIndex];
        const content = await chosenFile.get();

        // Assuming logos are stored as array of lines, otherwise fallback to single string
        const lines = content.split(/\r?\n/);

        return {
            fileName: path.basename(chosenFile.getFilePath() || ""),
            logoContent: lines
        };
    }


    async displayRandomLogoInWindow() {
        const randomLogo: logo = await this.getRandomLogoFromFolder();

        const panel = vscode.window.createWebviewPanel(
            getMessage("logoView"),
            randomLogo.fileName,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const watermark = randomLogo.logoContent;
        logger.info(getMessage("logoChosen", watermark));
        let asciiArt = "";
        if (typeof watermark === "string") {
            asciiArt = watermark;
        } else if (Array.isArray(watermark)) {
            asciiArt = watermark.join("\n");
        } else if (watermark === undefined) {
            asciiArt = getMessage("logoNotFound");
        }

        const copyButton: string = this.copyButtonScript();
        const pageStyle: string = this.pageStyle();
        const zoomScript: string = this.zoomScript();

        panel.webview.html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  ${pageStyle}
</head>
<body>
    <div>
        <button id="copyBtn">${getMessage('logoCopyAscii')}</button>
        <button id="zoomInBtn">${getMessage('logoZoomIn')}</button>
        <button id="zoomOutBtn">${getMessage('logoZoomOut')}</button>
    </div>
    <h1>${getMessage('logoName')}: ${randomLogo.fileName}</h1>
    <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("logoCopied", randomLogo.fileName));
            }
        });

        logger.Gui.info(getMessage("logoDisplayed", randomLogo.fileName));
    }
}
