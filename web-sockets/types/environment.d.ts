declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TABLE_NAME: string;
            ENDPOINT: string;
        }
    }
}

export {};
