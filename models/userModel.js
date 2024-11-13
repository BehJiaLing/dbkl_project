const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query('SELECT ic, username, submitAttend, latitude, longitude, status, address, imageOri FROM user');
        return rows; 
    },

    updateUserStatus: async (ic, status) => {
        try {
            const [result] = await db.query('UPDATE user SET status = ? WHERE ic = ?', [status, ic]);
            return result; 
        } catch (error) {
            throw new Error('Failed to update user status: ' + error.message);
        }
    },
    incrementSubmitAttend: async (ic) => {
        try {
            const [result] = await db.query('UPDATE user SET submitAttend = submitAttend + 1 WHERE ic = ?', [ic]);
            return result; 
        } catch (error) {
            throw new Error('Failed to increment submitAttend: ' + error.message);
        }
    }
};


module.exports = UserModel;
