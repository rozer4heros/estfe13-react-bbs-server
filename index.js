const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");

const json = require("body-parser/json");
const urlencoded = require("body-parser/urlencoded");

const app = express();
const port = 3000;

app.use(express.json()); // json -> object
app.use(express.urlencoded()); // html form -> object

const corsOptions = {
  origin: "*",
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mynameisytg4$",
  database: "bbs",
});

db.connect();

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// "/"(루트)로 요청이 get으로 들어오면 res.send()의 인자를 반환

app.get("/list", (req, res) => {
  const sqlQuery = "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.post("/write", (req, res) => {
  const { title, content, name } = req.body;
  /* 보안에 취약함! */
  // const sqlQuery = `insert into board (title, content, writer) values(${title},${content},${name});`;
  const sqlQuery = "insert into board (title, content, writer) values(?,?,?);";
  db.query(sqlQuery, [title, content, name], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
  console.log(req.body);
});

app.listen(port, () => {
  console.log(`react-bbs-server listening on port ${port}`);
});
