import { Server } from "../src/server";
import { Server as SocketServer } from "socket.io";

const ADDRESS = "232.1.1.1";
const PORT_DISCOVERY = 4123;
const PORT_SOCKET = 3000;

const server = new Server({
  address: ADDRESS,
  port: PORT_DISCOVERY,
});

const io = new SocketServer(PORT_SOCKET);

server.discover();

function poll() {
  server.broadcast({
    wsport: PORT_SOCKET,
  });

  setTimeout(poll, 1000);
}

io.on("connection", (socket) => {
  console.log("Connected to client.");
  socket.emit(
    "EstablishedConnection",
    `Connected to server: ${ADDRESS}:${PORT_SOCKET}`
  );
});

poll();