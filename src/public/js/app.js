const messageList = document.querySelector("ul");
const messageForm = document.querySelector("#message");
const nickForm = document.querySelector("#nick");
const socket = new WebSocket(`ws://${window.location.host}`);
let nickname = "";

function makeMessage(type, payload) {
  const msg = { type, payload };
  return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
  console.log("Connected to Server ✅");
});

socket.addEventListener("message", (message) => {
  const newData = JSON.parse(message.data);
  switch (newData.type) {
    case "new_message":
      const li = document.createElement("li");
      li.innerText = `${nickname} : ${newData.payload}`;
      messageList.append(li);
      break;
    case "nickname":
      nickname = newData.payload;
      break;
    default:
      console.log("일치하는 데이터가 없습니다.");
  }
});

//서버가 꺼지면 발생
socket.addEventListener("close", () => {
  console.log("Disconnected from Server ❌");
});

const handleSubmit = (e) => {
  e.preventDefault();
  const input = messageForm.querySelector("input");
  socket.send(makeMessage("new_message", input.value));
  input.value = "";
};

const handleNickSubmit = (e) => {
  e.preventDefault();
  const input = nickForm.querySelector("input");
  socket.send(makeMessage("nickname", input.value));
};

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit);
