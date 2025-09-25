import * as vscode from 'vscode';

/**
 * Record of all messages in all supported languages.
 * Each language maps message keys to functions that generate the message string.
 */
const messages: Record<string, Record<string, (...args: any[]) => string>> = {
    en: {
        inputboxError: (promptText: string, err: string): string => `Error in inputBox for ${promptText}: ${err}`,
        quickPickError: (err: string): string => `Error in quickPick: ${err}`,
        quickPickYes: (): string => "Yes",
        quickPickNo: (): string => "No",
        noCommentToShow: (): string => "There is no comment to show.",
        unknown: (): string => "Unknown",
        headerOpenerFound: (): string => "Header opener found.",
        headerOpenerAndCloserFound: (): string => "Header opener and closer found, proceeding to date update after sanity check.",
        headerWriteFailed: (): string => "Failed to write the header to the file, check the logs.",
        headerWriteSuccess: (): string => "Header written successfully.",
        morseConverted: (input: string, final: string): string => `Converted: ${input} to ${final}`,
        morseDecoded: (input: string, final: string): string => `Converted: ${input} to ${final}`,
        fileLoaded: (absolutePath: string): string => `File ${absolutePath} loaded!`,
        fileParseError: (filePath: string, error: string): string => `The file content (${filePath}) could not be loaded successfully. Error: ${error}.`,
        fileRefreshed: (): string => "Refreshing file content.",
        filePathUpdated: (oldFilePath: string, newFilePath: string): string => `The path has been updated from ${oldFilePath} to ${newFilePath}.`,
        fileUnloaded: (filePath: string): string => `File ${filePath} unloaded from memory`,
        cwdUpdated: (oldCwd: string, newCwd: string): string => `The current working directory referential has been updated from ${oldCwd} to ${newCwd}.`,
        cwdDoesNotExist: (cwd: string): string => `The provided current working directory ${cwd} does not exist.`,
        updatingEditionDate: (): string => "Updating the edition date.",
        documentLineScanExceeded: (maxScanLength: number): string => `Scanned the first ${maxScanLength} line(s) of the file but no header was found.`,
        closedDocument: (): string => "The document is closed, stopping operations.",
        emptyDocument: (): string => "There is no document body to work with.",
        brokenHeader: (): string => "Broken header detected, injecting new one, please remove the previous one.",
        extensionActivated: (moduleName: string): string => `Congratulations, your extension "${moduleName}" is now active!`,
        helloWorldGreetingsCommand: (moduleName: string): string => `Hello World from ${moduleName}!`,
        noActiveEditor: (): string => "No active file!",
        noFocusedEditors: (): string => "There are no files in focus.",
        openFileToApplyHeader: (): string => "Please open a file on which to apply the header.",
        corruptedFileMetaData: (): string => "The required file meta data appears to not have been gathered correctly, aborting.",
        messageWritten: (): string => "Message written",
        sayHelloWorldResponse: (fileExtension: string, fileName: string, filePath: string, languageId: string): string => `Hello world! This file's extension is: ${fileExtension}, it's name is: ${fileName}, it's path is: ${filePath}, determined language: ${languageId}\n`,
        missingFileError: (): string => "The language dictionary is missing, comment adaptability is thus disabled.",
        unknownFileStructure: (): string => "The language dictionary structure is unknown, comment adaptability is thus disabled.",
        arrayNodeContent: (arrayName: string, arrayIndex: number, arrayNode: any[]): string => `${arrayName}[${arrayIndex}] = ${JSON.stringify(arrayNode)}.`,
        identifiedLanguage: (langName: string): string => `Identified language: ${langName}.`,
        errorDuringFunctionCall: (functionName: string): string => `Something went wrong during the function (${functionName}) call, check logs for more info.`,
        missingLanguageComment: (): string => "Language comment not provided, skipping assignement.",
        getHeaderDescription: (): string => "Please provide a description: ",
        getHeaderTags: (): string => "Please enter the tags for this file, separated by commas:",
        getHeaderPurpose: (): string => "Please provide the purpose of the file:",
        noProvidedCommentOptions: (): string => "There are no options that were provided.",
        chooseSingleLineCommentOption: (): string => "Please select your preferred comment prefix from the options below:",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Update aborted because the file is closed and will thus not be synced.",
        jsonContent: (jsonContentString: String) => `The content of the comment json file: ${jsonContentString}`,
        messageNotFound: (key: string): string => `Message '${key}' not found.`
    },
    fr: {
        inputboxError: (promptText: string, err: string): string => `Erreur dans la boîte de saisie pour ${promptText}: ${err}`,
        quickPickError: (err: string): string => `Erreur dans la sélection rapide: ${err}`,
        quickPickYes: (): string => "Oui",
        quickPickNo: (): string => "Non",
        noCommentToShow: (): string => "Il n'y a aucun commentaire à afficher.",
        unknown: (): string => "Inconnu",
        headerOpenerFound: (): string => "Header opener found.",
        headerOpenerAndCloserFound: (): string => "Header opener and closer found, proceeding to date update after sanity check.",
        headerWriteFailed: (): string => "Échec de l'écriture de l'en-tête dans le fichier, vérifiez les journaux.",
        headerWriteSuccess: (): string => "En-tête écrit avec succès.",
        morseConverted: (input: string, final: string): string => `Converti: ${input} en ${final}`,
        morseDecoded: (input: string, final: string): string => `Converti: ${input} en ${final}`,
        fileLoaded: (absolutePath: string): string => `Fichier ${absolutePath} chargé!`,
        fileRefreshed: (): string => "Actualisation du contenu du fichier.",
        fileUnloaded: (filePath: string): string => `Fichier ${filePath} retiré de la mémoire`,
        updatingEditionDate: (): string => "Mise à jour de la date d'édition.",
        documentLineScanExceeded: (maxScanLength: number): string => `Scanned the first ${maxScanLength} line(s) of the file but no header was found.`,
        closedDocument: (): string => "Le document est fermé, arrêt des opérations.",
        emptyDocument: (): string => "Aucun contenu de document disponible.",
        brokenHeader: (): string => "Broken header detected, injecting new one, please remove the previous one.",
        extensionActivated: (moduleName: string): string => `Félicitations, votre extension "${moduleName}" est maintenant active!`,
        helloWorldGreetingsCommand: (moduleName: string): string => `Bonjour le monde depuis ${moduleName}!`,
        noActiveEditor: (): string => "Aucun fichier actif!",
        noFocusedEditors: (): string => "Aucun fichier en focus.",
        openFileToApplyHeader: (): string => "Veuillez ouvrir un fichier sur lequel appliquer l'en-tête.",
        corruptedFileMetaData: (): string => "Les métadonnées requises du fichier semblent incorrectes, abandon.",
        messageWritten: (): string => "Message écrit",
        sayHelloWorldResponse: (fileExtension: string, fileName: string, filePath: string, languageId: string): string => `Bonjour le monde! L'extension de ce fichier est: ${fileExtension}, son nom est: ${fileName}, son chemin est: ${filePath}, langue déterminée: ${languageId}\n`,
        missingFileError: (): string => "Le dictionnaire de langue est manquant, l'adaptabilité des commentaires est donc désactivée.",
        errorDuringFunctionCall: (functionName: string): string => `Une erreur est survenue lors de l'appel de la fonction (${functionName}), consultez les journaux pour plus d'informations.`,
        missingLanguageComment: (): string => "Commentaire de langue non fourni, affectation ignorée.",
        getHeaderDescription: (): string => "Please provide a description: ",
        getHeaderTags: (): string => "Please enter the tags for this file, separated by commas: ",
        getHeaderPurpose: (): string => "Please provide the purpose of the file: ",
        noProvidedCommentOptions: (): string => "There are no options that were provided.",
        chooseSingleLineCommentOption: (): string => "Please select your preferred comment prefix from the options below: ",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Update aborted because the file is closed and will thus not be synced.",
        messageNotFound: (key: string): string => `Message '${key}' introuvable.`
    },

    it: {
        inputboxError: (promptText: string, err: string): string => `Errore nella casella di input per ${promptText}: ${err}`,
        quickPickError: (err: string): string => `Errore nella selezione rapida: ${err}`,
        quickPickYes: (): string => "Sì",
        quickPickNo: (): string => "No",
        noCommentToShow: (): string => "Non ci sono commenti da mostrare.",
        unknown: (): string => "Sconosciuto",
        headerOpenerFound: (): string => "Header opener found.",
        headerOpenerAndCloserFound: (): string => "Header opener and closer found, proceeding to date update after sanity check.",
        headerWriteFailed: (): string => "Impossibile scrivere l'intestazione nel file, controllare i log.",
        headerWriteSuccess: (): string => "Intestazione scritta con successo.",
        morseConverted: (input: string, final: string): string => `Convertito: ${input} in ${final}`,
        morseDecoded: (input: string, final: string): string => `Convertito: ${input} in ${final}`,
        fileLoaded: (absolutePath: string): string => `File ${absolutePath} caricato!`,
        fileRefreshed: (): string => "Aggiornamento del contenuto del file.",
        fileUnloaded: (filePath: string): string => `File ${filePath} rimosso dalla memoria`,
        updatingEditionDate: (): string => "Aggiornamento della data di edizione.",
        documentLineScanExceeded: (maxScanLength: number): string => `Scanned the first ${maxScanLength} line(s) of the file but no header was found.`,
        closedDocument: (): string => "Il documento è chiuso, operazioni interrotte.",
        emptyDocument: (): string => "Nessun contenuto del documento disponibile.",
        brokenHeader: (): string => "Broken header detected, injecting new one, please remove the previous one.",
        extensionActivated: (moduleName: string): string => `Congratulazioni, la tua estensione "${moduleName}" è ora attiva!`,
        helloWorldGreetingsCommand: (moduleName: string): string => `Ciao mondo da ${moduleName}!`,
        noActiveEditor: (): string => "Nessun file attivo!",
        noFocusedEditors: (): string => "Nessun file in focus.",
        openFileToApplyHeader: (): string => "Aprire un file su cui applicare l'intestazione.",
        corruptedFileMetaData: (): string => "I metadati richiesti del file sembrano non essere stati raccolti correttamente, operazione annullata.",
        messageWritten: (): string => "Messaggio scritto",
        sayHelloWorldResponse: (fileExtension: string, fileName: string, filePath: string, languageId: string): string => `Ciao mondo! L'estensione di questo file è: ${fileExtension}, il nome è: ${fileName}, il percorso è: ${filePath}, lingua determinata: ${languageId}\n`,
        missingFileError: (): string => "Il dizionario della lingua è mancante, l'adattabilità dei commenti è disabilitata.",
        errorDuringFunctionCall: (functionName: string): string => `Si è verificato un errore durante la chiamata della funzione (${functionName}), controllare i log per ulteriori informazioni.`,
        missingLanguageComment: (): string => "Commento della lingua non fornito, assegnazione ignorata.",
        getHeaderDescription: (): string => "Please provide a description: ",
        getHeaderTags: (): string => "Please enter the tags for this file, separated by commas: ",
        getHeaderPurpose: (): string => "Please provide the purpose of the file: ",
        noProvidedCommentOptions: (): string => "There are no options that were provided.",
        chooseSingleLineCommentOption: (): string => "Please select your preferred comment prefix from the options below: ",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Update aborted because the file is closed and will thus not be synced.",
        messageNotFound: (key: string): string => `Messaggio '${key}' non trovato.`
    }
};

/**
 * MessageProvider is responsible for fetching localized messages.
 * It uses the editor's language as default and falls back to English or the first available language.
 */
class MessageProvider {
    /** Current editor language */
    private locale: string = vscode.env.language;

    /** Key for the message returned when a requested message is missing */
    private messageNotFound: string = "messageNotFound";

    /** Storage for all language messages */
    private messages: Record<string, Record<string, (...args: any[]) => string>> = messages;

    /**
     * Returns the first available language node from the messages object.
     * Used as a final fallback if English is not available.
     */
    private getFirstAvailableLanguageNode(): Record<string, (...args: any[]) => string> {
        const langs = Object.keys(this.messages);
        if (langs.length === 0) {
            throw new Error("No messages available.");
        }
        return this.messages[langs[0]];
    }

    /**
     * Returns the correct message from a given language node.
     * If the message key is missing, returns the messageNotFound message.
     * 
     * @param node The language-specific message record
     * @param messageKey The key of the desired message
     * @param args Any arguments to pass to the message function
     */
    private returnCorrectMessage(
        node: Record<string, (...args: any[]) => string>,
        messageKey: string,
        ...args: any[]
    ): string {
        if (node[messageKey] === undefined) {
            return node[this.messageNotFound](messageKey, ...args);
        }
        return node[messageKey](...args);
    }

    // --- Overloads ---
    public get(messageKey: string, ...args: any[]): string;
    public get(messageKey: string, options: { language: string }, ...args: any[]): string;

    /**
     * Get a localized message.
     * 
     * @param messageKey The key identifying the message
     * @param options Optional settings, including `language` to override the default locale
     * @param args Additional arguments to pass to the message function
     * @returns The localized message string
     */
    public get(messageKey: string, optionsOrArg?: { language: string } | any, ...args: any[]): string {
        let lang: string;
        let finalArgs: any[];

        if (optionsOrArg && typeof optionsOrArg === 'object' && 'language' in optionsOrArg) {
            lang = optionsOrArg.language;
            finalArgs = args;
        } else {
            lang = this.locale;
            finalArgs = args;
            if (optionsOrArg !== undefined) {
                finalArgs = [optionsOrArg, ...args];
            }
        }

        const node = this.messages[lang] || this.messages['en'] || this.getFirstAvailableLanguageNode();
        return this.returnCorrectMessage(node, messageKey, ...finalArgs);
    }
}

/** Singleton instance of the MessageProvider */
const instance = new MessageProvider();

/** Bound function for direct usage of the singleton instance */
export const getMessage = instance.get.bind(instance);
