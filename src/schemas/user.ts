export type User = {
    id: string;
    username: string;
    email: string;
    password?: string;
    createAt: Date;
    updateAt: Date;
    isThirdParty: boolean;
    thirdPartyProvider?: string;
    thirdPartyId?: string;
}

export type SignUpSchema = {
    username: string;
    email: string;
    password: string;
    isThirdParty: boolean;
}

export type SignInSchema = {
    email: string;
    password: string;
}

export type ReturnUserSchema = {
    id: string;
    username: string;
    email: string;
    createAt: Date;
    updateAt: Date;
    isThirdParty: boolean;
    thirdPartyProvider?: string;
    thirdPartyId?: string;
}
