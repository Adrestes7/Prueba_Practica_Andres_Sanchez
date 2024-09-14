import { Body, Controller, Delete, Get, HttpCode, Param, Post, Put, UseInterceptors } from '@nestjs/common';
import { BusinessErrorsInterceptor } from '../shared/interceptors/business-errors/business-errors.interceptor';
import { ProductTiendaService } from './product-tienda.service';
import { TiendaDto } from '../tienda/tienda.dto/tienda.dto';
import { plainToInstance } from 'class-transformer';
import { TiendaEntity } from '../tienda/tienda.entity';

@Controller('products')
@UseInterceptors(BusinessErrorsInterceptor)
export class ProductTiendaController {
    constructor(private readonly productoTiendaService: ProductTiendaService) {}

    @Post(':productId/stores/:storeId')
    async addStoreToProduct(@Param('productId') productId: string, @Param('storeId') storeId: string) {
        return await this.productoTiendaService.addStoreToProduct(productId, storeId);
    }

    @Get(':productId/stores')
    async findStoresFromProduct(@Param('productId') productId: string){
        return await this.productoTiendaService.findStoresFromProduct(productId);
    }

    @Get(':productId/stores/:storeId')
    async findStoreFromProduct(@Param('productId') productId: string, @Param('storeId') storeId: string) {
        return await this.productoTiendaService.findStoreFromProduct(productId, storeId)
    }

    @Put(':productId/stores')
    async updateStoresFromProduct(@Body() tiendasDto: TiendaDto[], @Param('productId') productId: string) {
        const tiendas = plainToInstance(TiendaEntity, tiendasDto);
        return await this.productoTiendaService.updateStoresFromProduct(productId, tiendas);
    }

    @Delete(':productId/stores/:storeId')
    @HttpCode(204)
    async deleteStoresFromProduct(@Param('productId') productId: string, @Param('storeId') storeId: string) {
        return await this.productoTiendaService.deleteStoreFromProduct(productId, storeId);
    }
}
