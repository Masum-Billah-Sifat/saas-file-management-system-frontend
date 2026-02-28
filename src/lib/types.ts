export type Role = "ADMIN" | "USER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  isEmailVerified: boolean;
};

export type ApiSuccess<T> = {
  success: true;
  message?: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  details?: any;
};