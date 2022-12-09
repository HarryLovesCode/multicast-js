import { Server } from "../src/server";
import { io } from "socket.io-client";

const server = new Server({
  address: "232.1.1.1",
  port: 4123,
});

server.discover();
server.broadcast();

let foundConnection = false;

function poll() {
  if (!foundConnection) server.broadcast();

  if (server.seen.length > 0) {
    const lastSeen = server.seen[server.seen.length - 1];
    const socket = io(`http://${lastSeen.address}:${lastSeen.payload.wsport}`);

    socket.on("EstablishedConnection", (message) => {
      console.log(message);
      foundConnection = true;
    });
  }

  setTimeout(poll, 1000);
}

poll();
