import { connection } from "../database/database";
import { SignUpSchema, User } from "../schemas/user";
import { Injectable } from '@nestjs/common';
import { USER_ALEADY_EXISTS } from "../const/user";
import { 
    ACTIVATE_USER_SQL,
    CREATE_USER_SQL, 
    DELETE_USER_SQL, 
    GET_USER_BY_EMAIL_SQL,
    GET_USER_BY_ID_SQL,
    GET_USER_BY_NAME_SQL
} from "../database/sql/user";

@Injectable()
export class UserServices {
    createUser = async (data: SignUpSchema) => {
        const searchUser = await this.getUserByEmail(data.email);
        if (searchUser) {
            throw new Error(USER_ALEADY_EXISTS);
        }
        const sql = CREATE_USER_SQL;
        const [result] = await connection.promise().query(sql, data);
        return result;
    };

    getUserByEmail = async (email: string) => {
        try {
            const sql = GET_USER_BY_EMAIL_SQL;
            const [rows] = await connection.promise().query(sql, email);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    getUserByName = async (username: string) => {
        try {
            const sql = GET_USER_BY_NAME_SQL;
            const [rows] = await connection.promise().query(sql, username);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    getUserById = async (id: number): Promise<User> => {
        try {
            const sql = GET_USER_BY_ID_SQL;
            const [rows] = await connection.promise().query(sql, id);
            const data = rows[0] as User;
            return data;
        } catch (error) {
            throw new Error(error);
        }
    }

    activateUser = async (email: string) => {
        const sql = ACTIVATE_USER_SQL;
        const [result] = await connection.promise().query(sql, email);
        return result;
    }

    deleteUser = async (id: number) => {
        const sql = DELETE_USER_SQL;
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
        const searchUser = await this.getUserByEmail(data.email);
        if (searchUser) {
            if (searchUser.thirdPartyProvider !== data.thirdPartyProvider) {
                throw new Error(USER_ALEADY_EXISTS);
            }
        } else {
            await this.createUser(data);
        }

        const res = await this.getUserByEmail(data.email);
        const result = {
            id: res.id,
            username: res.username,
            email: res.email,
        }

        return result;
    }

    facebookLogin = async (req: any) => {
        if (!req.user) {
            return false;
        }
        const data = {
            username: req.user.user.firstName + " " + req.user.user.lastName,
            email: req.user.user.email,
            isThirdParty: true,
            thirdPartyProvider: 'facebook',
        }
        const searchUser = await this.getUserByEmail(data.email);
        if (searchUser) {
            if (searchUser.thirdPartyProvider !== data.thirdPartyProvider) {
                throw new Error(USER_ALEADY_EXISTS);
            }
        } else {
            await this.createUser(data);
        }

        const res = await this.getUserByEmail(data.email);
        const result = {
            id: res.id,
            username: res.username,
            email: res.email,
        }

        return result;
    }
}
