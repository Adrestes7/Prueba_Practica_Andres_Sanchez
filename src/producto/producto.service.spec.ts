import { Test, TestingModule } from '@nestjs/testing';
import { ProductoService } from './producto.service';
import { Repository } from 'typeorm';
import { ProductoEntity } from './producto.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('ProductoService', () => {
  let service: ProductoService;
  let repository: Repository<ProductoEntity>;
  let productosList: ProductoEntity[];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[...TypeOrmTestingConfig()],
      providers: [ProductoService],
    }).compile();

    service = module.get<ProductoService>(ProductoService);
    repository = module.get<Repository<ProductoEntity>>(getRepositoryToken(ProductoEntity));
    await seedDatabase()
  });

  const seedDatabase = async () => {
    repository.clear();
    productosList = [];

    for(let i=0; i<5; i++) {
      const producto: ProductoEntity = await repository.save({
        nombre: faker.company.name(),
        precio: faker.number.int(),
        tipo: 'Perecedero'
      })
      productosList.push(producto)
    }

  }

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return allProducts', async () => {
    const productos: ProductoEntity[] = await service.findAll();
    expect(productos).not.toBeNull();
    expect(productos).toHaveLength(productosList.length);
  });

  it('findOne should return a product by id', async() => {
    const productoExistente: ProductoEntity = productosList[0];
    const producto: ProductoEntity = await service.findOne(productoExistente.id);
    expect(producto).not.toBeNull()
    expect(producto.nombre).toEqual(productoExistente.nombre)
    expect(producto.precio).toEqual(productoExistente.precio)
    expect(producto.tipo).toEqual(productoExistente.tipo)
  })

  it('findOne should throw an exception for invalid product', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró un producto con ese id")
  })

  it('create should return a new product', async() => {
    const producto: ProductoEntity ={
      id:"",
      nombre: faker.company.name(),
      precio: faker.number.int(),
      tipo: 'Perecedero',
      tiendas:[]
    }

    const newProduct: ProductoEntity = await service.create(producto)
    expect(newProduct).not.toBeNull()

    const productoExistente: ProductoEntity = await repository.findOne({where: {id: newProduct.id}})
    expect(productoExistente).not.toBeNull()
    expect(productoExistente.nombre).toEqual(newProduct.nombre)
    expect(productoExistente.precio).toEqual(newProduct.precio)
    expect(productoExistente.tipo).toEqual(newProduct.tipo)
  })

  it('create should throw exception for invalid product type', async() => {
    const producto: ProductoEntity ={
      id:"",
      nombre: faker.company.name(),
      precio: faker.number.int(),
      tipo: faker.company.name(),
      tiendas:[]
    }

    await expect(() => service.create(producto)).rejects.toHaveProperty("message", "Solo se acepta perecedero o no pereceder en el campo tipo")
  })

  it('update should modify a product', async() => {
    const product: ProductoEntity = productosList[0];
    product.nombre = "New Name";
    product.precio = 555;

    const actualizarProduct: ProductoEntity = await service.update(product.id, product);
    expect(actualizarProduct).not.toBeNull();
    const productoExistente: ProductoEntity = await repository.findOne({where: {id: product.id}})
    expect(productoExistente).not.toBeNull();
    expect(productoExistente.nombre).toEqual(product.nombre)
    expect(productoExistente.precio).toEqual(product.precio)
  })

  it('update should throw an exception for an invalid product', async () => {
    let product: ProductoEntity = productosList[0];
    product = {
      ...product, nombre: "New name", precio: 555
    }

    await expect(() => service.update("0", product)).rejects.toHaveProperty("message", "No se encontró un producto con ese id")
  })

  it('update should throw an exception for an invalid product type', async () => {
    let product: ProductoEntity = productosList[0];
    product = {
      ...product, nombre: "New name", tipo: 'aaaa'
    }

    await expect(() => service.update(product.id, product)).rejects.toHaveProperty("message", "Solo se acepta perecedero o no pereceder en el campo tipo")
  })

  it('delete should remove a product', async() => {
      const product: ProductoEntity = productosList[0]
      await service.delete(product.id)
      const deletedProduct: ProductoEntity = await repository.findOne({ where: {id: product.id}})
      expect(deletedProduct).toBeNull()
  })

  it('delete dhould throw an exception for an invalid product', async() => {
      const product: ProductoEntity = productosList[0];
      await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró un producto con ese id")
  }) 
});
