const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query('SELECT ic, username, latitude, longitude, status FROM user');
        return rows; 
    },

    checkIC: async (ic) => {
        const [rows] = await db.query('SELECT * FROM user WHERE ic = ?', [ic]);
        return rows[0].count > 0; // Return true if IC exists, false otherwise
    }
};


module.exports = UserModel;
