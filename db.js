const Pool = require('pg').Pool;//postgres connection library

const pool = new Pool({
    user : 'postgres',
    password: 'cjcj1122',
    port: '5432',
    host:'localhost',
    database: 'linkers'
});

module.exports = pool