import axios from 'axios';
import type { LoginDto, CreateUserDto, LoginResponseDto } from '../types/auth';
import type { TableDto } from '../types/table';
import type { CreateOrderRequestDto, OrderResponseDto } from '../types/order';
import type { DrinkDto } from '../types/drink';
import type { ResponseDto, PagedResponseDto } from '../types/response';
import type { UserDto, UpdateUserDto } from '../types/user';

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
};

export const drinkApi = {
  getAllDrinks: async (): Promise<ResponseDto<DrinkDto[]>> => {
    const response = await api.get<ResponseDto<DrinkDto[]>>('/drink');
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

export default api;

