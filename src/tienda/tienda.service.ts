import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TiendaEntity } from './tienda.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business.errors';

@Injectable()
export class TiendaService {
    constructor(
        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>
    ) {}

    async findAll(): Promise<TiendaEntity[]> {
        return await this.tiendaRepository.find({relations:['productos']});
    }

    async findOne(id: string): Promise<TiendaEntity> {
        const producto: TiendaEntity = await this.tiendaRepository.findOne({where: {id}, relations:['productos']});
        if(!producto)
            throw new BusinessLogicException("No se encontró una tienda con ese id", BusinessError.NOT_FOUND);

        return producto;
    }

    async create(tienda: TiendaEntity): Promise<TiendaEntity> {
        if(tienda.ciudad.length == 3) {
            return await this.tiendaRepository.save(tienda)
        } else {
            throw new BusinessLogicException("El campo ciudad tiene que tener 3 caracteres", BusinessError.BAD_REQUEST);
        }
    }

    async update(id: string, tienda: TiendaEntity): Promise<TiendaEntity> {
        const productoExistente: TiendaEntity = await this.tiendaRepository.findOne({where: {id}});
        if(!productoExistente) {
            throw new BusinessLogicException("No se encontró una tienda con ese id", BusinessError.NOT_FOUND);
        }
        if(tienda.ciudad.length == 3) {
            return await this.tiendaRepository.save(tienda)
        } else {
            throw new BusinessLogicException("El campo ciudad tiene que tener 3 caracteres", BusinessError.BAD_REQUEST);
        }
    }

    async delete(id: string) {
        const productoExistente: TiendaEntity = await this.tiendaRepository.findOne({where: {id}});
        if(!productoExistente) {
            throw new BusinessLogicException("No se encontró una tienda con ese id", BusinessError.NOT_FOUND);
        }
        
        await this.tiendaRepository.remove(productoExistente)
    }
}
