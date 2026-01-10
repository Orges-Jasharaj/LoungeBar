import axios from 'axios';
import type { LoginDto, CreateUserDto, LoginResponseDto } from '../types/auth';
import type { TableDto, TableOrderSummaryDto } from '../types/table';
import type { CreateOrderRequestDto, OrderResponseDto, WaiterDailySalesDto } from '../types/order';
import type { DrinkDto } from '../types/drink';
import type { ResponseDto, PagedResponseDto } from '../types/response';
import type { UserDto, UpdateUserDto } from '../types/user';
import type { ShiftDto, CreateShiftDto } from '../types/shift';
import type { PaymentDto } from '../types/payment';
import type { ReservationDto } from '../types/reservation';

const API_BASE_URL = 'http://localhost:5067/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor për të shtuar token në çdo request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor për të trajtuar gabimet
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token i skaduar ose i pavlefshëm
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: async (loginData: LoginDto): Promise<LoginResponseDto> => {
    const response = await api.post<ResponseDto<LoginResponseDto>>('/auth/login', loginData);
    // Response-i është ResponseDto<LoginResponseDto>, prandaj duhet të marrim response.data.data
    if (response.data.success && response.data.data) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Login failed');
  },

  register: async (registerData: CreateUserDto): Promise<any> => {
    const response = await api.post('/auth/register', registerData);
    return response.data;
  },
};

export const tableApi = {
  getAllTables: async (): Promise<ResponseDto<TableDto[]>> => {
    const response = await api.get<ResponseDto<TableDto[]>>('/table');
    return response.data;
  },

  getTableById: async (tableId: number): Promise<ResponseDto<TableDto>> => {
    const response = await api.get<ResponseDto<TableDto>>(`/table/${tableId}`);
    return response.data;
  },

  createTableSession: async (tableNumber: number): Promise<ResponseDto<string>> => {
    const response = await api.post<ResponseDto<string>>(`/table/session/${tableNumber}`);
    return response.data;
  },

  getTableActiveOrdersBySession: async (sessionGuid: string, tableNumber: number): Promise<ResponseDto<TableOrderSummaryDto[]>> => {
    const response = await api.get<ResponseDto<TableOrderSummaryDto[]>>(
      `/table/session/${sessionGuid}/table-${tableNumber}/active-orders`
    );
    return response.data;
  },

  getTableActiveOrdersBySessionGuid: async (sessionGuid: string): Promise<ResponseDto<TableOrderSummaryDto[]>> => {
    const response = await api.get<ResponseDto<TableOrderSummaryDto[]>>(
      `/table/session/${sessionGuid}/active-orders`
    );
    return response.data;
  },
};

export const orderApi = {
  createOrder: async (createOrderDto: CreateOrderRequestDto): Promise<ResponseDto<boolean>> => {
    const response = await api.post<ResponseDto<boolean>>('/order', createOrderDto);
    return response.data;
  },

  getAllOrders: async (): Promise<ResponseDto<OrderResponseDto[]>> => {
    const response = await api.get<ResponseDto<OrderResponseDto[]>>('/order/GetAllOrders');
    return response.data;
  },

  getOrdersByTable: async (
    tableId: number,
    page: number = 1,
    pageSize: number = 10
  ): Promise<ResponseDto<PagedResponseDto<OrderResponseDto>>> => {
    const response = await api.get<ResponseDto<PagedResponseDto<OrderResponseDto>>>(
      `/order/table/${tableId}?page=${page}&pageSize=${pageSize}`
    );
    return response.data;
  },

  updateOrderStatus: async (orderId: number, status: string): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(`/order/${orderId}/status?status=${status}`);
    return response.data;
  },

  getTotalOrdersByShift: async (shiftId: number): Promise<ResponseDto<number>> => {
    const response = await api.get<ResponseDto<number>>(`/order/shift/${shiftId}/total`);
    return response.data;
  },

  getTotalOrdersByMyCurrentShift: async (): Promise<ResponseDto<number>> => {
    const response = await api.get<ResponseDto<number>>('/order/myshift/total');
    return response.data;
  },

  getOrders: async (
    page: number = 1,
    pageSize: number = 10,
    from?: string,
    to?: string,
    status?: string
  ): Promise<ResponseDto<PagedResponseDto<OrderResponseDto>>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (status) params.append('status', status);
    const response = await api.get<ResponseDto<PagedResponseDto<OrderResponseDto>>>(
      `/order?${params.toString()}`
    );
    return response.data;
  },

  getOrdersCount: async (
    from?: string,
    to?: string,
    status?: string
  ): Promise<ResponseDto<number>> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    if (status) params.append('status', status);
    const response = await api.get<ResponseDto<number>>(`/order/count?${params.toString()}`);
    return response.data;
  },

  getTotalOrdersByWaiterId: async (waiterId: string): Promise<ResponseDto<number>> => {
    const response = await api.get<ResponseDto<number>>(`/order/waiter/${waiterId}/total`);
    return response.data;
  },

  getOrdersByWaiterId: async (waiterId: string, shiftId?: number): Promise<ResponseDto<OrderResponseDto[]>> => {
    const params = new URLSearchParams();
    if (shiftId) params.append('shiftId', shiftId.toString());
    const response = await api.get<ResponseDto<OrderResponseDto[]>>(
      `/order/waiter/${waiterId}/orders${params.toString() ? '?' + params.toString() : ''}`
    );
    return response.data;
  },

  getAllWaitersDailySales: async (): Promise<ResponseDto<WaiterDailySalesDto[]>> => {
    const response = await api.get<ResponseDto<WaiterDailySalesDto[]>>('/order/waiters/daily-sales');
    return response.data;
  },
};

export const drinkApi = {
  getAllDrinks: async (): Promise<ResponseDto<DrinkDto[]>> => {
    const response = await api.get<ResponseDto<DrinkDto[]>>('/drink');
    return response.data;
  },
};

export const shiftApi = {
  getAllShifts: async (): Promise<ResponseDto<ShiftDto[]>> => {
    const response = await api.get<ResponseDto<ShiftDto[]>>('/shift/all');
    return response.data;
  },

  getShiftById: async (shiftId: number): Promise<ResponseDto<ShiftDto>> => {
    const response = await api.get<ResponseDto<ShiftDto>>(`/shift/${shiftId}`);
    return response.data;
  },

  getMyShift: async (): Promise<ResponseDto<ShiftDto>> => {
    const response = await api.get<ResponseDto<ShiftDto>>('/shift/myshift');
    return response.data;
  },

  start: async (): Promise<ResponseDto<ShiftDto>> => {
    const response = await api.post<ResponseDto<ShiftDto>>('/shift/start', {});
    return response.data;
  },

  stop: async (): Promise<ResponseDto<ShiftDto>> => {
    const response = await api.post<ResponseDto<ShiftDto>>('/shift/stop', {});
    return response.data;
  },

  createShift: async (createShiftDto: CreateShiftDto): Promise<ResponseDto<boolean>> => {
    const response = await api.post<ResponseDto<boolean>>('/shift/create', createShiftDto);
    return response.data;
  },

  updateShift: async (shiftId: number, updateShiftDto: CreateShiftDto): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(`/shift/update/${shiftId}`, updateShiftDto);
    return response.data;
  },

  deleteShift: async (shiftId: number): Promise<ResponseDto<boolean>> => {
    const response = await api.delete<ResponseDto<boolean>>(`/shift/delete/${shiftId}`);
    return response.data;
  },
};

export const paymentApi = {
  getAllPayments: async (): Promise<ResponseDto<PaymentDto[]>> => {
    const response = await api.get<ResponseDto<PaymentDto[]>>('/payment');
    return response.data;
  },

  getPaymentsByOrder: async (orderId: number): Promise<ResponseDto<PaymentDto[]>> => {
    const response = await api.get<ResponseDto<PaymentDto[]>>(`/payment/order/${orderId}`);
    return response.data;
  },

  getPaymentSummary: async (
    from?: string,
    to?: string
  ): Promise<ResponseDto<{ totalRevenue: number; paymentsCount: number }>> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get<ResponseDto<{ totalRevenue: number; paymentsCount: number }>>(
      `/payment/summary?${params.toString()}`
    );
    return response.data;
  },

  getPayments: async (
    page: number = 1,
    pageSize: number = 10,
    from?: string,
    to?: string
  ): Promise<ResponseDto<PagedResponseDto<PaymentDto>>> => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageSize', pageSize.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get<ResponseDto<PagedResponseDto<PaymentDto>>>(
      `/payment/paged?${params.toString()}`
    );
    return response.data;
  },
};

export const reservationApi = {
  getAllReservations: async (): Promise<ResponseDto<ReservationDto[]>> => {
    const response = await api.get<ResponseDto<ReservationDto[]>>('/reservation');
    return response.data;
  },

  getReservationById: async (reservationId: number): Promise<ResponseDto<ReservationDto>> => {
    const response = await api.get<ResponseDto<ReservationDto>>(`/reservation/${reservationId}`);
    return response.data;
  },

  updateReservationStatus: async (reservationId: number, status: string): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(`/reservation/${reservationId}/status?status=${status}`);
    return response.data;
  },

  updateReservation: async (reservationId: number, updateData: {
    tableNumber: number;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    reservationDate: string;
    reservationTime: string;
    numberOfGuests: number;
    notes?: string;
  }): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(`/reservation/${reservationId}`, updateData);
    return response.data;
  },

  deleteReservation: async (reservationId: number): Promise<ResponseDto<boolean>> => {
    const response = await api.delete<ResponseDto<boolean>>(`/reservation/${reservationId}`);
    return response.data;
  },
};

export const userApi = {
  getAllUsers: async (): Promise<ResponseDto<UserDto[]>> => {
    const response = await api.get<ResponseDto<UserDto[]>>('/user/users');
    return response.data;
  },

  getUserById: async (userId: string): Promise<ResponseDto<UserDto>> => {
    const response = await api.get<ResponseDto<UserDto>>(`/user/${userId}`);
    return response.data;
  },

  createUserWithRole: async (
    createUserDto: CreateUserDto,
    role: string
  ): Promise<ResponseDto<boolean>> => {
    const response = await api.post<ResponseDto<boolean>>(
      `/auth/registerUserWithRole?role=${role}`,
      createUserDto
    );
    return response.data;
  },

  updateUser: async (
    userId: string,
    updateUserDto: UpdateUserDto
  ): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(
      `/user/${userId}`,
      updateUserDto
    );
    return response.data;
  },

  updateUserRole: async (
    userId: string,
    role: string
  ): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(
      `/user/${userId}/role?role=${role}`
    );
    return response.data;
  },

  deleteUser: async (userId: string): Promise<ResponseDto<boolean>> => {
    const response = await api.delete<ResponseDto<boolean>>(`/user/${userId}`);
    return response.data;
  },

  reactivateUser: async (userId: string): Promise<ResponseDto<boolean>> => {
    const response = await api.put<ResponseDto<boolean>>(
      `/user/ReactivateUser/${userId}`
    );
    return response.data;
  },
};

export const statisticsApi = {
  getOverview: async (
    from?: string,
    to?: string
  ): Promise<ResponseDto<import('../types/statistics').StatisticsOverviewDto>> => {
    const params = new URLSearchParams();
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get<ResponseDto<import('../types/statistics').StatisticsOverviewDto>>(
      `/statistics/overview?${params.toString()}`
    );
    return response.data;
  },

  getTopDrinks: async (
    limit: number = 5,
    from?: string,
    to?: string
  ): Promise<ResponseDto<import('../types/statistics').TopDrinkDto[]>> => {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (from) params.append('from', from);
    if (to) params.append('to', to);
    const response = await api.get<ResponseDto<import('../types/statistics').TopDrinkDto[]>>(
      `/statistics/top-drinks?${params.toString()}`
    );
    return response.data;
  },
};

export default api;

