import { compare, hash } from "bcryptjs";
import { Secret, JwtPayload, sign, verify } from 'jsonwebtoken';
import 'dotenv/config'

export const passwordHash = async (password: string) => {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
};

export const passwordVerify = async (password: string, hashedPassword: string) => {
    const result = await compare(password, hashedPassword);
    return result;
};

export const generateToken = (payload: JwtPayload) => {
    const token = sign(
        payload,
        process.env.JWT_SECRET as Secret, 
        { expiresIn: '24h' }
    );

    return token;
};

export const verifyToken = async (token: string) => {
    try {
        const payload = verify(token, process.env.JWT_SECRET as Secret);
        return payload;
    } catch (error) {
        return error;
    }
};
