import dgram from "dgram";
import { v4 as uuid } from "uuid";

export interface ServerInfo {
  port: number;
  address: string;
  uuid?: string;
}

export interface Broadcast {
  type: string;
  info: ServerInfo;
}

export class Server {
  private _socket?: dgram.Socket;
  private _seen = new Set<string>();

  constructor(private _options: ServerInfo) {
    this._options.uuid = uuid();
    this._socket = dgram.createSocket({
      type: "udp4",
      reuseAddr: true,
    });

    this._socket.on("listening", () =>
      this._socket?.addMembership(this._options.address)
    );

    this._socket.bind(this._options.port);

    this._socket.on("error", (err) => {
      console.log(`server error:\n${err.stack}`);
      this._socket?.close();
    });
  }

  private _conditionalJsonParse<T>(str: string): T | undefined {
    try {
      return JSON.parse(str) as T;
    } catch (e) {
      return undefined;
    }
  }

  /**
   * Start listening for UDP messages.
   */
  public discover() {
    if (!this._socket) throw new Error("Server is not listening.");

    this._socket.on("message", (msg, rinfo) => {
      const parsed = this._conditionalJsonParse<Broadcast>(msg.toString());

      if (parsed?.info.uuid === this._options.uuid) return;

      this._seen.add(
        JSON.stringify({
          address: rinfo.address,
          port: rinfo.port,
          uuid: parsed?.info.uuid,
        })
      );
    });
  }

  /**
   * Broadcast a UDP message.
   */
  public broadcast() {
    if (!this._socket) throw new Error("Server is not listening.");

    this._socket.send(
      Buffer.from(
        JSON.stringify({
          type: "discover",
          info: this._options,
        })
      ),
      this._options.port,
      this._options.address
    );
  }

  public close() {
    this._socket?.close();
    this._socket = undefined;
  }

  /**
   * Get the list of servers that have been seen.
   */
  public get seen() {
    return Array.from(this._seen).map((s) => JSON.parse(s) as ServerInfo);
  }
}
