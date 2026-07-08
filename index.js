const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const mysql = require("mysql2");

const json = require("body-parser/json");
const urlencoded = require("body-parser/urlencoded");
const multer = require("multer");

const app = express();
// 외부에서 주입된 환경변수가 있다면 사용, 없으면 기본값 3000
const port = process.env.PORT || 3000;

app.use(express.json()); // json -> object
app.use(express.urlencoded()); // html form -> object

// "/uploads"로 접속 시 절대경로 "uploads"폴더에 접근 권한 부여
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const corsOptions = {
  origin: "*", // 와일드카드 *, 모든 도메인에서의 접근 허용
};

app.use(cors(corsOptions));

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "uploads"));
  },
  filename: function (req, file, cb) {
    const originalExt = file.originalname.split(".")[1];
    const uniquePrefix = Date.now() + "-" + Math.round(Math.random() * 1000);
    cb(null, uniquePrefix + "-" + file.fieldname + "." + originalExt);
  },
});
const upload = multer({ storage: storage });
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mynameisytg4$",
  database: "bbs",
});

db.connect();

function deleteUploadedFile(filePath) {
  if (!filePath) return;

  const absolutePath = path.resolve(filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }
}

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

  const sqlQuery =
    "SELECT id, title, content, writer, image_path, DATE_FORMAT(date, '%Y-%m-%d') AS date FROM board WHERE id=?";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 작성
app.post("/write", upload.single("image"), (req, res) => {
  console.log(`Write request: `, req.body);
  const { title, content, writer } = req.body;
  const imagePath = req.file ? req.file.path : null;

  const sqlQuery = "INSERT INTO board (title, content, writer, image_path) values(?,?,?,?);";
  db.query(sqlQuery, [title, content, writer, imagePath], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 수정
app.post("/update", upload.single("image"), (req, res) => {
  console.log(`Update request: `, req.body);
  const { title, content, writer, id, remove_image } = req.body;
  const imagePath = req.file ? req.file.path : null;

  let sqlQuery;
  let params;

  if (remove_image && !imagePath) {
    // 글 번호 삭제할 이미지의 경로 파악
    db.query("SELECT image_path FROM board WHERE id=?;", [id], (err, result) => {
      if (err) throw err;
      const existingImagePath = result[0] ? result[0].image_path : null;
      deleteUploadedFile(existingImagePath);
    });

    sqlQuery = "UPDATE board SET title=?, content=?, writer=?, image_path=NULL WHERE id=?";
    params = [title, content, writer, id];
  } else if (imagePath) {
    sqlQuery = "UPDATE board SET title=?, content=?, writer=?, image_path=? WHERE id=?";
    params = [title, content, writer, imagePath, id];
  } else {
    sqlQuery = "UPDATE board SET title=?, content=?, writer=? WHERE id=?";
    params = [title, content, writer, id];
  }

  db.query(sqlQuery, params, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 게시물 삭제
app.post("/delete", (req, res) => {
  console.log(`Delete request: `, req.body);
  const { id } = req.body;

  // 글 번호 삭제할 이미지의 경로 파악
  db.query("SELECT image_path FROM board WHERE id=?;", [id], (err, result) => {
    if (err) throw err;
    const existingImagePath = result[0] ? result[0].image_path : null;
    deleteUploadedFile(existingImagePath);
  });

  const sqlQuery = "DELETE FROM board WHERE id=?;";
  db.query(sqlQuery, [id], (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// 선택된 게시물 일괄 삭제
app.post("/deleteselect", (req, res) => {
  console.log(`Delete Selected request`, req.body);
  const { boardIdList } = req.body;

  // 글 번호 삭제할 이미지의 경로 파악
  db.query(`SELECT image_path FROM board WHERE id in (${boardIdList});`, (err, result) => {
    if (err) throw err;
    if (result && result.length > 0) {
      result.forEach((item) => {
        deleteUploadedFile(item.image_path);
      });
    }
  });

  const sqlQuery = `DELETE FROM board WHERE id IN (${boardIdList})`;
  db.query(sqlQuery, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

app.listen(port, () => {
  console.log(`react-bbs-server listening on port ${port}`);
});
