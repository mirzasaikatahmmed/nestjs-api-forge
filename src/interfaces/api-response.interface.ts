export interface ApiMeta {
  timestamp: string;
  path?: string;
  version?: string;
  requestId?: string;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  meta: ApiMeta;
}

export interface ApiErrorDetail {
  field?: string;
  message: string;
  value?: unknown;
}

export interface ApiErrorPayload {
  code: string;
  details?: ApiErrorDetail[];
}

export interface ApiErrorResponse {
  success: false;
  statusCode: number;
  message: string;
  error: ApiErrorPayload;
  meta: ApiMeta;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface ForgeOptions {
  /** Include the request path in every response meta. Default: true */
  includePath?: boolean;
  /** Include the timestamp in every response meta. Default: true */
  includeTimestamp?: boolean;
  /** Default API version string added to meta */
  version?: string;
  /** Custom success message when none is provided */
  defaultSuccessMessage?: string;
}
