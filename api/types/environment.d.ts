declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TABLE_NAME: string;
            ADMIN_PASSWORD: string;
            USERS_ENDPOINT: string;
            PLAYERS_ENDPOINT: string;
            VOTES_ENDPOINT: string;
        }
    }
}

export {};
