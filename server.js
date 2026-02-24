const { createServer } = require("http");
const next = require("next");
const { WebSocketServer } = require("ws");

const ORDER_SOCKET_PATH = "/ws/admin-orders";

const dev = process.env.NODE_ENV !== "production";
const hostname = "0.0.0.0";
const port = Number(process.env.PORT || 3000);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

global.__orderSocketClients = global.__orderSocketClients || new Set();

app
  .prepare()
  .then(() => {
    const httpServer = createServer((req, res) => {
      handle(req, res);
    });

    const wss = new WebSocketServer({ noServer: true });

    httpServer.on("upgrade", (request, socket, head) => {
      if (request.url !== ORDER_SOCKET_PATH) {
        socket.destroy();
        return;
      }

      wss.handleUpgrade(request, socket, head, (ws) => {
        global.__orderSocketClients.add(ws);

        ws.on("close", () => {
          global.__orderSocketClients.delete(ws);
        });
      });
    });

    httpServer.listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start server", error);
    process.exit(1);
  });
