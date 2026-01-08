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

export interface TopDrinkDto {
  drinkId: number;
  drinkName: string;
  quantity: number;
}

