const mysql = require('mysql2');



const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'D&fs@hh768AvTH3',
    database : 'eCommerce' 
  });

  connection.connect((err) => { 
    if (err) throw err;
    console.log('Connected to MySQL!');

})

//no need product and customer|| will have cart id

const createTableQuery = `CREATE TABLE IF NOT EXISTS Payment(
    payment_id VARCHAR(250) primary key,
    name VARCHAR(250),
    phone_number VARCHAR(250),
    address VARCHAR(250),
    city VARCHAR(250),
    total_amount INT,
);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Payment table created successfully');
        connection.end()
    })
    
})

