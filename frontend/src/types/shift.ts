export type ShiftType = 'Morning' | 'Evening' | 'Night' | 1 | 2 | 3;

export interface ShiftDto {
  id: number;
  userId: string;
  userName?: string;
  shiftType: ShiftType | number;
  startTime?: string;
  endTime?: string;
  isActive: boolean;
  notes?: string;
  createdBy?: string;
  createdAt?: string;
  updatedBy?: string;
  updatedAt?: string;
  totalOrders?: number;
  totalAmount?: number;
}

export interface CreateShiftDto {
  userId: string;
  shiftType: ShiftType;
  notes?: string;
}


