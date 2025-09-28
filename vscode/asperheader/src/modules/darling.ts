import * as vscode from 'vscode';
import { logger } from "./logger";
import { getMessage } from "./messageProvider";
import { LazyFileLoader } from "./lazyFileLoad";


export interface Person {
    id: number,
    name: string,
    romaji: string,
    age: string,
    quote: string,
    description: string,
    imageContent: string[],
    height: string,
    weight: string,
    more_information: string,
    type: string,
    alias: string[] | null
}
export class Darling {

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

    async getRandomPerson(): Promise<Person> {
        const fileContent = await this.fileInstance.get();
        if (!Array.isArray(fileContent) || fileContent.length === 0) {
            const err: string = getMessage("darlingJsonFileInvalid");
            logger.Gui.error(err);
            throw new Error(err);
        }
        const chosenIndex: number = this.getRandomNumber(fileContent.length);
        const raw = fileContent[chosenIndex];
        const person: Person = {
            id: raw.id,
            name: raw.name,
            romaji: raw.romaji,
            age: raw.age,
            quote: raw.quote,
            description: raw.description,
            imageContent: raw.image_link ?? [], // rename image_link → imageContent
            height: raw.height,
            weight: raw.weight,
            more_information: raw.more_information,
            type: raw.type,
            alias: raw.alias
        };
        return person;
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
    let currentSize = 6;
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
    h1 { font-size: 72px; margin-bottom: 0.2em; }
    h2 { margin-top: 1.2em; }
    pre { font-size: 10px; line-height: 10px; white-space: pre; }
    button { margin: 10px 0; padding: 5px 12px; font-size: 14px; }
  </style>
        `;
    }

    async displayRandomPersonInWindow() {
        const randomPerson: Person = await this.getRandomPerson();

        const panel = vscode.window.createWebviewPanel(
            getMessage("darlingView"),
            randomPerson.name,
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        const asciiArt = randomPerson.imageContent.join("\n");

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
  <h1>${randomPerson.name} (${randomPerson.romaji})</h1>
  <p><b>${getMessage('darlingType')}:</b> ${randomPerson.type}</p>
  <p><b>${getMessage('darlingAge')}:</b> ${randomPerson.age}</p>
  <p><b>${getMessage('darlingHeight')}:</b> ${randomPerson.height} | <b>Weight:</b> ${randomPerson.weight}</p>
  <p><b>${getMessage('darlingAlias')}:</b> ${randomPerson.alias ? randomPerson.alias.join(", ") : "None"}</p>

  <h2>${getMessage('darlingDescription')}</h2>
  <p>${randomPerson.description}</p>

  <h2>${getMessage('darlingQuote')}</h2>
  <blockquote>${randomPerson.quote}</blockquote>

  <h2>${getMessage('darlingMoreInfo')}</h2>
  <p><a href="${randomPerson.more_information}" target="_blank">${randomPerson.more_information}</a></p>

  <h2>${getMessage('darlingImage')}</h2>
<div>
    <button id="copyBtn">${getMessage('darlingCopyAscii')}</button>
    <button id="zoomInBtn">${getMessage('darlingZoomIn')}</button>
    <button id="zoomOutBtn">${getMessage('darlingZoomOut')}</button>
</div>
  <pre id="ascii">${asciiArt}</pre>
    ${copyButton}
    ${zoomScript}
</body>
</html>
`;

        panel.webview.onDidReceiveMessage(message => {
            if (message.type === "copied") {
                logger.Gui.info(getMessage("darlingCopied", randomPerson.name));
            }
        });

        logger.Gui.info(getMessage("darlingPersonDisplayed", randomPerson.name));
    }
}
