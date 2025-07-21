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

const createTableQuery = `CREATE TABLE IF NOT EXISTS Cart(
    product_id VARCHAR(250),
    customer_id VARCHAR(250),
    quantity INT,
    PRIMARY KEY (product_id, customer_id),
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE
);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Cart table created successfully');
        connection.end()
    })
    
})

