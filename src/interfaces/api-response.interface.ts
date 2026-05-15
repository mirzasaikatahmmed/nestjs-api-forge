export interface ApiMeta {
  timestamp: string;
  path?: string;
  version?: string;
  requestId?: string;
  responseTime?: string;
  deprecated?: true;
  deprecationNotice?: string;
  [key: string]: unknown;
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

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface ApiPaginatedResponse<T = unknown> {
  success: true;
  statusCode: number;
  message: string;
  data: T[];
  pagination: PaginationMeta;
  meta: ApiMeta;
}

export interface ForgeOptions {
  /** Include the request path in every response meta. Default: true */
  includePath?: boolean;
  /** Include the timestamp in every response meta. Default: true */
  includeTimestamp?: boolean;
  /** Attach a UUID to every response meta as `requestId`. Default: false */
  includeRequestId?: boolean;
  /**
   * Header(s) to read a correlation / request ID from (e.g. 'x-request-id').
   * When present and the header exists on the request, its value is used as
   * `requestId` and echoed back in the same header on the response.
   * Falls back to a generated UUID when `includeRequestId` is also true.
   * Defaults to ['x-request-id', 'x-correlation-id'] when `includeRequestId` is true.
   */
  correlationIdHeader?: string | string[];
  /** Include handler duration in `meta.responseTime` (e.g. "12ms"). Default: false */
  includeResponseTime?: boolean;
  /** Default API version string added to meta */
  version?: string;
  /** Custom success message when none is provided */
  defaultSuccessMessage?: string;
}
