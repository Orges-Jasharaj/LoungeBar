export interface ResponseDto<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: Array<{
    errorCode?: string;
    errorMessage?: string;
  }>;
}

export interface PagedResponseDto<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

