const mysql = require('mysql2');



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'D&fs@hh768AvTH3',
    database : 'eCommerce',
  });

  connection.connect((err) => {
    if (err) throw err;
    console.log('Connected to MySQL!');

})

const createTableQuery = `CREATE TABLE IF NOT EXISTS Admin(
    admin_id VARCHAR(150) primary key,
    admin_name VARCHAR(250) NOT NULL UNIQUE,
    email VARCHAR(250) UNIQUE,
    password VARCHAR(250)
);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Admin table created successfully');
        connection.end()
    })
    
})

