// Add Modules
const fs = require('node:fs');
const ejs = require("ejs"); // npm install ejs
const mysql = require("mysql"); // npm install mysql
const express = require("express"); // npm install express@4
const bodyParser = require("body-parser"); // npm install body-parser
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// DB Set
const client = mysql.createConnection({
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    database: process.env.DB_NAME
});
const TB_Name = "Board";

// Server Start
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log(`Port ${PORT} Started`);
});

/*
    SETTING HTMLS & DB QUERYS
*/
const pageHTML = {
    List : "boardList.html",
    Write : "contentWrite.html",
    Read : "contentRead.html",
    Modify : "contentModify.html",
    Delete : "contentRemove.html"
}

const BoardQuery = {
    board_List : ()=> {
        return `Select * from ${TB_Name} Order by board_no DESC`;
    },
    board_Write : (title, content, password)=> {
        return `Insert into ${TB_Name}(board_title, board_content, board_password) Values ('${title}', '${content}', '${password}')`;
    },
    board_Read : (board_no)=> {
        return `Select * From ${TB_Name} Where board_no = ${board_no}`;
    },
    board_Modify : (title, content, password, board_no)=> {
        return `Update ${TB_Name} Set board_title = '${title}', board_content = '${content}', board_password = '${password}' Where board_no = ${board_no}`;
    },
    board_Delete : (board_no)=> {
        return `Delete From ${TB_Name} Where board_no = ${board_no}`;
    }
}

/* 
// SERVER SETTING=====================================================================================================
// get('/')         : Content List
// get('/write')    : HTML for Insert
// post('/write')   : Insert Data into DB
// get('/read/:board_no')     : Set Data in HTML
// get('/modify/:board_no')  : HTML for Edit
// post('/modify/:board_no')  : Edit Data in DB
// get('/remove/:board_no'): Delete Data
// ===================================================================================================================
*/
// Content List
app.get('/', function (req, res) {
    fs.readFile(pageHTML.List, function (err, data) {
        client.query(BoardQuery.board_List(), function (error, result) {
            res.send(ejs.render(data.toString(), { result: result }));
        });
    });
});

// Write
app.get('/write', function (req, res) {
    fs.readFile(pageHTML.Write, "utf8", function (err, data) {
        res.send(data);
    });
});

app.post("/write", function (req, res) {
    const { board_title, board_content, board_password } = req.body;
    client.query(BoardQuery.board_Write(board_title, board_content, board_password), function (err) {
        err? console.log(err) : res.redirect("/");
    });
});

// Read
app.get('/read/:board_no', function (req, res) {
    fs.readFile(pageHTML.Read, "utf-8", function (err, data) {
        client.query(BoardQuery.board_Read(req.params.board_no), function (error, result) {
            res.send(ejs.render(data, {
                result: result[0]
            }));
        });
    });
});

// Modify
app.get('/modify/:board_no', function (req, res) {
    fs.readFile(pageHTML.Modify, "utf-8", function (err, data) {
        client.query(BoardQuery.board_Read(req.params.board_no), function (error, result) {
            res.send(ejs.render(data, {
                result: result[0]
            }));
        });
    });
});

app.post("/modify/:board_no", function(req, res) {
    const { board_title, board_content, board_password } = req.body;
    client.query(BoardQuery.board_Modify(board_title, board_content, board_password, req.params.board_no), function(err) {
        err? console.log(err) : res.redirect("/");
    });
});

// Delete
app.get('/remove/:board_no', function (req, res) {
    fs.readFile(pageHTML.Delete, "utf-8", function (err, data) {
        client.query(BoardQuery.board_Read(req.params.board_no), function (error, result) {
            res.send(ejs.render(data, {
                result: result[0]
            }));
        });
    });
});

app.post('/remove/:board_no', function (req, res) {
    client.query(BoardQuery.board_Delete(req.params.board_no), function(err) {        
        // 삼항연산자 활용
        err ? console.log(err) : (()=> {
            res.writeHead(200, {'Content-Type': 'text/html; charset=utf-8'});
            res.write("<script>alert('삭제 완료되었습니다.')</script>");
            res.write("<script>location.href = '/'</script>");
        })();
    });
});