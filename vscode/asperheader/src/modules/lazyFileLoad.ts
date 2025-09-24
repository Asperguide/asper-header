import * as fs from 'fs';
import * as path from 'path';
import { logger } from './logger';
import { getMessage } from './messageProvider';
export class LazyFileLoader<T = any> {
    private filePath: string;
    private cache: T | null = null;

    constructor(filePath: string) {
        this.filePath = filePath;
    }

    // Lazy load the file contents
    async get(): Promise<T> {
        if (this.cache) {
            return this.cache; // Already loaded
        }

        const absolutePath = path.resolve(this.filePath);
        const content = await fs.promises.readFile(absolutePath, 'utf-8');
        this.cache = JSON.parse(content) as T;
        logger.info(getMessage("fileLoaded"));
        return this.cache;
    }

    // Force reload the file
    async reload(): Promise<T> {
        this.cache = null;
        logger.info(getMessage("fileRefreshed"));
        return this.get();
    }

    // Unload the file from memory
    unload() {
        this.cache = null;
        logger.info(getMessage("fileUnloaded", this.filePath));
    }
}
