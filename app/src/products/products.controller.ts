import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ApiForge, ForgeMessage } from 'nestjs-api-forge';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

@ApiTags('products')
@Controller('products')
@ApiForge({ version: '1.0.0' })
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ForgeMessage('Products fetched successfully')
  @ApiOperation({ summary: 'List all products' })
  @ApiResponse({ status: 200, description: 'Array of products in standard envelope' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @ForgeMessage('Product fetched successfully')
  @ApiOperation({ summary: 'Get a product by ID' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 200, description: 'Product in standard envelope' })
  @ApiResponse({ status: 404, description: 'Product not found — forge NotFoundException' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.productsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ForgeMessage('Product created successfully')
  @ApiOperation({ summary: 'Create a new product' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Created product in standard envelope' })
  @ApiResponse({ status: 400, description: 'Validation error — ValidationPipe field details' })
  create(@Body() dto: CreateProductDto) {
    return this.productsService.create(dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a product' })
  @ApiParam({ name: 'id', example: 1 })
  @ApiResponse({ status: 204, description: 'Product deleted' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id', ParseIntPipe) id: number) {
    this.productsService.remove(id);
  }
}
