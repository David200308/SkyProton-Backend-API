import { connection } from "../database";
import { Injectable } from '@nestjs/common';
import { CreatePaymentSchema } from "../schemas/payment";

@Injectable()
export class PaymentServices {
    createPayment = async (data: CreatePaymentSchema) => {
        const sql = 'INSERT INTO payments SET ?';
        const [result] = await connection.promise().query(sql, data);
        return result;
    };

    getPaymentRecordByUserId = async (userId: number) => {
        const sql = 'SELECT * FROM payments WHERE userId = ?';
        const [rows] = await connection.promise().query(sql, userId);
        return rows;
    }

    getPaymentRecordByUserIdByPaymentId = async (userId: number, paymentId: number) => {
        const sql = 'SELECT * FROM payments WHERE userId = ? AND id = ?';
        const [rows] = await connection.promise().query(sql, [userId, paymentId]);
        const data = rows[0] as CreatePaymentSchema;
        return data;
    }

    getPaymentRecordByPaymentId = async (paymentId: number) => {
        const sql = 'SELECT * FROM payments WHERE id = ?';
        const [rows] = await connection.promise().query(sql, paymentId);
        const data = rows[0] as CreatePaymentSchema;
        return data;
    }

    updatePaymentStatus = async (paymentId: number, status: string, thirdPartyPaymentId?: string) => {
        if (thirdPartyPaymentId) {
            const sql = 'UPDATE payments SET status = ?, thirdPartyPaymentId = ? WHERE id = ?';
            const [result] = await connection.promise().query(sql, [status, thirdPartyPaymentId, paymentId]);
            return result;
        }
        const sql = 'UPDATE payments SET status = ? WHERE id = ?';
        const [result] = await connection.promise().query(sql, [status, paymentId]);
        return result;
    }
}
