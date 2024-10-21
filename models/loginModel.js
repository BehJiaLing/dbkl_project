const db = require('../config/db');

const LoginModel = {
    authenticateAdmin: async (username, password) => {
        try {
            const [rows] = await db.query('SELECT * FROM admin WHERE username = ? AND password = ?', [username, password]);
            return rows.length > 0 ? rows[0] : null; // Return the admin data if found, otherwise return null
        } catch (error) {
            console.error('Database query failed:', error);
            throw error; // Rethrow or handle the error as necessary
        }
    }
};

