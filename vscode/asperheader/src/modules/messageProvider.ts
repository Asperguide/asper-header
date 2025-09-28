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
        watermarkView: (): string => "watermarkView",
        watermarkJsonFileInvalid: (): string => "Watermark JSON file is empty or invalid",
        watermarkName: (): string => "Watermark name",
        watermarkCopyAscii: (): string => "Copy ASCII",
        watermarkZoomIn: (): string => "Zoom In",
        watermarkZoomOut: (): string => "Zoom Out",
        watermarkPersonDisplayed: (name: string): string => `Watermark '${name}' displayed.`,
        watermarkChosen: (watermark: string[]): string => `Watermark to display: ${JSON.stringify(watermark)}`,
        watermarkNotFound: (): string => "Watermark not found",
        watermarkCopied: (name: string): string => `ASCII art copied for ${name}!`,
        darlingView: (): string => "darlingView",
        darlingJsonFileInvalid: (): string => "Darling JSON file is empty or invalid",
        darlingPersonDisplayed: (name: string): string => `Character '${name}' displayed.`,
        darlingCopyAscii: (): string => "Copy ASCII",
        darlingZoomIn: (): string => "Zoom In",
        darlingZoomOut: (): string => "Zoom Out",
        darlingType: (): string => "Type",
        darlingAge: (): string => "Age",
        darlingHeight: (): string => "Height",
        darlingAlias: (): string => "Alias",
        darlingDescription: (): string => "Description",
        darlingQuote: (): string => "Quote",
        darlingMoreInfo: (): string => "More info",
        darlingImage: (): string => "Image",
        darlingCopied: (name: string): string => `ASCII art copied for ${name}!`,
        logoView: (): string => "logoView",
        logoName: (): string => "Logo name",
        logoMessage: (logoPath: string): string => `File (${logoPath}) ignored because it is not the type we are looking for.`,
        logoNoRootDir: (): string => "No root directory was provided for gathering the logos",
        logoRootDirUpdateError: (error: string): string => `An error occurred during the update of the logo files, error: ${error}`,
        logoDisplayed: (name: string): string => `Logo '${name}' displayed.`,
        logoCopied: (logoName: string): string => `ASCII art copied for ${logoName}!`,
        logoChosen: (logo: string[]): string => `Logo to display: ${JSON.stringify(logo)}`,
        logoNotFound: (): string => "Logo not found",
        logoCopyAscii: (): string => "Copy ASCII",
        logoZoomIn: (): string => "Zoom In",
        logoZoomOut: (): string => "Zoom Out",
        noCommentToShow: (): string => "There is no comment to show.",
        unknown: (): string => "Unknown",
        headerOpenerFound: (): string => "Header opener found.",
        headerOpenerAndCloserFound: (): string => "Header opener and closer found, proceeding to date update after sanity check.",
        headerWriteFailed: (): string => "Failed to write the header to the file, check the logs.",
        headerWriteSuccess: (): string => "Header written successfully.",
        headerNotFound: (): string => "No header was found in this document.",
        headerInjectQuestion: (): string => "No header was found in this document. Would you like to add one?",
        headerInjectQuestionRefused: (): string => "You decided not to add the a header to the file.",
        morseConverted: (input: string, final: string): string => `Converted: ${input} to ${final}`,
        morseDecoded: (input: string, final: string): string => `Converted: ${input} to ${final}`,
        fileLoaded: (absolutePath: string): string => `File ${absolutePath} loaded!`,
        fileParseError: (filePath: string, error: string): string => `The file content (${filePath}) could not be loaded successfully. Error: ${error}.`,
        fileRefreshed: (): string => "Refreshing file content.",
        filePathUpdated: (oldFilePath: string, newFilePath: string): string => `The path has been updated from ${oldFilePath} to ${newFilePath}.`,
        fileUnloaded: (filePath: string): string => `File ${filePath} unloaded from memory`,
        fileExcludedActivationDisabled: (): string => "Activation disabled, the file is in the activation exclusion list.",
        fileSaveFailed: (): string => "Failed to save the file, please try saving it again.",
        cwdUpdated: (oldCwd: string, newCwd: string): string => `The current working directory referential has been updated from ${oldCwd} to ${newCwd}.`,
        cwdDoesNotExist: (cwd: string): string => `The provided current working directory ${cwd} does not exist.`,
        updatingEditionDate: (): string => "Updating the edition date.",
        documentLineScanExceeded: (maxScanLength: number): string => `Scanned the first ${maxScanLength} line(s) of the file but no header was found.`,
        closedDocument: (): string => "The document is closed, stopping operations.",
        emptyDocument: (): string => "There is no document body to work with.",
        brokenHeader: (): string => "Broken header detected, injecting new one, please remove the previous one.",
        extensionActivated: (moduleName: string): string => `🚀 "${moduleName}" is now active!`,
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
        inputArgs: (documentBody: string, filePath: string, fileName: string, fileExtension: string, languageId: string, documentEOL: string, documentVersion: string): string => `this.documentBody = '${documentBody}', this.filePath = '${filePath}', this.fileName = '${fileName}', this.fileExtension = '${fileExtension}', this.languageId = '${languageId}', this.documentEOL = '${documentEOL}', this.documentVersion = '${documentVersion}'`,
        identifiedLanguage: (langName: string): string => `Identified language: ${langName}.`,
        errorDuringFunctionCall: (functionName: string): string => `Something went wrong during the function (${functionName}) call, check logs for more info.`,
        missingLanguageComment: (): string => "Language comment not provided, skipping assignement.",
        getHeaderDescription: (): string => "Please provide a description: ",
        getHeaderTags: (): string => "Please enter the tags for this file, separated by commas:",
        getHeaderPurpose: (): string => "Please provide the purpose of the file:",
        noProvidedCommentOptions: (): string => "There are no options that were provided.",
        chooseSingleLineCommentOption: (): string => "Please select your preferred comment prefix from the options below:",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Update aborted because the file is closed and will thus not be synced.",
        updateEditDateMissingBounds: (): string => "Could not update the header: internal header markers were not found.",
        lastModifiedLineNotFound: (): string => "The header does not contain a 'Last Modified' line to update.",
        lastModifiedUpdated: (): string => "Last Modified' date has been updated successfully.",
        jsonContent: (jsonContentString: String) => `The content of the comment json file: ${jsonContentString}`,
        messageNotFound: (key: string): string => `Message '${key}' not found.`
    },
    fr: {
        inputboxError: (promptText: string, err: string): string => `Erreur dans la boîte de saisie pour ${promptText} : ${err}`,
        quickPickError: (err: string): string => `Erreur dans quickPick : ${err}`,
        quickPickYes: (): string => "Oui",
        quickPickNo: (): string => "Non",
        noCommentToShow: (): string => "Il n’y a aucun commentaire à afficher.",
        unknown: (): string => "Inconnu",
        headerOpenerFound: (): string => "Début d’en-tête trouvé.",
        headerOpenerAndCloserFound: (): string => "Début et fin d’en-tête trouvés, mise à jour de la date après vérification.",
        headerWriteFailed: (): string => "Échec de l’écriture de l’en-tête dans le fichier, consultez les journaux.",
        headerWriteSuccess: (): string => "En-tête écrit avec succès.",
        morseConverted: (input: string, final: string): string => `Converti : ${input} en ${final}`,
        morseDecoded: (input: string, final: string): string => `Converti : ${input} en ${final}`,
        fileLoaded: (absolutePath: string): string => `Fichier ${absolutePath} chargé !`,
        fileParseError: (filePath: string, error: string): string => `Le contenu du fichier (${filePath}) n’a pas pu être chargé correctement. Erreur : ${error}.`,
        fileRefreshed: (): string => "Actualisation du contenu du fichier.",
        filePathUpdated: (oldFilePath: string, newFilePath: string): string => `Le chemin a été mis à jour de ${oldFilePath} vers ${newFilePath}.`,
        fileUnloaded: (filePath: string): string => `Fichier ${filePath} déchargé de la mémoire.`,
        cwdUpdated: (oldCwd: string, newCwd: string): string => `Le répertoire de travail a été mis à jour de ${oldCwd} vers ${newCwd}.`,
        cwdDoesNotExist: (cwd: string): string => `Le répertoire de travail fourni ${cwd} n’existe pas.`,
        updatingEditionDate: (): string => "Mise à jour de la date de modification.",
        documentLineScanExceeded: (maxScanLength: number): string => `Analyse des ${maxScanLength} premières lignes du fichier, aucun en-tête trouvé.`,
        closedDocument: (): string => "Le document est fermé, arrêt des opérations.",
        emptyDocument: (): string => "Il n’y a aucun document à traiter.",
        brokenHeader: (): string => "En-tête corrompu détecté, injection d’un nouveau, veuillez supprimer l’ancien.",
        extensionActivated: (moduleName: string): string => `🚀 L'extension « ${moduleName} » est maintenant active !`,
        helloWorldGreetingsCommand: (moduleName: string): string => `Hello World de ${moduleName} !`,
        noActiveEditor: (): string => "Aucun fichier actif !",
        noFocusedEditors: (): string => "Aucun fichier n’est en focus.",
        openFileToApplyHeader: (): string => "Veuillez ouvrir un fichier sur lequel appliquer l’en-tête.",
        corruptedFileMetaData: (): string => "Les métadonnées nécessaires du fichier n’ont pas été correctement collectées, abandon.",
        messageWritten: (): string => "Message écrit",
        sayHelloWorldResponse: (fileExtension: string, fileName: string, filePath: string, languageId: string): string => `Hello world ! Extension : ${fileExtension}, nom : ${fileName}, chemin : ${filePath}, langage : ${languageId}\n`,
        missingFileError: (): string => "Le dictionnaire des langages est manquant, l’adaptabilité des commentaires est désactivée.",
        unknownFileStructure: (): string => "La structure du dictionnaire des langages est inconnue, l’adaptabilité des commentaires est désactivée.",
        arrayNodeContent: (arrayName: string, arrayIndex: number, arrayNode: any[]): string => `${arrayName}[${arrayIndex}] = ${JSON.stringify(arrayNode)}.`,
        inputArgs: (documentBody: string, filePath: string, fileName: string, fileExtension: string, languageId: string, documentEOL: string, documentVersion: string): string => `this.documentBody = '${documentBody}', this.filePath = '${filePath}', this.fileName = '${fileName}', this.fileExtension = '${fileExtension}', this.languageId = '${languageId}', this.documentEOL = '${documentEOL}', this.documentVersion = '${documentVersion}'`,
        identifiedLanguage: (langName: string): string => `Langage identifié : ${langName}.`,
        errorDuringFunctionCall: (functionName: string): string => `Une erreur est survenue lors de l’appel de la fonction (${functionName}), consultez les journaux.`,
        missingLanguageComment: (): string => "Commentaire de langage non fourni, assignation ignorée.",
        getHeaderDescription: (): string => "Veuillez fournir une description : ",
        getHeaderTags: (): string => "Veuillez saisir les tags de ce fichier, séparés par des virgules :",
        getHeaderPurpose: (): string => "Veuillez fournir l’objectif du fichier :",
        noProvidedCommentOptions: (): string => "Aucune option de commentaire n’a été fournie.",
        chooseSingleLineCommentOption: (): string => "Veuillez sélectionner votre préfixe de commentaire préféré parmi les options ci-dessous :",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Mise à jour annulée car le fichier est fermé et ne sera pas synchronisé.",
        updateEditDateMissingBounds: (): string => "Impossible de mettre à jour l’en-tête : les marqueurs internes n’ont pas été trouvés.",
        lastModifiedLineNotFound: (): string => "L’en-tête ne contient pas de ligne « Dernière modification » à mettre à jour.",
        lastModifiedUpdated: (): string => "La date de « Dernière modification » a été mise à jour avec succès.",
        jsonContent: (jsonContentString: String) => `Contenu du fichier JSON de commentaires : ${jsonContentString}`,
        messageNotFound: (key: string): string => `Message '${key}' introuvable.`
    },
    it: {
        inputboxError: (promptText: string, err: string): string => `Errore nella inputBox per ${promptText}: ${err}`,
        quickPickError: (err: string): string => `Errore in quickPick: ${err}`,
        quickPickYes: (): string => "Sì",
        quickPickNo: (): string => "No",
        noCommentToShow: (): string => "Non ci sono commenti da mostrare.",
        unknown: (): string => "Sconosciuto",
        headerOpenerFound: (): string => "Inizio intestazione trovato.",
        headerOpenerAndCloserFound: (): string => "Inizio e fine intestazione trovati, aggiornamento della data dopo il controllo.",
        headerWriteFailed: (): string => "Impossibile scrivere l’intestazione nel file, controlla i log.",
        headerWriteSuccess: (): string => "Intestazione scritta con successo.",
        morseConverted: (input: string, final: string): string => `Convertito: ${input} in ${final}`,
        morseDecoded: (input: string, final: string): string => `Convertito: ${input} in ${final}`,
        fileLoaded: (absolutePath: string): string => `File ${absolutePath} caricato!`,
        fileParseError: (filePath: string, error: string): string => `Il contenuto del file (${filePath}) non è stato caricato correttamente. Errore: ${error}.`,
        fileRefreshed: (): string => "Aggiornamento del contenuto del file.",
        filePathUpdated: (oldFilePath: string, newFilePath: string): string => `Il percorso è stato aggiornato da ${oldFilePath} a ${newFilePath}.`,
        fileUnloaded: (filePath: string): string => `File ${filePath} scaricato dalla memoria.`,
        cwdUpdated: (oldCwd: string, newCwd: string): string => `La directory di lavoro è stata aggiornata da ${oldCwd} a ${newCwd}.`,
        cwdDoesNotExist: (cwd: string): string => `La directory di lavoro fornita ${cwd} non esiste.`,
        updatingEditionDate: (): string => "Aggiornamento della data di modifica.",
        documentLineScanExceeded: (maxScanLength: number): string => `Analizzate le prime ${maxScanLength} righe del file, nessuna intestazione trovata.`,
        closedDocument: (): string => "Il documento è chiuso, operazioni interrotte.",
        emptyDocument: (): string => "Non c’è alcun documento su cui lavorare.",
        brokenHeader: (): string => "Intestazione danneggiata rilevata, iniezione di una nuova, si prega di rimuovere la precedente.",
        extensionActivated: (moduleName: string): string => `🚀 La tua estensione « ${moduleName} » è ora attiva!`,
        helloWorldGreetingsCommand: (moduleName: string): string => `Hello World da ${moduleName}!`,
        noActiveEditor: (): string => "Nessun file attivo!",
        noFocusedEditors: (): string => "Non ci sono file in focus.",
        openFileToApplyHeader: (): string => "Apri un file su cui applicare l’intestazione.",
        corruptedFileMetaData: (): string => "I metadati richiesti del file non sono stati raccolti correttamente, interruzione.",
        messageWritten: (): string => "Messaggio scritto",
        sayHelloWorldResponse: (fileExtension: string, fileName: string, filePath: string, languageId: string): string => `Hello world! Estensione: ${fileExtension}, nome: ${fileName}, percorso: ${filePath}, linguaggio: ${languageId}\n`,
        missingFileError: (): string => "Il dizionario dei linguaggi è mancante, adattabilità dei commenti disabilitata.",
        unknownFileStructure: (): string => "La struttura del dizionario dei linguaggi è sconosciuta, adattabilità dei commenti disabilitata.",
        arrayNodeContent: (arrayName: string, arrayIndex: number, arrayNode: any[]): string => `${arrayName}[${arrayIndex}] = ${JSON.stringify(arrayNode)}.`,
        inputArgs: (documentBody: string, filePath: string, fileName: string, fileExtension: string, languageId: string, documentEOL: string, documentVersion: string): string => `this.documentBody = '${documentBody}', this.filePath = '${filePath}', this.fileName = '${fileName}', this.fileExtension = '${fileExtension}', this.languageId = '${languageId}', this.documentEOL = '${documentEOL}', this.documentVersion = '${documentVersion}'`,
        identifiedLanguage: (langName: string): string => `Linguaggio identificato: ${langName}.`,
        errorDuringFunctionCall: (functionName: string): string => `Qualcosa è andato storto durante la chiamata della funzione (${functionName}), controlla i log per maggiori informazioni.`,
        missingLanguageComment: (): string => "Commento del linguaggio non fornito, assegnazione ignorata.",
        getHeaderDescription: (): string => "Fornisci una descrizione: ",
        getHeaderTags: (): string => "Inserisci i tag per questo file, separati da virgole:",
        getHeaderPurpose: (): string => "Fornisci lo scopo del file:",
        noProvidedCommentOptions: (): string => "Non sono state fornite opzioni di commento.",
        chooseSingleLineCommentOption: (): string => "Seleziona il prefisso di commento preferito dalle opzioni qui sotto:",
        updateAbortedBecauseFileClosedSyncCancelled: (): string => "Aggiornamento annullato perché il file è chiuso e non sarà sincronizzato.",
        updateEditDateMissingBounds: (): string => "Impossibile aggiornare l’intestazione: marcatori interni non trovati.",
        lastModifiedLineNotFound: (): string => "L’intestazione non contiene una riga 'Ultima modifica' da aggiornare.",
        lastModifiedUpdated: (): string => "La data di 'Ultima modifica' è stata aggiornata con successo.",
        jsonContent: (jsonContentString: String) => `Contenuto del file JSON dei commenti: ${jsonContentString}`,
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
