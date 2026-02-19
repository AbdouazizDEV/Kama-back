export class ApiResponse<T = unknown> {
  static success<T>(data: T, message = 'Success'): ApiSuccessResponse<T> {
    return {
      success: true,
      data,
      message,
    };
  }

  static error(error: ApiErrorDetails): ApiErrorResponse {
    return {
      success: false,
      error,
    };
  }

  static paginated<T>(
    data: T[],
    pagination: PaginationMeta
  ): ApiPaginatedResponse<T> {
    return {
      success: true,
      data,
      pagination,
    };
  }
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: ApiErrorDetails;
}

export interface ApiErrorDetails {
  code: string;
  message: string;
  details?: unknown;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
