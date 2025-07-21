const { faker } = require('@faker-js/faker');
const mysql = require('mysql2');
const sqlDbInitializer = require('./sqlDbinitializer');
const data = require('./dataForSql');


let arrayOfArrays = [];
data.forEach((item) => {
    let newArr = [item.product_id, item.product_name, item.category, item.price, item.description, item.features , '0bd08056-3cdd-4c21-b88e-c6a156a6196f'];
    arrayOfArrays.push(newArr);
})

let queryTodelete = `TRUNCATE TABLE product;`;
const insertData = async () => {
    const connection = await sqlDbInitializer();
    try {
        connection.query(queryTodelete, (err, res) => {
            if (err) throw err;
            console.log('Data deleted successfully');
            let query = `INSERT INTO product ( product_id  , product_name , category , price , description , features , owner_id) Values ?`;
            let info = arrayOfArrays;

            try {
                connection.query(query, [info], (err, res) => {
                    if (err) throw err;
                    console.log('Data inserted in product table successfully');
                    connection.end();
                });

            } catch (error) {
                console.log(error);
            }
        })
    } catch (err) {
        console.log(err);
    }
    //connection.end();
}

insertData();   
//console.log(arrayOfArrays);


