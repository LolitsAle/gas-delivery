type OrderRealtimeClient = {
  readyState: number;
  send: (data: string) => void;
  close: () => void;
};

declare global {
  var __orderSocketClients: Set<OrderRealtimeClient> | undefined;
}

export {};
