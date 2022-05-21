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

wsServer.on("connection", (socket) => {
  socket.on("join_room", (roomName) => {
    socket.join(roomName);
    socket.to(roomName).emit("welcome");
  });
  socket.on("offer", (offer, roomName) => {
    socket.to(roomName).emit("offer", offer);
  });
  socket.on("answer", (answer, roomName) => {
    socket.to(roomName).emit("answer", answer);
  });
  socket.on("ice", (ice, roomName) => {
    socket.to(roomName).emit("ice", ice);
  });
});

httpServer.listen(3000, handleListen);
