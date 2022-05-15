import http from "http";
import { Server } from "socket.io";
import express from "express";
import { SocketAddress } from "net";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");
// app.listen(3000, handleListen);

//http 서버를 만들고 저장해서 접근할수 있게 함. http 서버와 웹소켓 서버를 둘다 만드는 법
const httpServer = http.createServer(app);
const wsServer = new Server(httpServer);

wsServer.on("connection", (socket) => {
  // 모든 이벤트가 실행될 떄마다 호출되는 미들웨어!
  socket.onAny((event) => {
    console.log("Socket Event: ", event);
  });
  socket.on("enter_room", (roomName, showRoom) => {
    socket.join(roomName); // 이름 지어준 방으로 소켓들을 연결시켜줌.
    showRoom();
    // console.log(socket.rooms); // 연결된 방들을 보여줌. 기본적으로 자신의 아이디로 이름 지어진 방에 연결되어있음.
    // https://socket.io/docs/v4/server-api/ 다양한 API들 문서
    // socket.leave("room1"), socket.to("room1").emit("hello")
  });
});

// server를 넣어주지 않으면 그냥 웹소켓 서버만 만들어짐. http서버에 웹소켓 서버를 올리는것?
//const wss = new WebSocket.Server({ server });

// const sockets = [];
// wss.on("connection", (socket) => {
//   sockets.push(socket);
//   socket["nickname"] = "Anon";
//   console.log("Connected to Browser ✔");
//   // 사용자가 브라우져를 끄면 발생
//   socket.on("close", () => console.log("Disconnected from Browser ❌"));
//   socket.on("message", (msg) => {
//     const message = JSON.parse(msg);
//     switch (message.type) {
//       case "new_message":
//         sockets.forEach((socket) => {
//           socket.send(`${socket.nickname}: ${message.payload.toString()}`);
//         });
//         break;
//       case "nickname":
//         socket["nickname"] = message.payload;
//     }
//   });
// });

httpServer.listen(3000, handleListen);
