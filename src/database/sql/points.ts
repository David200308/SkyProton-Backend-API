export const ADD_POINTS_SQL = 'INSERT INTO points SET ?';

export const UPDATE_POINTS_SQL = 'UPDATE points SET points = points + ? WHERE userId = ?';

export const GET_POINTS_SQL = 'SELECT * FROM points where userId = ?';
