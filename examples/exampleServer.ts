import { Server } from "../src/server";

const server = new Server({
  address: "232.1.1.1",
  port: 4123,
});

server.discover();
server.broadcast();

function poll() {
  server.broadcast();
  setTimeout(poll, 1000);
  console.log(server.seen);
}

poll();
