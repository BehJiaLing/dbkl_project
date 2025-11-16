const db = require('../config/db');

const AccessControlModel = {
    // by role name (from JWT)
    getPagesByRoleName: async (roleName) => {
        const [rows] = await db.query(
            `
            SELECT p.id, p.name, p.path
            FROM pages p
            JOIN role_page_access rpa ON rpa.page_id = p.id
            JOIN roles r ON r.id = rpa.role_id
            WHERE r.name = ?
            ORDER BY p.id
            `,
            [roleName]
        );
        return rows;
    },

    // all roles
    getRolesWithUsers: async () => {
        const [rows] = await db.query(
            `
            SELECT 
                r.id   AS roleId,
                r.name AS roleName,
                a.id   AS userId,
                a.username,
                a.email
            FROM roles r
            LEFT JOIN admin a ON a.role = r.name
            WHERE r.name IN ('admin', 'employer')   
            ORDER BY r.id, a.id
            `
        );
        return rows;
    },

    // All pages (for checkboxes)
    getAllPages: async () => {
        const [rows] = await db.query(
            `SELECT id, name, path FROM pages ORDER BY id`
        );
        return rows;
    },

    // Pages for a specific role (by id)
    getPagesByRoleId: async (roleId) => {
        const [rows] = await db.query(
            `
            SELECT p.id, p.name, p.path
            FROM pages p
            JOIN role_page_access rpa ON rpa.page_id = p.id
            WHERE rpa.role_id = ?
            ORDER BY p.id
            `,
            [roleId]
        );
        return rows;
    },

    // Update a role's page access list
    updateRolePages: async (roleId, pageIds) => {
        // Clear existing access
        await db.query('DELETE FROM role_page_access WHERE role_id = ?', [roleId]);

        if (pageIds && pageIds.length > 0) {
            const values = pageIds.map((pageId) => [roleId, pageId]);
            await db.query(
                'INSERT INTO role_page_access (role_id, page_id) VALUES ?',
                [values]
            );
        }
    }
};

module.exports = AccessControlModel;
