export interface ReservationDto {
  id: number;
  tableNumber: number;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  reservationDate: string; // Backend sends ReservationDate
  reservationTime: string; // Backend sends ReservationTime as TimeSpan (e.g., "14:30:00")
  numberOfGuests: number;
  status: string;
  notes?: string;
  createdBy?: string;
  createdAt: string;
  updatedBy?: string;
  updatedAt?: string;
}


