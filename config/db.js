const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'Bnhn@1258',
    database: 'dbkl_database'
});

module.exports = pool.promise(); // Promise-based pool
