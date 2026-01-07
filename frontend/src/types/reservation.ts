export interface ReservationDto {
  id: number;
  tableNumber: number;
  customerName: string;
  customerPhone?: string;
  date: string;
  time?: string;
  status: string;
  createdBy: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}


