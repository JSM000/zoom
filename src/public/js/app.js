const socket = io();

const welcome = document.getElementById("welcome");
const welcomeForm = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function addMessage(message) {
  const ul = room.querySelector("ul");
  const li = document.createElement("li");
  li.innerText = message;
  ul.appendChild(li);
}

function handleMessageSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#msg input");
  socket.emit("new_message", input.value, roomName, () => {
    console.log(input.value);
    addMessage(`You: ${input.value}`);
    input.value = "";
  });
}

function handleNicknameSubmit(e) {
  e.preventDefault();
  const input = room.querySelector("#name input");
  socket.emit("nickname", input.value);
}

function titleChange(roomName, count) {
  const h3 = room.querySelector("h3");
  h3.innerHTML = `Room ${roomName} (${count})`;
}

function showRoom(newCount) {
  welcome.hidden = true;
  room.hidden = false;
  titleChange(roomName, newCount);
  const msgForm = room.querySelector("#msg");
  const nameForm = room.querySelector("#name");
  msgForm.addEventListener("submit", handleMessageSubmit);
  nameForm.addEventListener("submit", handleNicknameSubmit);
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const input = welcomeForm.querySelector("input");
  // 단순히 메세지를 전달하는 것이 아니라 "room" 이라는 이벤트를 전달함.
  // 이벤트의 이름은 내가 마음대로 지정함.
  // 이벤트에 딸린 데이터를 오브젝트로 전달 가능! 알아서 변환해줌
  // 콜백을 넣으면 서버의 값을 받아서 프론트에서 실행됨! / 마지막으로 넣어줘야함 이유는 잘 모르겠음.
  // 원하는 모든것을 여러개 넣어 줄수 있음!
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

welcomeForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user, newCount) => {
  titleChange(roomName, newCount);
  addMessage(`${user} joined!`);
});

socket.on("bye", (user, newCount) => {
  titleChange(roomName, newCount);
  addMessage(`${user} left ㅠㅠ`);
});

socket.on("new_message", addMessage);

socket.on("room_change", (rooms) => {
  const roomList = welcome.querySelector("ul");
  roomList.innerHTML = "";
  if (rooms.length === 0) {
    return;
  }
  rooms.forEach((room) => {
    const li = document.createElement("li");
    li.innerHTML = room;
    roomList.appendChild(li);
  });
});
