export interface CreateOrderItemRequestDto {
  drinkId: number;
  quantity: number;
}

export interface CreateOrderRequestDto {
  tableNumber: number;
  items: CreateOrderItemRequestDto[];
}

export interface OrderItemResponseDto {
  drinkId: number;
  drinkName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderResponseDto {
  orderId: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  tableId: number;
  tableNumber: number;
  userId?: string;
  userName?: string;
  items: OrderItemResponseDto[];
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Served' | 'Canceled' | 'Paid';

