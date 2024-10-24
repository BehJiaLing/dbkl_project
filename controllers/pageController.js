const PageModel = require('../models/pageModel');

const PageController = {
    getPageData: async (req, res) => {
        try {
            const pageData = await PageModel.getPageData();
            res.json(pageData); // Send the data in JSON format
        } catch (error) {
            console.error('Error fetching chart data:', error); // Log the error details
            res.status(500).json({ message: 'Error fetching chart data', error: error.message });
        }
    }
};

module.exports = PageController;
