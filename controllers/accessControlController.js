const AccessControlModel = require('../models/AccessControlModel');

const AccessControlController = {
    // For current logged-in user
    getMyPages: async (req, res) => {
        try {
            const roleName = req.user.role;
            const pages = await AccessControlModel.getPagesByRoleName(roleName);
            return res.status(200).json(pages);
        } catch (err) {
            console.error('getMyPages error:', err);
            return res.status(500).json({ message: 'Error fetching pages.' });
        }
    },

    // get roles + users list
    getRolesWithUsers: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: admin only.' });
            }

            const rows = await AccessControlModel.getRolesWithUsers();

            // Group by role
            const rolesMap = new Map();

            rows.forEach((row) => {
                if (!rolesMap.has(row.roleId)) {
                    rolesMap.set(row.roleId, {
                        roleId: row.roleId,
                        roleName: row.roleName,
                        users: []
                    });
                }
                if (row.userId) {
                    rolesMap.get(row.roleId).users.push({
                        id: row.userId,
                        username: row.username,
                        email: row.email
                    });
                }
            });

            const result = Array.from(rolesMap.values());
            return res.status(200).json(result);
        } catch (err) {
            console.error('getRolesWithUsers error:', err);
            return res.status(500).json({ message: 'Error fetching roles/users.' });
        }
    },

    // get all pages list
    getAllPages: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: admin only.' });
            }

            const pages = await AccessControlModel.getAllPages();
            return res.status(200).json(pages);
        } catch (err) {
            console.error('getAllPages error:', err);
            return res.status(500).json({ message: 'Error fetching pages.' });
        }
    },

    // get accessible pages for specific role (by id)
    getRolePages: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: admin only.' });
            }

            const { roleId } = req.params;
            const pages = await AccessControlModel.getPagesByRoleId(roleId);
            return res.status(200).json(pages);
        } catch (err) {
            console.error('getRolePages error:', err);
            return res.status(500).json({ message: 'Error fetching role pages.' });
        }
    },

    // update role's accessible pages
    updateRolePages: async (req, res) => {
        try {
            if (req.user.role !== 'admin') {
                return res.status(403).json({ message: 'Forbidden: admin only.' });
            }

            const { roleId, pageIds } = req.body;
            if (!roleId || !Array.isArray(pageIds)) {
                return res.status(400).json({ message: 'roleId and pageIds are required.' });
            }

            await AccessControlModel.updateRolePages(roleId, pageIds);

            return res.status(200).json({ message: 'Role access updated.' });
        } catch (err) {
            console.error('updateRolePages error:', err);
            return res.status(500).json({ message: 'Error updating role access.' });
        }
    }
};

module.exports = AccessControlController;
