import { connection } from "../database/database";
import { Injectable } from '@nestjs/common';
import { CreatePaymentSchema } from "../schemas/payment";
import { 
    CREATE_PAYMENT_SQL,
    GET_PAYMENT_RECORD_BY_PAYMENT_ID_SQL,
    GET_PAYMENT_RECORD_BY_USER_ID_BY_PAYMENT_ID_SQL,
    GET_PAYMENT_RECORD_BY_USER_ID_SQL,
    UPDATE_PAYMENT_STATUS_SQL,
    UPDATE_PAYMENT_STATUS_WITH_OUTSIDE_ID_SQL
} from "../database/sql/payment";

@Injectable()
export class PaymentServices {
    createPayment = async (data: CreatePaymentSchema) => {
        const sql = CREATE_PAYMENT_SQL;
        const [result] = await connection.promise().query(sql, data);
        return result;
    };

    getPaymentRecordByUserId = async (userId: number) => {
        const sql = GET_PAYMENT_RECORD_BY_USER_ID_SQL;
        const [rows] = await connection.promise().query(sql, userId);
        return rows;
    }

    getPaymentRecordByUserIdByPaymentId = async (userId: number, paymentId: number) => {
        const sql = GET_PAYMENT_RECORD_BY_USER_ID_BY_PAYMENT_ID_SQL;
        const [rows] = await connection.promise().query(sql, [userId, paymentId]);
        const data = rows[0] as CreatePaymentSchema;
        return data;
    }

    getPaymentRecordByPaymentId = async (paymentId: number) => {
        const sql = GET_PAYMENT_RECORD_BY_PAYMENT_ID_SQL;
        const [rows] = await connection.promise().query(sql, paymentId);
        const data = rows[0] as CreatePaymentSchema;
        return data;
    }

    updatePaymentStatus = async (paymentId: number, status: string, thirdPartyPaymentId?: string) => {
        if (thirdPartyPaymentId) {
            const sql = UPDATE_PAYMENT_STATUS_WITH_OUTSIDE_ID_SQL;
            const [result] = await connection.promise().query(sql, [status, thirdPartyPaymentId, paymentId]);
            return result;
        }
        const sql = UPDATE_PAYMENT_STATUS_SQL;
        const [result] = await connection.promise().query(sql, [status, paymentId]);
        return result;
    }
}
