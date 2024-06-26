import { connection } from "../database";
import { SignUpSchema, User } from "../schemas/user";
import { Injectable } from '@nestjs/common';

@Injectable()
export class UserServices {
    createUser = async (data: SignUpSchema) => {
        const sql = 'INSERT INTO users SET ?';
        const [result] = await connection.promise().query(sql, data);
        return result;
    };

    getUserByEmail = async (email: string) => {
        try {
            const sql = 'SELECT * FROM users WHERE email = ?';
            const [rows] = await connection.promise().query(sql, email);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    getUserByName = async (username: string) => {
        try {
            const sql = 'SELECT * FROM users WHERE username = ?';
            const [rows] = await connection.promise().query(sql, username);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    getUserById = async (id: string): Promise<User> => {
        try {
            const sql = 'SELECT * FROM users WHERE id = ?';
            const [rows] = await connection.promise().query(sql, id);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    deleteUser = async (id: string) => {
        const sql = 'DELETE FROM users WHERE id = ?';
        const [result] = await connection.promise().query(sql, id);
        return result;
    }

    // updateUser = async (id: string, data: User) => {
    //     const sql = 'UPDATE users SET ? WHERE id = ?';
    //     const [result] = await connection.promise().query(sql, [data, id]);
    //     return result;
    // }

    googleLogin = async (req: any) => {
        if (!req.user) {
            return false;
        }
        const data = {
            username: req.user.firstName + " " + req.user.lastName,
            email: req.user.email,
            isThirdParty: true,
            thirdPartyProvider: 'google',
            thrirdPartyRefreshToken: req.user.refreshToken,
        }
        await this.createUser(data);

        const res = await this.getUserByEmail(data.email);
        const result = {
            id: res.id,
            username: res.username,
            email: res.email,
        }

        return result;
    }
}
