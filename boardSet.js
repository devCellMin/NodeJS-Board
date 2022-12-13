// Set Table Name Board
// Before Start -> npm install mysql

const mysql = require("mysql");
require('dotenv').config();

const conn = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});

const TB_Name = "Board"

// Board
// board_no INT PRIMARY KEY AUTO_INCREMENT, 
// board_title VARCHAR(255), 
// board_content TEXT, 
// board_password VARCHAR(255)

const Queries = {
    refresh  : `Drop Table if Exists ${TB_Name}`,
    createTB : `Create table Board
                (
                    board_no INT PRIMARY KEY AUTO_INCREMENT, 
                    board_title VARCHAR(255), 
                    board_content TEXT, 
                    board_password VARCHAR(255)
                )`
};

function executeQuery() {
    conn.query(Queries.refresh, (err, result)=> {
        err ? console.log(err) : console.log(result);
    });
    conn.query(Queries.createTB, function(err, result) {
        err ? console.log(err) : (()=> {
            // Board 테이블 내용 출력
            conn.query(`desc ${TB_Name}`, function(desc_err, result) {
                desc_err ? console.log(desc_err) : console.log(result);
            })
        })()
    });
}

// Start
executeQuery();