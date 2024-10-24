const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query('SELECT ic, username, latitude, longitude, status, address FROM user');
        return rows; 
    }
};


module.exports = UserModel;
