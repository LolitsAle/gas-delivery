// dto/create-order.dto.ts
export interface CreateOrderRequest {
  userId: string;

  stove: {
    stoveId?: string;
    address?: string;
    note?: string;
  };

  items: {
    productId: string;
    quantity: number;
  }[];

  note?: string;
}
