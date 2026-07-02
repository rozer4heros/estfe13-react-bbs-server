const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});
// "/"(루트)로 요청이 get으로 들어오면 res.send()의 인자를 반환

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
