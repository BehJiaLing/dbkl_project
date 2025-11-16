// models/AuthModel.js
const db = require('../config/db'); 

const AuthModel = {
    // Create new user for sign up
    createUser: async ({ username, email, passwordHash, role, verificationToken }) => {
        const [result] = await db.query(
            `INSERT INTO admin (username, email, password_hash, role, verification_token, is_verified)
             VALUES (?, ?, ?, ?, ?, 0)`,
            [username, email, passwordHash, role, verificationToken]
        );
        return result.insertId;
    },

    // Find user by email
    findByEmail: async (email) => {
        const [rows] = await db.query(
            'SELECT * FROM admin WHERE email = ?',
            [email]
        );
        return rows[0];
    },

    // Find user by verification token
    findByVerificationToken: async (token) => {
        const [rows] = await db.query(
            'SELECT * FROM admin WHERE verification_token = ?',
            [token]
        );
        return rows[0];
    },

    // Mark user as verified
    verifyUser: async (userId) => {
        await db.query(
            'UPDATE admin SET is_verified = 1, verification_token = NULL WHERE id = ?',
            [userId]
        );
    },

    // Get user by id (for token checks if needed)
    findById: async (id) => {
        const [rows] = await db.query(
            'SELECT id, username, email, role, is_verified FROM admin WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    setResetToken: async (email, token, expiresAt) => {
        await db.query(
            "UPDATE admin SET reset_token = ?, reset_token_expires = ? WHERE email = ?",
            [token, expiresAt, email]
        );
    },

    findByResetToken: async (token) => {
        const [rows] = await db.query(
            "SELECT * FROM admin WHERE reset_token = ? AND reset_token_expires > NOW()",
            [token]
        );
        return rows[0] || null;
    },

    updatePasswordAndClearResetToken: async (userId, passwordHash) => {
        await db.query(
            "UPDATE admin SET password_hash = ?, reset_token = NULL, reset_token_expires = NULL WHERE id = ?",
            [passwordHash, userId]
        );
    },
};

module.exports = AuthModel;
