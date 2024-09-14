import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { BusinessError, BusinessLogicException } from '../shared/errors/business.errors';
import { TiendaEntity } from '../tienda/tienda.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ProductTiendaService {
    constructor(
        @InjectRepository(ProductoEntity)
        private readonly productRepository: Repository<ProductoEntity>,

        @InjectRepository(TiendaEntity)
        private readonly tiendaRepository: Repository<TiendaEntity>,
    ) {}

    async addStoreToProduct(productId: string, tiendaId: string): Promise<ProductoEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda) {
            throw new BusinessLogicException("No se encontro una tienda con ese id", BusinessError.NOT_FOUND);
        }

        const product: ProductoEntity = await this.productRepository.findOne({where:{ id: productId}, relations:["tiendas"]});
        if(!product) {
            throw new BusinessLogicException("No se encontro un producto con ese id", BusinessError.NOT_FOUND);
        }
        product.tiendas = [...product.tiendas, tienda];
        return await this.productRepository.save(product);
    }

    async findStoresFromProduct(productId: string): Promise<TiendaEntity[]> {
        const product: ProductoEntity = await this.productRepository.findOne({where: {id: productId}, relations: ["tiendas"]});
        if (!product) {
            throw new BusinessLogicException("No se encontro un producto con ese id", BusinessError.NOT_FOUND);
        }
        return product.tiendas
    }

    async findStoreFromProduct(productId: string, tiendaId: string): Promise<TiendaEntity> {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda) {
            throw new BusinessLogicException("No se encontro una tienda con ese id", BusinessError.NOT_FOUND);
        }

        const product: ProductoEntity = await this.productRepository.findOne({where:{ id: productId}, relations: ["tiendas"]});
        if(!product) {
            throw new BusinessLogicException("No se encontro un producto con ese id", BusinessError.NOT_FOUND);
        }

        const productTienda: TiendaEntity = product.tiendas.find(e => e.id === tienda.id)
        if(!productTienda){
            throw new BusinessLogicException("La tienda con el id dado no esta asociada a ningun producto", BusinessError.PRECONDITION_FAILED)
        }
        return productTienda
    }

    async updateStoresFromProduct(productId: string, tiendas: TiendaEntity[]): Promise<ProductoEntity> {
        const product: ProductoEntity = await this.productRepository.findOne({where:{ id: productId}});
        if(!product) {
            throw new BusinessLogicException("No se encontro un producto con ese id", BusinessError.NOT_FOUND);
        }

        for(let i=0; i<tiendas.length; i++) {
            const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendas[i].id}});
            if(!tienda)
                throw new BusinessLogicException("No se encontro una tienda con ese id", BusinessError.NOT_FOUND);
        }

        product.tiendas = tiendas
        return await this.productRepository.save(product)
    }

    async deleteStoreFromProduct(productId: string, tiendaId: string) {
        const tienda: TiendaEntity = await this.tiendaRepository.findOne({where: {id: tiendaId}});
        if (!tienda) {
            throw new BusinessLogicException("No se encontro una tienda con ese id", BusinessError.NOT_FOUND);
        }

        const product: ProductoEntity = await this.productRepository.findOne({where:{ id: productId}, relations: ["tiendas"]});
        if(!product) {
            throw new BusinessLogicException("No se encontro un producto con ese id", BusinessError.NOT_FOUND);
        }

        const productTienda: TiendaEntity = product.tiendas.find(e => e.id === tienda.id)
        if(!productTienda){
            throw new BusinessLogicException("La tienda con el id dado no esta asociada a ningun producto", BusinessError.PRECONDITION_FAILED)
        }

        product.tiendas = product.tiendas.filter(e=> e.id !== tiendaId)
        await this.productRepository.save(product)
    }
}
