declare global {
    namespace NodeJS {
        interface ProcessEnv {
            TABLE_NAME: string;
            ADMIN_PASSWORD: string;
            CREATE_USER_ENDPOINT: string;
            GET_CORE_PLAYER_ENDPOINT: string;
            GET_VOTES_ENDPOINT: string;
        }
    }
}

export {};
