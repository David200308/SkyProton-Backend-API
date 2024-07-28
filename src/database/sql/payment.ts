export const CREATE_PAYMENT_SQL = 'INSERT INTO payments SET ?';

export const GET_PAYMENT_RECORD_BY_USER_ID_SQL = 'SELECT * FROM payments WHERE userId = ?';

export const GET_PAYMENT_RECORD_BY_USER_ID_BY_PAYMENT_ID_SQL = 'SELECT * FROM payments WHERE userId = ? AND id = ?';

export const GET_PAYMENT_RECORD_BY_PAYMENT_ID_SQL = 'SELECT * FROM payments WHERE id = ?';

export const UPDATE_PAYMENT_STATUS_WITH_OUTSIDE_ID_SQL = 'UPDATE payments SET status = ?, thirdPartyPaymentId = ? WHERE id = ?';

export const UPDATE_PAYMENT_STATUS_SQL = 'UPDATE payments SET status = ? WHERE id = ?';
