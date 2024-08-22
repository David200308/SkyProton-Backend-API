import { CreateDevSchema } from "../schemas/dev";
import { connection } from "../database/database";
import { Injectable } from '@nestjs/common';
import { 
    CREATE_DEV_SQL 
} from "../database/sql/dev";

@Injectable()
export class DevServices {
    requestDevAPPIdNAPPSecret = async (data: CreateDevSchema) => {
        const sql = CREATE_DEV_SQL;
        const [result] = await connection.promise().query(sql, data);
        return result;
    };

    getDev
}
