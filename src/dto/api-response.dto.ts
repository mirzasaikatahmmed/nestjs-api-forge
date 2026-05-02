import {
  ApiErrorPayload,
  ApiMeta,
  ApiSuccessResponse,
  ApiErrorResponse,
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

  static noContent(
    message = 'No content',
    meta: Partial<ApiMeta> = {},
  ): ApiSuccessResponse<null> {
    return ApiResponseDto.success(null, message, 204, meta);
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
