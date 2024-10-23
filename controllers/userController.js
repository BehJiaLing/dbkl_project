const UserModel = require('../models/userModel');

const UserController = {
    getUserData: async (req, res) => {
        try {
            const userData = await UserModel.getUserData();
            res.json(userData); // Send the data in JSON format
        } catch (error) {
            res.status(500).json({ message: 'Error fetching chart data' });
        }
    },


    verifyIC: async (req, res) => {
        try {
            const { ic } = req.query; // Get IC from query parameters
            const userExists = await UserModel.checkIC(ic); 
            if (userExists) {
                res.json({ exists: true }); 
            } else {
                res.json({ exists: false }); 
            }
        } catch (error) {
            res.status(500).json({ message: 'Error verifying IC' });
        }
    }
};

module.exports = UserController;
