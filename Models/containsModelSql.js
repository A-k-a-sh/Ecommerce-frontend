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
//only paymentid
const createTableQuery = `CREATE TABLE IF NOT EXISTS Contains(
    Contains_id VARCHAR(150) primary key,
    payment_id VARCHAR(150),

);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Contains table created successfully');
        connection.end()
    })
    
})

