import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from './producto.entity';
import { Repository } from 'typeorm';
import { BusinessError, BusinessLogicException } from '../shared/errors/business.errors';

@Injectable()
export class ProductoService {
    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productoRepository: Repository<ProductoEntity>
    ) {}

    async findAll(): Promise<ProductoEntity[]> {
        return await this.productoRepository.find({relations:['tiendas']});
    }

    async findOne(id: string): Promise<ProductoEntity> {
        const producto: ProductoEntity = await this.productoRepository.findOne({where: {id}, relations:['tiendas']});
        if(!producto)
            throw new BusinessLogicException("No se encontró un producto con ese id", BusinessError.NOT_FOUND);

        return producto;
    }

    async create(producto: ProductoEntity): Promise<ProductoEntity> {
        if(producto.tipo == 'Perecedero' || producto.tipo == 'No perecedero') {
            return await this.productoRepository.save(producto)
        } else {
            throw new BusinessLogicException("Solo se acepta perecedero o no pereceder en el campo tipo", BusinessError.BAD_REQUEST);
        }
    }

    async update(id: string, producto: ProductoEntity): Promise<ProductoEntity> {
        const productoExistente: ProductoEntity = await this.productoRepository.findOne({where: {id}});
        if(!productoExistente) {
            throw new BusinessLogicException("No se encontró un producto con ese id", BusinessError.NOT_FOUND);
        }
        if(producto.tipo == 'Perecedero' || producto.tipo == 'No perecedero') {
            return await this.productoRepository.save({...productoExistente, ...producto})
        } else {
            throw new BusinessLogicException("Solo se acepta perecedero o no pereceder en el campo tipo", BusinessError.BAD_REQUEST);
        }
    }

    async delete(id: string) {
        const productoExistente: ProductoEntity = await this.productoRepository.findOne({where: {id}});
        if(!productoExistente) {
            throw new BusinessLogicException("No se encontró un producto con ese id", BusinessError.NOT_FOUND);
        }
        
        await this.productoRepository.remove(productoExistente)
    }
}
