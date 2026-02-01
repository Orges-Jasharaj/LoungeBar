export interface UserDto {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  email: string;
  isActive: boolean;
  roles: string[];
  createdAt: string;
}

export interface UpdateUserDto {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
}

