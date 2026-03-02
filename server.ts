// server.ts
import dotenv from "dotenv";
dotenv.config();
import http from "node:http";
import next from "next";
import type { IncomingMessage } from "node:http";
import { WebSocketServer, type WebSocket } from "ws";

const ORDER_SOCKET_PATH = "/ws/admin-orders";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

global.__orderSocketClients =
  global.__orderSocketClients ?? new Set<WebSocket>();

app
  .prepare()
  .then(() => {
    const httpServer = http.createServer((req, res) => {
      handle(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on("upgrade", (request: IncomingMessage, socket, head) => {
      try {
        // request.url can be "/ws/admin-orders?token=..."
        const url = request.url || "";
        const pathname = url.split("?")[0];

        if (pathname !== ORDER_SOCKET_PATH) {
          socket.destroy();
          return;
        }

        wss.handleUpgrade(request, socket, head, (ws) => {
          global.__orderSocketClients!.add(ws);

          ws.on("close", () => {
            global.__orderSocketClients!.delete(ws);
          });

          ws.on("error", () => {
            global.__orderSocketClients!.delete(ws);
          });
        });
      } catch {
        socket.destroy();
      }
    });

    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log(`> WS on ws://${hostname}:${port}${ORDER_SOCKET_PATH}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
