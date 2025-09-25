import * as fs from 'fs';
import * as fsp from "fs/promises";
import * as path from 'path';
import { logger } from './logger';
import { getMessage } from './messageProvider';
export class LazyFileLoader<T = any> {
    private filePath: string | undefined = undefined;
    private cache: T | null = null;
    private cwd: string = "";

    constructor(filePath: string | undefined = undefined, cwd: string | undefined = undefined) {
        if (filePath) {
            this.filePath = filePath;
        }
        if (cwd) {
            this.cwd = cwd;
        }
    }

    async pathExists(filePath: string): Promise<boolean> {
        try {
            await fsp.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    private async resolveAbsolutePath(filePath: string): Promise<string> {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        const path1: string = path.join(this.cwd, "..", filePath);
        if (await this.pathExists(path1)) {
            return path1;
        }
        return path.join(this.cwd, filePath);
    }

    // Lazy load the file contents
    async get(): Promise<T | undefined> {
        if (this.cache) {
            return this.cache; // Already loaded
        }
        if (this.filePath === undefined) {
            return undefined;
        }
        const absolutePath = await this.resolveAbsolutePath(this.filePath);
        const content = await fs.promises.readFile(absolutePath, 'utf-8');
        const fileExtension: string = path.extname(this.filePath).toLowerCase();
        try {
            if (fileExtension === ".json" || fileExtension === ".jsonc") {
                this.cache = JSON.parse(content) as T;
            } else {
                this.cache = content as T;
            }
        } catch (err) {
            const errorMsg: string = getMessage("fileParseError", this.filePath, String(err));
            logger.error(errorMsg);
            logger.Gui.error(errorMsg);
            return undefined;
        }
        logger.info(getMessage("fileLoaded", absolutePath));
        return this.cache;
    }

    // Force reload the file
    async reload(): Promise<T | undefined> {
        this.cache = null;
        logger.info(getMessage("fileRefreshed"));
        return this.get();
    }

    // Unload the file from memory
    unload() {
        this.cache = null;
        logger.info(getMessage("fileUnloaded", String(this.filePath)));
    }

    async updateFilePath(filePath: string): Promise<boolean> {
        const oldFilePath = this.filePath;
        this.filePath = filePath;
        if (this.cache) {
            const status: T | undefined = await this.reload();
            if (status === undefined) {
                return false;
            }
        }
        logger.info(getMessage("filePathUpdated", String(oldFilePath), String(filePath)));
        return true;
    }

    async updateCurrentWorkingDirectory(cwd: string): Promise<boolean> {
        const oldCwd: string = this.cwd;
        if (! await this.pathExists(cwd)) {
            logger.warning(getMessage("cwdDoesNotExist", cwd));
            return false;
        }
        this.cwd = cwd;
        logger.info(getMessage("cwdUpdated", String(oldCwd), String(this.cwd)));
        return true;
    }
}
