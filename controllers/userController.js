const UserModel = require('../models/userModel');

const UserController = {
    getUserData: async (req, res) => {
        try {
            const userData = await UserModel.getUserData();
            res.json(userData); // Send the data in JSON format
        } catch (error) {
            res.status(500).json({ message: 'Error fetching user data' + error});
        }
    },

    updateUserStatus: async (req, res) => {
        const { ic, status } = req.body;

        try {
            const result = await UserModel.updateUserStatus(ic, status);
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'User status updated successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error updating user status:', error);
            res.status(500).json({ message: 'Error updating user status: ' + error.message });
        }
    },
    incrementSubmitAttend: async (req, res) => {
        const { ic } = req.body;

        try {
            const userData = await UserModel.getUserData(); // Fetch current user data
            const user = userData.find(user => user.ic === parseInt(ic));

            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }

            if (user.submitAttend >= 3) {
                return res.status(400).json({ message: 'Maximum submit attempts reached' });
            }

            const result = await UserModel.incrementSubmitAttend(ic);
            if (result.affectedRows > 0) {
                res.status(200).json({ message: 'SubmitAttend updated successfully' });
            } else {
                res.status(404).json({ message: 'User not found' });
            }
        } catch (error) {
            console.error('Error incrementing submitAttend:', error);
            res.status(500).json({ message: 'Error incrementing submitAttend: ' + error.message });
        }
    }
};


module.exports = UserController;
