export interface TableDto {
  id: number;
  number: number;
  capacity: number;
  totalOrders: number;
  qrCodeImage?: string; // Base64 string për QR code image
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

export interface TableOrderSummaryDto {
  status: string;
  totalAmount: number;
  tableNumber: number;
  items: OrderItemSummaryDto[];
}

export interface OrderItemSummaryDto {
  drinkId: number;
  drinkName: string;
  quantity: number;
  unitPrice: number;
  total?: number;
}
