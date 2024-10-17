const mysql = require('mysql2/promise'); 

const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Bnhn@1258',
    database: 'dbkl_database'
});

module.exports = db;
