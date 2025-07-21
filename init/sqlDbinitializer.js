const mysql = require('mysql2/promise');

const sqlDbInitializer = () => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'D&fs@hh768AvTH3',
        database: 'eCommerce'  // your MySQL password
    });

    return connection;

}

module.exports = sqlDbInitializer;