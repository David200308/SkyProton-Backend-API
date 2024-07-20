import { connection } from "../database";
import { Injectable } from '@nestjs/common';

@Injectable()
export class PointsServices {
    addPoints = async (id: string, needAddPoints: string) => {
        const searchIdSQL = `SELECT * FROM points where userId = ?`;
        const [searchId] = await connection.promise().query(searchIdSQL, id);
        if (searchId) {
            const updatePointsSQL = `UPDATE points SET points = points + ? WHERE userId = ?`;
            const [result] = await connection.promise().query(updatePointsSQL, [needAddPoints, id]);
            return result;
        }
        const insertPointsSQL = `INSERT INTO points SET ?`;
        const [result] = await connection.promise().query(insertPointsSQL, { userId: id, points: needAddPoints });
        return result;
    };

    getPoints = async (id: string) => {
        const sql = `SELECT * FROM points WHERE userId = ?`;
        const [rows] = await connection.promise().query(sql, id);
        const data = rows[0];
        return data || { userId: id, points: 0 };
    };
}
