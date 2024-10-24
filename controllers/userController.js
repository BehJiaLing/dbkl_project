const UserModel = require('../models/userModel');

const UserController = {
    getUserData: async (req, res) => {
        try {
            const userData = await UserModel.getUserData();
            res.json(userData); // Send the data in JSON format
        } catch (error) {
            res.status(500).json({ message: 'Error fetching chart data' });
        }
    }
};


module.exports = UserController;
