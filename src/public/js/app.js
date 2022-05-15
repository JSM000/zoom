const socket = io();

const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

room.hidden = true;

let roomName;

function showRoom() {
  welcome.hidden = true;
  room.hidden = false;
  const h3 = room.querySelector("h3");
  h3.innerHTML = `Room ${roomName}`;
}

function handleRoomSubmit(e) {
  e.preventDefault();
  const input = form.querySelector("input");
  // 단순히 메세지를 전달하는 것이 아니라 "room" 이라는 이벤트를 전달함.
  // 이벤트의 이름은 내가 마음대로 지정함.
  // 이벤트에 딸린 데이터를 오브젝트로 전달 가능! 알아서 변환해줌
  // 콜백을 넣으면 서버의 값을 받아서 프론트에서 실행됨! / 마지막으로 넣어줘야함 이유는 잘 모르겠음.
  // 원하는 모든것을 여러개 넣어 줄수 있음!
  socket.emit("enter_room", input.value, showRoom);
  roomName = input.value;
  input.value = "";
}

form.addEventListener("submit", handleRoomSubmit);
