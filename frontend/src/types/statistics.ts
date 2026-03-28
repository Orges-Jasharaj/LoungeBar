export interface StatisticsOverviewDto {
  totalUsers: number;
  totalTables: number;
  totalOrders: number;
  revenuePaid: number;
  averageOrderValuePaid: number;
  paymentsCount: number;
  reservationsCount: number;
  activeShifts: number;
}

export interface TopMenuItemDto {
  menuItemId: number;
  menuItemName: string;
  quantity: number;
}

