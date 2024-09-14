import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { ProductoService } from './producto.service';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ProductoDto } from './producto.dto/producto.dto';
import { ProductoEntity } from './producto.entity';
import { plainToInstance } from 'class-transformer';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductoController {
    constructor(private readonly productService: ProductoService) {}

    @Get()
    async findAll() {
        return await this.productService.findAll();
    }

    @Get(':productoId')
    async findOne(@Param('productoId') productoId: string) {
        return await this.productService.findOne(productoId);
    }

    @Post()
    async create(@Body() productoDto: ProductoDto) {
        const producto: ProductoEntity = plainToInstance(ProductoEntity, productoDto);
        return await this.productService.create(producto);
    }

    @Put(':productoId')
    async update(@Param('productoId') productoId: string, @Body() prodctoDto: ProductoDto) {
        const product: ProductoEntity = plainToInstance(ProductoEntity, prodctoDto);
        return await this.productService.update(productoId, product);
    }

    @Delete(':productoId')
    @HttpCode(204)
    async delete(@Param('productoId') productoId: string) {
        return await this.productService.delete(productoId);
    }

} 
