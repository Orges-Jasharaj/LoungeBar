export interface PaymentDto {
  id: number;
  orderId: number;
  amount: number;
  method: string;
  status?: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}


