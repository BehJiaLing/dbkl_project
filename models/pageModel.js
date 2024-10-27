const db = require('../config/db');

const PageModel = {
    getPageData: async () => {
        const [rows] = await db.query('SELECT admin_id, page_id FROM adminpageaccess');
        // console.log('Page data:', rows); 
        return rows; 
    },
};


module.exports = PageModel;
