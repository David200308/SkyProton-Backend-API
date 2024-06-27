export type User = {
    id: string;
    username: string;
    email: string;
    password?: string;
    createAt: Date;
    updateAt: Date;
    isVerify: boolean;
    isThirdParty: boolean;
    thirdPartyProvider?: string;
    thirdPartyId?: string;
    thrirdPartyRefreshToken?: string;
}

export type SignUpSchema = {
    username: string;
    email: string;
    password?: string;
    isThirdParty: boolean;
    thirdPartyProvider?: string;
    thirdPartyId?: string;
    thrirdPartyRefreshToken?: string;
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
    isVerify: boolean;
    isThirdParty: boolean;
    thirdPartyProvider?: string;
    thirdPartyId?: string;
}
