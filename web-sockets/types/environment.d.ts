declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TABLE_NAME: string;
            WS_ENDPOINT: string;
        }
    }
}

export {};
