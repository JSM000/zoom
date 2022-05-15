import http from "http";
import WebSocket from "ws";
import express from "express";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");
// app.listen(3000, handleListen);

//http 서버를 만들고 저장해서 접근할수 있게 함. http 서버와 웹소켓 서버를 둘다 만드는 법
const server = http.createServer(app);
// server를 넣어주지 않으면 그냥 웹소켓 서버만 만들어짐. http서버에 웹소켓 서버를 올리는것?
const wss = new WebSocket.Server({ server });

// fake database
const sockets = [];

wss.on("connection", (socket) => {
  sockets.push(socket);
  socket["nickname"] = "Anon";
  console.log("Connected to Browser ✔");
  // 사용자가 브라우져를 끄면 발생
  socket.on("close", () => console.log("Disconnected from Browser ❌"));
  socket.on("message", (msg) => {
    const message = JSON.parse(msg);
    switch (message.type) {
      case "new_message":
        sockets.forEach((socket) => {
          socket.send(`${socket.nickname}: ${message.payload.toString()}`);
        });
        break;
      case "nickname":
        socket["nickname"] = message.payload;
    }
  });
});

server.listen(3000, handleListen);
