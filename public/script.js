const socket = io("/");
const videoGrid = document.getElementById("video-grid");
console.log(Peer, "perr");
const myPeer = new Peer(undefined, {
  host: "/",
  port: "3001"
});
let ss;
const myVideo = document.createElement("video");
myVideo.muted = true;
const peers = {};
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true
  })
  .then(stream => {
    addVideoStream(myVideo, stream);
    ss = stream;
    myPeer.on("call", call => {
      call.answer(stream);
      const video = document.createElement("video");
      call.on("stream", userVideoStream => {
        addVideoStream(video, userVideoStream);
      });
    });

    // 1 新用户进来
    socket.on("user-connected", userId => {
      connectToNewUser(userId, stream);
    });
  });

socket.on("user-disconnected", userId => {
  if (peers[userId]) peers[userId].close();
});

myPeer.on("open", id => {
  console.log("sasfsf open");
  socket.emit("join-room", ROOM_ID, id);
});

function connectToNewUser(userId, stream) {
  console.log("ssslsl new ");
  // 把自己的stream传入到新进来的
  const call = myPeer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", userVideoStream => {
    addVideoStream(video, userVideoStream);
  });
  call.on("close", () => {
    video.remove();
  });

  peers[userId] = call;
}

function addVideoStream(video, stream) {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
}

const button = document.getElementById("button");

button.addEventListener(
  "click",
  () => {
    const video = document.querySelector("video");
    console.log(button.innerText);
    if (button.textContent == "关闭") {
      button.textContent = "打开";
      video.srcObject = null;
    } else {
      button.textContent = "关闭";
      video.srcObject = ss;
    }
  },
  false
);
