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
  origin: "*", // 와일드카드 *, 모든 도메인에서의 접근 허용
};

app.use(cors(corsOptions));

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mynameisytg4$",
  database: "bbs",
});

db.connect();

// Test
app.get("/", (req, res) => {
  res.send("Hello World!");
  // "/"(루트)로 요청이 get으로 들어오면 res.send()의 인자를 반환
});

// 게시물 목록 (홈페이지)
app.get("/list", (req, res) => {
  const sqlQuery = "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board";
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 보기
app.get("/view", (req, res) => {
  console.log(`View request: ${req.query.id}`);
  const { id } = req.query;
  // const sqlQuery = `SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board WHERE id=${id}`;
  const sqlQuery = "SELECT id, title, content, writer, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board WHERE id=?";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 작성
app.post("/write", (req, res) => {
  console.log(`Write request: ${req.body}`);
  const { title, content, name } = req.body;
  /* 보안에 취약함! */
  // const sqlQuery = `INSERT INTO board (title, content, writer) values(${title},${content},${name});`;
  const sqlQuery = "INSERT INTO board (title, content, writer) values(?,?,?);";
  db.query(sqlQuery, [title, content, name], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 수정
app.post("/update", (req, res) => {
  console.log(`Update request: ${req.body}`);
  const { title, content, name, id } = req.body;
  const sqlQuery = "UPDATE board SET title=?, content=?, writer=? WHERE id=?;";
  db.query(sqlQuery, [title, content, name, id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`react-bbs-server listening on port ${port}`);
});
