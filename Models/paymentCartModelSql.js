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

const createTableQuery = `CREATE TABLE IF NOT EXISTS PaymentCart(
    payment_id VARCHAR(250),
    customer_id VARCHAR(250),
    product_id VARCHAR(250),
    quantity INT,
    primary key (payment_id , customer_id , product_id),
    FOREIGN KEY (payment_id) REFERENCES payment(payment_id) ON DELETE CASCADE,
    FOREIGN KEY (customer_id) REFERENCES customer(customer_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES product(product_id) ON DELETE CASCADE
);`;


connection.changeUser({database : 'eCommerce'} , (err) => {
    if (err) throw err;
    connection.query(createTableQuery , (err , res) => {
        if (err) throw err;
        console.log('Payment table created successfully');
        connection.end()
    })
    
})

