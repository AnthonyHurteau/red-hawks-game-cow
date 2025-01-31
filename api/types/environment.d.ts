declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TABLE_NAME: string;
            ADMIN_PASSWORD: string;
            USERS_ENDPOINT: string;
            NUMBER_OF_VOTES: string;
            VOTES_WS_ENDPOINT: string;
        }
    }
}

export {};
