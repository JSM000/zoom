import http from "http";
import { Server } from "socket.io";
import express from "express";
import { instrument } from "@socket.io/admin-ui";
const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
app.use("/public", express.static(__dirname + "/public"));
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log("Listening on http://localhost:3000");
// app.listen(3000, handleListen);

const httpServer = http.createServer(app); //http 서버를 만들고 저장해서 접근할수 있게 함.
const wsServer = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true,
  },
}); //http 서버와 웹소켓 서버를 둘다 만드는 법 / admin-ui추가

instrument(wsServer, {
  auth: false,
});

function publicRooms() {
  const {
    sockets: {
      adapter: { sids, rooms },
    },
  } = wsServer;
  const publicRooms = [];
  rooms.forEach((_, key) => {
    if (sids.get(key) === undefined) {
      publicRooms.push(key);
    }
  });
  return publicRooms;
}

function countRoom(roomName) {
  return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

// https://socket.io/docs/v4/server-api/ 다양한 API들 문서
wsServer.on("connection", (socket) => {
  socket["nickname"] = "Anon";
  socket.onAny((event) => {
    console.log("Socket Event: ", event);
  }); // 모든 이벤트가 실행될 떄마다 호출되는 미들웨어!
  socket.on("enter_room", (roomName, done) => {
    socket.join(roomName); // 이름 지어준 방으로 소켓들을 연결시켜줌.
    console.log(socket.rooms); // 연결된 방들을 보여줌. 기본적으로 자신의 아이디로 이름 지어진 방에 연결되어있음.
    done(countRoom(roomName));
    socket.to(roomName).emit("welcome", socket.nickname, countRoom(roomName)); // 나를 제외한 방안의 모두에게 보내줌.
    wsServer.sockets.emit("room_change", publicRooms()); // 서버에 접속한 모든 브라우저에 보냄.
  });
  socket.on("disconnecting", () => {
    socket.rooms.forEach((room) =>
      socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
    );
  }); // 기본으로 내장된 이벤트, 브라우져는 이미 닫았지만 아직 연결이 끊어지지 않은 그 찰나에 발생하는 이벤트 (그래서 room 정보가 살아있음)
  socket.on("disconnect", () => {
    wsServer.sockets.emit("room_change", publicRooms());
  }); // 기본으로 내장된 이벤트, 브라우져 연결이 완전히 끝어지고 난 후 발생.
  socket.on("new_message", (message, roomName, done) => {
    socket.to(roomName).emit("new_message", `${socket.nickname}: ${message}`); // 똑같은 이름의 이벤트 정의해도 괜찮음.
    done();
  });
  socket.on("nickname", (nickname) => {
    socket["nickname"] = nickname;
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
