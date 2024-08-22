export type Dev = {
    id: number;
    userId: number;
    appId: string; // uuid
    appSecret: string;
    redirectOrigin: string;
    createAt: Date;
    updateAt: Date;
    status: boolean; // true | false
}

export type CreateDevSchema = {
    userId: string;
    redirectOrigin: string;
}
