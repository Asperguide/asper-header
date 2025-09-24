import * as vscode from 'vscode';

function updateLastModified(editor: vscode.TextEditor) {
    const document = editor.document;
    const text = document.getText();
    const lines = text.split(/\r?\n/);

    const headerStart = lines.findIndex(l => l.includes('+=== BEGIN Asperguide'));
    const headerEnd = lines.findIndex(l => l.includes('+=== END Asperguide'));

    if (headerStart === -1 || headerEnd === -1) return; // no header

    const lastModifiedIndex = lines.findIndex(
        (l, i) => i > headerStart && i < headerEnd && l.startsWith('LAST MODIFIED:')
    );

    const now = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    if (lastModifiedIndex !== -1) {
        // Replace existing last-modified
        if (lines[lastModifiedIndex] !== `LAST MODIFIED: ${now}`) {
            lines[lastModifiedIndex] = `LAST MODIFIED: ${now}`;
        } else {
            return; // already up to date
        }
    } else {
        // Insert before the end line
        lines.splice(headerEnd, 0, `LAST MODIFIED: ${now}`);
    }

    const updatedText = lines.join('\n');

    editor.edit(editBuilder => {
        const start = new vscode.Position(0, 0);
        const end = new vscode.Position(lines.length, 0);
        editBuilder.replace(new vscode.Range(start, end), updatedText);
    });
}

// Hook into onDidSaveTextDocument
vscode.workspace.onDidSaveTextDocument(doc => {
    const editor = vscode.window.activeTextEditor;
    if (editor && editor.document === doc) {
        updateLastModified(editor);
    }
});
