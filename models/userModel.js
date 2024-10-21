const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query('SELECT ic, username, latitude, longitude, status FROM user');
        return rows; 
    }
};

module.exports = UserModel;
