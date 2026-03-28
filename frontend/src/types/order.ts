export interface CreateOrderItemRequestDto {
  menuItemId: number;
  quantity: number;
}

export interface CreateOrderRequestDto {
  tableNumber: number;
  items: CreateOrderItemRequestDto[];
}

export interface OrderItemResponseDto {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface OrderResponseDto {
  orderId: number;
  orderDate: string;
  updatedAt?: string;
  status: string;
  totalAmount: number;
  tableId: number;
  tableNumber: number;
  userId?: string;
  userName?: string;
  items: OrderItemResponseDto[];
}

export type OrderStatus = 'Pending' | 'Preparing' | 'Served' | 'Canceled' | 'Paid';

export interface WaiterDailySalesDto {
  waiterId: string;
  waiterName: string;
  waiterEmail: string;
  totalSales: number;
  totalOrders: number;
  activeShiftId: number;
  shiftStartTime?: string;
  shiftEndTime?: string;
}

