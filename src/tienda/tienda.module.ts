import { Module } from '@nestjs/common';
import { TiendaService } from './tienda.service';
import { TiendaController } from './tienda.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TiendaEntity } from './tienda.entity';

@Module({
  imports:[TypeOrmModule.forFeature([TiendaEntity])],
  providers: [TiendaService],
  controllers: [TiendaController]
})
export class TiendaModule {}
