const db = require('../config/db');

const UserModel = {
    getUserData: async () => {
        const [rows] = await db.query(`
        SELECT
            id,
            ic,
            username,
            address,
            latitude,
            longitude,
            imageOri,
            status,
            submitAttend,
            deleted,
            created_at
        FROM user
        WHERE deleted = 0
        ORDER BY id ASC
    `);
        return rows;
    },

    updateUserStatusById: async (userId, status) => {
        const [result] = await db.query(
            'UPDATE user SET status = ? WHERE id = ? AND deleted = 0',
            [status, userId]
        );
        return result;
    },

    incrementSubmitAttendById: async (userId) => {
        const [result] = await db.query(
            `
            UPDATE user
            SET submitAttend = submitAttend + 1
            WHERE id = ? AND deleted = 0
            `,
            [userId]
        );
        return result;
    },

    softDeleteUser: async (id) => {
        await db.query("UPDATE user SET deleted = 1 WHERE id = ?", [id]);
    },

    createUser: async (user) => {
        const {
            ic,
            username,
            address,
            latitude,
            longitude,
            imageEncryptedBase64,
            status,
            submitAttend,
        } = user;

        await db.query(
            `
            INSERT INTO user
                (ic, username, address, latitude, longitude,
                 imageOri, status, submitAttend, deleted, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, NOW())
            `,
            [
                ic,
                username,
                address,
                latitude,
                longitude,
                Buffer.from(imageEncryptedBase64, "utf8"), // store encryption text as BLOB
                status,
                submitAttend,
            ]
        );
    },
};


module.exports = UserModel;
