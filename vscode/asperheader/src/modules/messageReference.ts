/**
 * @file messageReference.ts
 * @brief Message reference dictionary containing all localized strings for the extension
 * @author Henry Letellier
 * @version 1.0.0
 * @date 2025
 * 
 * This module contains the complete message dictionary for the AsperHeader extension,
 * providing localized strings in multiple languages. It serves as the central repository
 * for all user-facing text, error messages, notifications, and UI labels used throughout
 * the extension. The messages are organized by language code and use function-based
 * generation to support dynamic parameter interpolation.
 * 
 * Supported Languages:
 * - English (en) - Primary language with complete message set
 * - French (fr) - Complete translations for all messages
 * - Italian (it) - Complete translations for all messages
 * 
 * Message Categories:
 * - UI interaction messages (input prompts, confirmations)
 * - File operation messages (loading, saving, parsing)
 * - Header management messages (creation, updating, validation)
 * - Error and warning messages (file errors, validation failures)
 * - Feature-specific messages (watermark, darling, logo displays)
 * - Extension lifecycle messages (activation, status updates)
 * 
 * Message Structure:
 * Each message key maps to a function that accepts parameters and returns a localized string.
 * This allows for dynamic content insertion while maintaining type safety and consistency
 * across all supported languages.
 */

/**
 * @brief Complete message dictionary for all supported languages
 * @export Exported for use by the MessageProvider system
 * 
 * Central repository of all localized messages used throughout the AsperHeader extension.
 * Each language is represented as a nested object where message keys map to functions
 * that generate the appropriate localized string. Function-based messages enable:
 * 
 * - Dynamic parameter interpolation for contextual information
 * - Type-safe parameter passing with TypeScript
 * - Consistent message formatting across languages
 * - Runtime message generation for complex scenarios
 * 
 * Message Organization:
 * - **en**: English (primary) - Complete message set serving as the reference
 * - **fr**: French - Full translation coverage with culturally appropriate phrasing
 * - **it**: Italian - Complete translations with proper Italian conventions
 * 
 * Usage Pattern:
 * ```typescript
 * messages.en.fileLoaded("/path/to/file") // Returns: "File /path/to/file loaded!"
 * messages.fr.fileLoaded("/chemin/vers/fichier") // Returns: "Fichier /chemin/vers/fichier chargé !"
 * ```
 * 
 * Message Categories:
 * - Input/Output operations (file loading, saving, parsing)
 * - User interface interactions (prompts, confirmations, selections)
 * - Header management (creation, updating, validation, injection)
 * - Feature displays (watermark, darling characters, logo showcases)
 * - Error handling (file errors, validation failures, system issues)
 * - Extension lifecycle (activation, status updates, notifications)
 * - Development utilities (debugging, logging, diagnostics)
 * 
 * @note All message functions should maintain consistent parameter signatures across languages
 * @note Missing translations will fall back to English through the MessageProvider system
 */
export const messages: Record<string, Record<string, (...args: any[]) => string>> = {
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
        watermarkAuthorName: (): string => "Author name",
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
        noLogoInstanceProvided: (): string => "No provided logo randomiser instance.",
        randomLogoGatheringFailed: (error: string): string => `The random logo gathering failed, using default logo, error: "${error}"`,
        ramdomLogoGatheringLogoUndefined: (): string => "The logo content is undefined.",
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
        languageNotFound: (LanguageId: string, fileExtension: string): string => `The file language of this document could not be identified, languageID: ${LanguageId}, fileExtention: ${fileExtension}`,
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
        watermarkView: (): string => "vueWatermark",
        watermarkJsonFileInvalid: (): string => "Le fichier JSON de watermark est vide ou invalide",
        watermarkName: (): string => "Nom du watermark",
        watermarkCopyAscii: (): string => "Copier l'ASCII",
        watermarkZoomIn: (): string => "Zoomer",
        watermarkZoomOut: (): string => "Dézoomer",
        watermarkPersonDisplayed: (name: string): string => `Watermark '${name}' affiché.`,
        watermarkChosen: (watermark: string[]): string => `Watermark à afficher : ${JSON.stringify(watermark)}`,
        watermarkNotFound: (): string => "Watermark introuvable",
        watermarkCopied: (name: string): string => `Art ASCII copié pour ${name} !`,
        watermarkAuthorName: (): string => "Auteur",
        darlingView: (): string => "vueDarling",
        darlingJsonFileInvalid: (): string => "Le fichier JSON Darling est vide ou invalide",
        darlingPersonDisplayed: (name: string): string => `Personnage '${name}' affiché.`,
        darlingCopyAscii: (): string => "Copier l'ASCII",
        darlingZoomIn: (): string => "Zoomer",
        darlingZoomOut: (): string => "Dézoomer",
        darlingType: (): string => "Type",
        darlingAge: (): string => "Âge",
        darlingHeight: (): string => "Taille",
        darlingAlias: (): string => "Alias",
        darlingDescription: (): string => "Description",
        darlingQuote: (): string => "Citation",
        darlingMoreInfo: (): string => "Plus d'infos",
        darlingImage: (): string => "Image",
        darlingCopied: (name: string): string => `Art ASCII copié pour ${name} !`,
        logoView: (): string => "vueLogo",
        logoName: (): string => "Nom du logo",
        logoMessage: (logoPath: string): string => `Fichier (${logoPath}) ignoré car ce n'est pas le type recherché.`,
        logoNoRootDir: (): string => "Aucun répertoire racine fourni pour collecter les logos",
        logoRootDirUpdateError: (error: string): string => `Erreur lors de la mise à jour des fichiers de logo, erreur : ${error}`,
        logoDisplayed: (name: string): string => `Logo '${name}' affiché.`,
        logoCopied: (logoName: string): string => `Art ASCII copié pour ${logoName} !`,
        logoChosen: (logo: string[]): string => `Logo à afficher : ${JSON.stringify(logo)}`,
        logoNotFound: (): string => "Logo introuvable",
        logoCopyAscii: (): string => "Copier l'ASCII",
        logoZoomIn: (): string => "Zoomer",
        logoZoomOut: (): string => "Dézoomer",
        headerNotFound: (): string => "Aucun en-tête trouvé dans ce document.",
        headerInjectQuestion: (): string => "Aucun en-tête trouvé dans ce document. Souhaitez-vous en ajouter un ?",
        headerInjectQuestionRefused: (): string => "Vous avez décidé de ne pas ajouter d'en-tête au fichier.",
        fileExcludedActivationDisabled: (): string => "Activation désactivée, le fichier est dans la liste d'exclusion.",
        fileSaveFailed: (): string => "Échec de la sauvegarde du fichier, veuillez réessayer.",
        noLogoInstanceProvided: (): string => "Aucune instance de randomiseur de logo fournie.",
        randomLogoGatheringFailed: (error: string): string => `La collecte aléatoire de logo a échoué, utilisation du logo par défaut, erreur : "${error}"`,
        ramdomLogoGatheringLogoUndefined: (): string => "Le contenu du logo est indéfini.",
        languageNotFound: (LanguageId: string, fileExtension: string): string => `La langue du fichier de ce document n'a pas pu être identifiée, languageID : ${LanguageId}, extension du fichier : ${fileExtension}`,
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
        watermarkView: (): string => "vistaWatermark",
        watermarkJsonFileInvalid: (): string => "Il file JSON watermark è vuoto o non valido",
        watermarkName: (): string => "Nome watermark",
        watermarkCopyAscii: (): string => "Copia ASCII",
        watermarkZoomIn: (): string => "Ingrandisci",
        watermarkZoomOut: (): string => "Rimpicciolisci",
        watermarkPersonDisplayed: (name: string): string => `Watermark '${name}' visualizzato.`,
        watermarkChosen: (watermark: string[]): string => `Watermark da visualizzare: ${JSON.stringify(watermark)}`,
        watermarkNotFound: (): string => "Watermark non trovato",
        watermarkCopied: (name: string): string => `Arte ASCII copiata per ${name}!`,
        watermarkAuthorName: (): string => "Nome autore: ",
        darlingView: (): string => "vistaDarling",
        darlingJsonFileInvalid: (): string => "Il file JSON Darling è vuoto o non valido",
        darlingPersonDisplayed: (name: string): string => `Personaggio '${name}' visualizzato.`,
        darlingCopyAscii: (): string => "Copia ASCII",
        darlingZoomIn: (): string => "Ingrandisci",
        darlingZoomOut: (): string => "Rimpicciolisci",
        darlingType: (): string => "Tipo",
        darlingAge: (): string => "Età",
        darlingHeight: (): string => "Altezza",
        darlingAlias: (): string => "Alias",
        darlingDescription: (): string => "Descrizione",
        darlingQuote: (): string => "Citazione",
        darlingMoreInfo: (): string => "Maggiori info",
        darlingImage: (): string => "Immagine",
        darlingCopied: (name: string): string => `Arte ASCII copiata per ${name}!`,
        logoView: (): string => "vistaLogo",
        logoName: (): string => "Nome logo",
        logoMessage: (logoPath: string): string => `File (${logoPath}) ignorato perché non è del tipo cercato.`,
        logoNoRootDir: (): string => "Nessuna directory radice fornita per raccogliere i loghi",
        logoRootDirUpdateError: (error: string): string => `Errore durante l'aggiornamento dei file logo, errore: ${error}`,
        logoDisplayed: (name: string): string => `Logo '${name}' visualizzato.`,
        logoCopied: (logoName: string): string => `Arte ASCII copiata per ${logoName}!`,
        logoChosen: (logo: string[]): string => `Logo da visualizzare: ${JSON.stringify(logo)}`,
        logoNotFound: (): string => "Logo non trovato",
        logoCopyAscii: (): string => "Copia ASCII",
        logoZoomIn: (): string => "Ingrandisci",
        logoZoomOut: (): string => "Rimpicciolisci",
        headerNotFound: (): string => "Nessuna intestazione trovata in questo documento.",
        headerInjectQuestion: (): string => "Nessuna intestazione trovata in questo documento. Vuoi aggiungerne una?",
        headerInjectQuestionRefused: (): string => "Hai deciso di non aggiungere un'intestazione al file.",
        fileExcludedActivationDisabled: (): string => "Attivazione disabilitata, il file è nella lista di esclusione.",
        fileSaveFailed: (): string => "Salvataggio del file fallito, riprova a salvarlo.",
        noLogoInstanceProvided: (): string => "Nessuna istanza di randomizzatore logo fornita.",
        randomLogoGatheringFailed: (error: string): string => `La raccolta casuale del logo è fallita, uso del logo predefinito, errore: "${error}"`,
        ramdomLogoGatheringLogoUndefined: (): string => "Il contenuto del logo è indefinito.",
        languageNotFound: (LanguageId: string, fileExtension: string): string => `Non è stato possibile identificare la lingua del file di questo documento, languageID: ${LanguageId}, estensione del file: ${fileExtension}`,
        jsonContent: (jsonContentString: String) => `Contenuto del file JSON dei commenti: ${jsonContentString}`,
        messageNotFound: (key: string): string => `Messaggio '${key}' non trovato.`
    }
};
