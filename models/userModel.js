const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query('SELECT username, latitude, longitude FROM user');
        return rows; 
    }
};

module.exports = UserModel;
