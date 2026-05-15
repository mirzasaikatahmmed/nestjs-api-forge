import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ForgeRawResponse } from 'nestjs-api-forge';

@ApiTags('health')
@Controller()
export class AppController {
  @Get('health')
  @ForgeRawResponse()
  @ApiOperation({ summary: 'Health check — returns raw JSON (no envelope)' })
  @ApiResponse({ status: 200, description: 'Service is up' })
  health() {
    return { status: 'ok', uptime: process.uptime() };
  }
}
