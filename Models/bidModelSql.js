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

const createTableQuery = `CREATE TABLE IF NOT EXISTS Bid(
    Bid_id VARCHAR(150) PRIMARY KEY,
    admin_id VARCHAR(150) NOT NULL,
    bid_date DATETime NOT NULL,
    starting_time INT NOT NULL,
    ending_time INT NOT NULL,
    bid_amount INT NOT NULL,
    product_id VARCHAR(150) NOT NULL,
    customer_id VARCHAR(150),
    status VARCHAR(150),
    FOREIGN KEY(product_id) REFERENCES Product(product_id) ON DELETE CASCADE,
    FOREIGN KEY(customer_id) REFERENCES Customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY(admin_id) REFERENCES Admin(admin_id) ON DELETE CASCADE

);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Bid table created successfully');
        connection.end()
    })
    
})

