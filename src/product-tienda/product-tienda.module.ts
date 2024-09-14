import { Module } from '@nestjs/common';
import { ProductTiendaService } from './product-tienda.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { ProductTiendaController } from './product-tienda.controller';

@Module({
  imports:[TypeOrmModule.forFeature([ProductoEntity, TiendaEntity])],
  providers: [ProductTiendaService],
  controllers: [ProductTiendaController]
})
export class ProductTiendaModule {}
