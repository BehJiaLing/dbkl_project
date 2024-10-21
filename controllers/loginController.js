const LoginModel = require('../models/loginModel'); 

const loginController = {
    login: async (req, res) => {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ message: 'Username and password are required' });
        }

        try {
            const admin = await LoginModel.authenticateAdmin(username, password);
            if (admin) {
                const { password, ...adminData } = admin; 
                return res.status(200).json({ message: 'Login successful', admin: adminData });
            } else {
                return res.status(401).json({ message: 'Invalid username or password' });
            }
        } catch (error) {
            console.error('Error during login:', error);
            return res.status(500).json({ message: 'Internal server error' });
        }
    }
};

module.exports = loginController;
