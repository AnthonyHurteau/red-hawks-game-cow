declare global {
    namespace NodeJS {
        interface ProcessEnv {
            ALLOWED_ORIGINS: string;
            TABLE_NAME: string;
        }
    }
}

export {};
