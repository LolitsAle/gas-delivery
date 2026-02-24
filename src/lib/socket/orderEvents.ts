export const ORDER_SOCKET_PATH = "/ws/admin-orders";

export type OrderSocketPayload = {
  type: "ORDER_CREATED" | "ORDER_UPDATED";
  orderId: string;
};

export const emitOrderSocketEvent = (payload: OrderSocketPayload) => {
  const clients = globalThis.__orderSocketClients;

  if (!clients || clients.size === 0) return;

  const message = JSON.stringify(payload);

  clients.forEach((client) => {
    if (client.readyState === 1) {
      client.send(message);
    }
  });
};
