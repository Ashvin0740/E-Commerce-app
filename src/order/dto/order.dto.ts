export class CreateOrderDto {
  cartIds: number[]; // IDs of cart items to convert to order
}

export class OrderResponseDto {
  id: number;
  totalAmount: number;
  status: string;
  orderItems: {
    id: number;
    quantity: number;
    price: number;
    product: {
      id: number;
      name: string;
    };
  }[];
  createdAt: Date;
}
