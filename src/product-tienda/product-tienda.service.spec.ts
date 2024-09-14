import { Test, TestingModule } from '@nestjs/testing';
import { ProductTiendaService } from './product-tienda.service';
import { Repository } from 'typeorm';
import { ProductoEntity } from '../producto/producto.entity';
import { TiendaEntity } from '../tienda/tienda.entity';
import { faker } from '@faker-js/faker';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('ProductTiendaService', () => {
  let service: ProductTiendaService;
  let productoRepository: Repository<ProductoEntity>;
  let tiendaRepository: Repository<TiendaEntity>;
  let producto: ProductoEntity;
  let tiendasList: TiendaEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[...TypeOrmTestingConfig()],
      providers: [ProductTiendaService],
    }).compile();

    service = module.get<ProductTiendaService>(ProductTiendaService);
    productoRepository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    tiendaRepository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase()
  });

  const seedDatabase = async  () => {
    productoRepository.clear();
    tiendaRepository.clear();

    tiendasList = [];
    for(let i=0; i<5; i++) {
      const tienda: TiendaEntity = await tiendaRepository.save({
        nombre: faker.company.name(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.company.name() 
      })
      tiendasList.push(tienda)
    };

    producto = await productoRepository.save({
      nombre: faker.company.name(),
      precio: faker.number.int(),
      tipo: 'Perecedero',
      tiendas:tiendasList
    });
  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('addStoreToProduct should add a store to a product', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });

    const newProducto = await productoRepository.save({
      nombre: faker.company.name(),
      precio: faker.number.int(),
      tipo: 'Perecedero'
    });

    const result: ProductoEntity = await service.addStoreToProduct(newProducto.id, newTienda.id);

    expect(result.tiendas.length).toBe(1);
    expect(result.tiendas[0]).not.toBeNull();
    expect(result.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(result.tiendas[0].direccion).toBe(newTienda.direccion);
    expect(result.tiendas[0].ciudad).toBe(newTienda.ciudad);
  })

  it('addstoreToProduct should thrown exception for an invalid tienda', async () => {
    const newProducto = await productoRepository.save({
      nombre: faker.company.name(),
      precio: faker.number.int(),
      tipo: 'Perecedero'
    });
    await expect(() => service.addStoreToProduct(newProducto.id, "0")).rejects.toHaveProperty("message", "No se encontro una tienda con ese id");
  })

  it('addstoreToProduct should thrown exception for an invalid producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });
    await expect(() => service.addStoreToProduct("0", newTienda.id)).rejects.toHaveProperty("message", "No se encontro un producto con ese id");
  })

  it('findStoresByProduct should return stores by product', async () => {
    const tiendas: TiendaEntity[] = await service.findStoresFromProduct(producto.id);
    expect(tiendas.length).toBe(5);
  })

  it('findStoresByProduct should thrown errer for an invalid product', async () => {
    await expect(() => service.findStoresFromProduct("0")).rejects.toHaveProperty("message", "No se encontro un producto con ese id");
  })

  it('findStoreByProductId should return store by product', async() => {
    const tienda: TiendaEntity = tiendasList[0];
    const tiendaExistente: TiendaEntity = await service.findStoreFromProduct(producto.id, tienda.id)
    
    expect(tiendaExistente).not.toBeNull();
    expect(tiendaExistente.nombre).toBe(tienda.nombre);
    expect(tiendaExistente.direccion).toBe(tienda.direccion);
    expect(tiendaExistente.ciudad).toBe(tienda.ciudad);
  })

  it('findStoreByProductId should throw an exception for invalid tienda', async () => {
    await expect(() => service.findStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "No se encontro una tienda con ese id");
  })

  it('findStoreByProductId should throw an exception for invalid producto', async () => {
    await expect(() => service.findStoreFromProduct("0", tiendasList[0].id)).rejects.toHaveProperty("message", "No se encontro un producto con ese id");
  })

  it('findStoreByProductId should throw an exception for a tienda not associated with producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });

    await expect(() => service.findStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message","La tienda con el id dado no esta asociada a ningun producto")
  })

  it('updateStoresFromProduct should update tiendas list for a producto', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });

    const updatedProducto: ProductoEntity = await service.updateStoresFromProduct(producto.id, [newTienda])
    expect(updatedProducto.tiendas.length).toBe(1);
    expect(updatedProducto.tiendas[0]).not.toBeNull();
    expect(updatedProducto.tiendas[0].nombre).toBe(newTienda.nombre);
    expect(updatedProducto.tiendas[0].direccion).toBe(newTienda.direccion);
    expect(updatedProducto.tiendas[0].ciudad).toBe(newTienda.ciudad);
  })

  it('updateStoresFromProduct should throw exception for an invalid product', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });

    await expect(() => service.updateStoresFromProduct("0", [newTienda])).rejects.toHaveProperty("message", "No se encontro un producto con ese id");
  })

  it('updateStoresFromProduct should throw exception for an invalid store', async()=> {
    const newTienda: TiendaEntity = tiendasList[0];
    newTienda.id = "0";

    await expect(() => service.updateStoresFromProduct(producto.id, [newTienda])).rejects.toHaveProperty("message", "No se encontro una tienda con ese id");
  })

  it('deleteStoreFromProduct should delete a store form product', async () => {
    const tienda: TiendaEntity = tiendasList[0];

    await service.deleteStoreFromProduct(producto.id, tienda.id);

    const productoExistente: ProductoEntity = await productoRepository.findOne({where: {id: producto.id}, relations: ["tiendas"]});
    const deletedTienda: TiendaEntity = productoExistente.tiendas.find(a => a.id === tienda.id);

    expect(deletedTienda).toBeUndefined()
  })

  it('deleteStoreFromProduct should thrown an exception for an invalid store', async () => {
    await expect(service.deleteStoreFromProduct(producto.id, "0")).rejects.toHaveProperty("message", "No se encontro una tienda con ese id");
  })

  it('deleteStoreFromProduct should thrown an exception for an invalid product', async () => {
    await expect(service.deleteStoreFromProduct("0", tiendasList[0].id)).rejects.toHaveProperty("message", "No se encontro un producto con ese id");
  })

  it('deleteStoreFromProduct should thrown an exception for a nin associated store', async () => {
    const newTienda: TiendaEntity = await tiendaRepository.save({
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name() 
    });

    await expect(() => service.deleteStoreFromProduct(producto.id, newTienda.id)).rejects.toHaveProperty("message","La tienda con el id dado no esta asociada a ningun producto")
  })
});
