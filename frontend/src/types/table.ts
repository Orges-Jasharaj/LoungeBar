export interface TableDto {
  id: number;
  number: number;
  capacity: number;
  totalOrders: number;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}

