import { connection } from "../database/database";
import { Injectable } from '@nestjs/common';
import { 
    ADD_POINTS_SQL, 
    GET_POINTS_SQL, 
    UPDATE_POINTS_SQL
} from "../database/sql/points";

@Injectable()
export class PointsServices {
    addPoints = async (id: string, needAddPoints: string) => {
        const searchIdSQL = GET_POINTS_SQL;
        const [searchId] = await connection.promise().query(searchIdSQL, id);
        if (searchId[0]) {
            const updatePointsSQL = UPDATE_POINTS_SQL;
            await connection.promise().query(updatePointsSQL, [needAddPoints, id]);
            const res = this.getPoints(id);

            return res;
        }
        const insertPointsSQL = ADD_POINTS_SQL;
        await connection.promise().query(insertPointsSQL, { userId: id, points: needAddPoints });
        const res = this.getPoints(id);
        
        return res;
    };

    getPoints = async (id: string) => {
        const sql = GET_POINTS_SQL;
        const [rows] = await connection.promise().query(sql, id);
        const data = rows[0];
        return data || { userId: id, points: 0 };
    };
}
