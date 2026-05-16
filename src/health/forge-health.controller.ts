import { Controller, Get } from '@nestjs/common';
import { ApiResponseDto } from '../dto';
import { ForgeRawResponse } from '../decorators';
import { ServiceUnavailableException } from '../exceptions';
import { ForgeHealthService } from './forge-health.service';

@Controller()
export class ForgeHealthController {
  constructor(protected readonly healthService: ForgeHealthService) {}

  @Get()
  @ForgeRawResponse()
  async health() {
    const { data, ok } = await this.healthService.check();

    if (!ok) {
      throw new ServiceUnavailableException('Service health checks failed');
    }

    return ApiResponseDto.success(data, 'Service is healthy');
  }
}
