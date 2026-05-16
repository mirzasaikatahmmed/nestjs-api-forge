export interface ForgeHealthCheckResult {
  status: 'ok' | 'error';
  message?: string;
  details?: unknown;
}

export interface ForgeHealthCheck {
  name: string;
  check: () => Promise<ForgeHealthCheckResult> | ForgeHealthCheckResult;
}

export interface ForgeHealthOptions {
  /** Route path for the health endpoint. Default: 'health' */
  path?: string;
  /** Include process uptime (seconds) in the response. Default: true */
  includeUptime?: boolean;
  /** Include heap/rss memory stats in the response. Default: false */
  includeMemory?: boolean;
  /** Optional version string surfaced in the health response */
  version?: string;
  /** Custom named health checks (database, cache, etc.) */
  checks?: ForgeHealthCheck[];
}

export interface ForgeHealthMemory {
  rss: number;
  heapUsed: number;
  heapTotal: number;
  external: number;
}

export interface ForgeHealthData {
  status: 'ok' | 'degraded';
  uptime?: number;
  version?: string;
  memory?: ForgeHealthMemory;
  checks?: Record<string, ForgeHealthCheckResult>;
}
