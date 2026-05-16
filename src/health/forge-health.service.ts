import { Inject, Injectable } from '@nestjs/common';
import {
  ForgeHealthData,
  ForgeHealthOptions,
} from './forge-health.interfaces';

export const FORGE_HEALTH_OPTIONS = 'FORGE_HEALTH_OPTIONS';

@Injectable()
export class ForgeHealthService {
  constructor(
    @Inject(FORGE_HEALTH_OPTIONS) private readonly options: ForgeHealthOptions,
  ) {}

  async check(): Promise<{ data: ForgeHealthData; ok: boolean }> {
    const data: ForgeHealthData = { status: 'ok' };

    if (this.options.includeUptime !== false) {
      data.uptime = Math.round(process.uptime() * 1000) / 1000;
    }

    if (this.options.version) {
      data.version = this.options.version;
    }

    if (this.options.includeMemory) {
      const mem = process.memoryUsage();
      data.memory = {
        rss: mem.rss,
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external,
      };
    }

    let ok = true;

    if (this.options.checks?.length) {
      data.checks = {};
      for (const check of this.options.checks) {
        try {
          const result = await check.check();
          data.checks[check.name] = result;
          if (result.status === 'error') ok = false;
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Check failed';
          data.checks[check.name] = { status: 'error', message };
          ok = false;
        }
      }
      if (!ok) data.status = 'degraded';
    }

    return { data, ok };
  }
}
