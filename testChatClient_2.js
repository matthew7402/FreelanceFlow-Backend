// testChatClient.js
import { io } from "socket.io-client";

// Connect to your backend Socket.IO server
const socket = io("http://localhost:5000");

const projectId = 2; // use a project that exists in DB
const senderId = 2;  // use a user that belongs to that project

// On connect
socket.on("connect", () => {
  console.log("Connected with socket ID:", socket.id);

  // Join the project room
  socket.emit("joinProject", projectId);

  // Send a test message after joining
  socket.emit("sendMessage", {
    projectId,
    senderId, 
    content: "Hello! This is a test message from Node client number 2."
  });
});

// Listen for new messages in the room
socket.on("newMessage", (message) => {
  console.log("New message received:", message);
});

// Listen for errors
socket.on("errorMessage", (err) => {
  console.error("Error: ", err);
});
