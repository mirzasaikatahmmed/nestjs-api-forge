import {
  ApiErrorPayload,
  ApiMeta,
  ApiSuccessResponse,
  ApiErrorResponse,
  ApiPaginatedResponse,
  PaginationMeta,
} from '../interfaces/api-response.interface';

export class ApiResponseDto {
  static success<T>(
    data: T,
    message = 'Request successful',
    statusCode = 200,
    meta: Partial<ApiMeta> = {},
  ): ApiSuccessResponse<T> {
    return {
      success: true,
      statusCode,
      message,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  static created<T>(
    data: T,
    message = 'Resource created successfully',
    meta: Partial<ApiMeta> = {},
  ): ApiSuccessResponse<T> {
    return ApiResponseDto.success(data, message, 201, meta);
  }

  static accepted<T>(
    data: T,
    message = 'Request accepted for processing',
    meta: Partial<ApiMeta> = {},
  ): ApiSuccessResponse<T> {
    return ApiResponseDto.success(data, message, 202, meta);
  }

  static noContent(
    message = 'No content',
    meta: Partial<ApiMeta> = {},
  ): ApiSuccessResponse<null> {
    return ApiResponseDto.success(null, message, 204, meta);
  }

  static paginated<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    message = 'Data fetched successfully',
    meta: Partial<ApiMeta> = {},
  ): ApiPaginatedResponse<T> {
    const totalPages = Math.ceil(total / limit);
    const pagination: PaginationMeta = {
      total,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    };

    return {
      success: true,
      statusCode: 200,
      message,
      data,
      pagination,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }

  static error(
    message: string,
    statusCode: number,
    error: ApiErrorPayload,
    meta: Partial<ApiMeta> = {},
  ): ApiErrorResponse {
    return {
      success: false,
      statusCode,
      message,
      error,
      meta: {
        timestamp: new Date().toISOString(),
        ...meta,
      },
    };
  }
}
