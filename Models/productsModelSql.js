
const mysql = require('mysql2');

const sqlDbandTable = () => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'D&fs@hh768AvTH3'  // your MySQL password
    });



    connection.connect((err) => {
        if (err) throw err;
        console.log('Connected to MySQL!');

    })

    let createDbQuery = 'CREATE DATABASE IF NOT EXISTS eCommerce';

    connection.query(createDbQuery, (err, res) => {
        if (err) throw err;
        console.log('Database created');
    })

    let imgAddress = 'https://tinyurl.com/kkdxnkee'

    const createTableQuery = `
CREATE TABLE IF NOT EXISTS product (
    product_id VARCHAR(150) PRIMARY KEY,
    product_name VARCHAR(250) NOT NULL,
    category VARCHAR(250),
    image VARCHAR(250) DEFAULT 'https://tinyurl.com/kkdxnkee',
    price INT,
    description VARCHAR(500),
    features VARCHAR(500),
    admin_id VARCHAR(150),
    FOREIGN KEY(admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE
)
`;


    connection.changeUser({ database: 'eCommerce' }, (err) => {
        if (err) throw err;
        connection.query(createTableQuery, (err, res) => {
            if (err) throw err;
            console.log('Table created successfully');
            //connection.end()
        })

    })

    return connection;

}

const initializer = () => {
    const connection = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'D&fs@hh768AvTH3',
        database: 'myDatabase1'  // your MySQL password
    });

    return connection;

}

sqlDbandTable();

//module.exports = {sqlDbandTable , initializer};