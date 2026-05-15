import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  ForgeMessage,
  ForgeRawResponse,
  ApiResponseDto,
} from 'nestjs-api-forge';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ForgeRawResponse()
  @ApiOperation({ summary: 'List all users (paginated)' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiResponse({ status: 200, description: 'Paginated list of users wrapped by ApiResponseDto.paginated()' })
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ) {
    const p = parseInt(page, 10);
    const l = parseInt(limit, 10);
    const { data, total } = this.usersService.findAll(p, l);
    return ApiResponseDto.paginated(data, total, p, l, 'Users fetched successfully');
  }

  @Get(':id')
  @ForgeMessage('User fetched successfully')
  @ApiOperation({ summary: 'Get a user by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'User object wrapped in standard success envelope' })
  @ApiResponse({ status: 404, description: 'User not found — forge NotFoundException' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ForgeMessage('User created successfully')
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'Created user wrapped in standard envelope' })
  @ApiResponse({ status: 400, description: 'Validation error — ValidationPipe with field details' })
  @ApiResponse({ status: 409, description: 'Email already registered — forge ConflictException' })
  create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @ForgeMessage('User updated successfully')
  @ApiOperation({ summary: 'Update a user' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'Updated user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Email already taken' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'User deleted' })
  @ApiResponse({ status: 404, description: 'User not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    this.usersService.remove(id);
  }
}
