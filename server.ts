// server.ts
import fs from "node:fs";
import path from "node:path";
import http from "node:http";
import type { IncomingMessage } from "node:http";
import next from "next";
import { WebSocketServer, type WebSocket } from "ws";
import dotenv from "dotenv";

const ORDER_SOCKET_PATH = "/ws/admin-orders";

function loadEnv() {
  const cwd = process.cwd();
  const env = process.env.NODE_ENV || "development";

  const files = [".env", ".env.local", `.env.${env}`, `.env.${env}.local`];

  for (const name of files) {
    const fullPath = path.join(cwd, name);
    if (fs.existsSync(fullPath)) {
      dotenv.config({
        path: fullPath,
        override: false,
      });
    }
  }
}

loadEnv();

const dev = (process.env.NODE_ENV || "development") !== "production";
const hostname = process.env.HOST || "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev });
const handle = app.getRequestHandler();

declare global {
  var __orderSocketClients: Set<WebSocket> | undefined;
}

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
    });

    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port} (dev=${dev})`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
