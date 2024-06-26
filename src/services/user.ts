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
        const sql = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await connection.promise().query(sql, email);
        return rows;
    }

    getUserByName = async (username: string) => {
        const sql = 'SELECT * FROM users WHERE username = ?';
        const [rows] = await connection.promise().query(sql, username);
        return rows;
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
}
