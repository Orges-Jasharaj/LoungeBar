export interface ResponseDto<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

