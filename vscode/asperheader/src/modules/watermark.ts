import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";

export interface watermark {
    watermark: string[],
    fontName: string
}
export class Watermark {

    private fileInstance: LazyFileLoader = new LazyFileLoader();

    constructor(filePath: string | undefined = undefined, cwd: string | undefined = undefined) {
        if (filePath) {
            this.fileInstance.updateFilePath(filePath);
        }
        if (cwd) {
            this.fileInstance.updateCurrentWorkingDirectory(cwd);
        }
    }

    async updateFilePath(filePath: string): Promise<boolean> {
        return await this.fileInstance.updateFilePath(filePath);
    }

    async updateCurrentWorkingDirectory(cwd: string): Promise<boolean> {
        return await this.fileInstance.updateCurrentWorkingDirectory(cwd);
    }

    private getRandomNumber(maxValue: number): number {
        return Math.floor(Math.random() * maxValue);
    }

    async getRandomWatermark(): Promise<watermark> {
        const fileContent = await this.fileInstance.get();
        if (!Array.isArray(fileContent) || fileContent.length === 0) {
            const err: string = getMessage("watermarkJsonFileInvalid");
            logger.Gui.error(err);
            throw new Error(err);
        }
        const chosenIndex: number = this.getRandomNumber(fileContent.length);
        const raw = fileContent[chosenIndex];
        const watermark: watermark = {
            watermark: raw.Logo,
            fontName: raw.fontName
        };
        return watermark;
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

    async displayRandomAuthorWatermarkInWindow() {
        const randomwatermark: watermark = await this.getRandomWatermark();

        const panel = vscode.window.createWebviewPanel(
            getMessage("watermarkView"),
            randomwatermark.fontName,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const watermark = randomwatermark.watermark;
        logger.info(getMessage("watermarkChosen", watermark));
        let asciiArt = "";
        if (typeof watermark === "string") {
            asciiArt = watermark;
        } else if (Array.isArray(watermark)) {
            asciiArt = watermark.join("\n");
        } else if (watermark === undefined) {
            asciiArt = getMessage("watermarkNotFound");
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
        <button id="copyBtn">${getMessage('watermarkCopyAscii')}</button>
        <button id="zoomInBtn">${getMessage('watermarkZoomIn')}</button>
        <button id="zoomOutBtn">${getMessage('watermarkZoomOut')}</button>
    </div>
    <h1>${getMessage('watermarkName')}: ${randomwatermark.fontName}</h1>
    <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("watermarkCopied", randomwatermark.fontName));
            }
        });

        logger.Gui.info(getMessage("watermarkPersonDisplayed", randomwatermark.fontName));
    }
}
