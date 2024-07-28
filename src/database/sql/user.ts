export const CREATE_USER_SQL = 'INSERT INTO users SET ?';

export const GET_USER_BY_EMAIL_SQL = 'SELECT * FROM users WHERE email = ?';

export const GET_USER_BY_NAME_SQL = 'SELECT * FROM users WHERE username = ?';

export const GET_USER_BY_ID_SQL = 'SELECT * FROM users WHERE id = ?';

export const ACTIVATE_USER_SQL = 'UPDATE users SET isVerify = 1 WHERE email = ?';

export const DELETE_USER_SQL = 'DELETE FROM users WHERE id = ?';
