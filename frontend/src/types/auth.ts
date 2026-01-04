export interface LoginDto {
  email: string;
  password: string;
}

export interface CreateUserDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  password: string;
}

export interface LoginResponseDto {
  displayName: string;
  email: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiryTime: string;
  roles: string[];
}

export interface User {
  displayName: string;
  email: string;
  roles: string[];
}

