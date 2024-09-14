import { Test, TestingModule } from '@nestjs/testing';
import { TiendaService } from './tienda.service';
import { Repository } from 'typeorm';
import { TiendaEntity } from './tienda.entity';
import { TypeOrmTestingConfig } from '../shared/testing-utils/typeorm-testing-config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { faker } from '@faker-js/faker';

describe('TiendaService', () => {
  let service: TiendaService;
  let repository: Repository<TiendaEntity>;
  let tiendasList: TiendaEntity[]
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports:[...TypeOrmTestingConfig()],
      providers: [TiendaService],
    }).compile();

    service = module.get<TiendaService>(TiendaService);
    repository = module.get<Repository<TiendaEntity>>(getRepositoryToken(TiendaEntity));
    await seedDatabase()
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  const seedDatabase = async () => {
    repository.clear();
    tiendasList = [];

    for(let i=0; i<5; i++) {
      const tienda: TiendaEntity = await repository.save({
        nombre: faker.company.name(),
        ciudad: faker.location.countryCode('alpha-3'),
        direccion: faker.company.name()
      })
      tiendasList.push(tienda)
    }
  }

  it('findAll should return alltiendas', async () => {
    const tiendas: TiendaEntity[] = await service.findAll();
    expect(tiendas).not.toBeNull();
    expect(tiendas).toHaveLength(tiendas.length);
  });

  it('findOne should return a tienda by id', async() => {
    const tiendaExistente: TiendaEntity = tiendasList[0];
    const tienda: TiendaEntity = await service.findOne(tiendaExistente.id);
    expect(tienda).not.toBeNull()
    expect(tienda.nombre).toEqual(tiendaExistente.nombre)
    expect(tienda.ciudad).toEqual(tiendaExistente.ciudad)
    expect(tienda.direccion).toEqual(tiendaExistente.direccion)
  })

  it('findOne should throw an exception for invalid product', async () => {
    await expect(() => service.findOne("0")).rejects.toHaveProperty("message", "No se encontró una tienda con ese id")
  })

  it('create should return a new tienda', async() => {
    const tienda: TiendaEntity ={
      id:"",
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-3'),
      direccion: faker.company.name(),
      productos:[]
    }

    const newTienda: TiendaEntity = await service.create(tienda)
    expect(newTienda).not.toBeNull()

    const tiendaExistente: TiendaEntity = await repository.findOne({where: {id: newTienda.id}})
    expect(tiendaExistente).not.toBeNull()
    expect(tiendaExistente.nombre).toEqual(newTienda.nombre)
    expect(tiendaExistente.ciudad).toEqual(newTienda.ciudad)
    expect(tiendaExistente.direccion).toEqual(newTienda.direccion)
  })

  it('create should throw exception for invalid city', async() => {
    const tienda: TiendaEntity ={
      id:"",
      nombre: faker.company.name(),
      ciudad: faker.location.countryCode('alpha-2'),
      direccion: faker.company.name(),
      productos:[]
    }

    await expect(() => service.create(tienda)).rejects.toHaveProperty("message", "El campo ciudad tiene que tener 3 caracteres")
  })

  it('update should modify a tienda', async() => {
    const tienda: TiendaEntity = tiendasList[0];
    tienda.nombre = "New Name";
    tienda.direccion = "555";

    const actualizarTienda: TiendaEntity = await service.update(tienda.id, tienda);
    expect(actualizarTienda).not.toBeNull();
    const tiendaExistente: TiendaEntity = await repository.findOne({where: {id: tienda.id}})
    expect(tiendaExistente).not.toBeNull();
    expect(tiendaExistente.nombre).toEqual(tienda.nombre)
    expect(tiendaExistente.direccion).toEqual(tienda.direccion)
  })

  it('update should throw an exception for an invalid tienda', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda, nombre: "New name", direccion: "555"
    }

    await expect(() => service.update("0", tienda)).rejects.toHaveProperty("message", "No se encontró una tienda con ese id")
  })

  it('update should throw an exception for an invalid city', async () => {
    let tienda: TiendaEntity = tiendasList[0];
    tienda = {
      ...tienda, nombre: "New name", ciudad: "ab"
    }

    await expect(() => service.update(tienda.id, tienda)).rejects.toHaveProperty("message", "El campo ciudad tiene que tener 3 caracteres")
  })

  it('delete should remove a tienda', async() => {
    const tienda: TiendaEntity = tiendasList[0]
    await service.delete(tienda.id)
    const deletedTienda: TiendaEntity = await repository.findOne({ where: {id: tienda.id}})
    expect(deletedTienda).toBeNull()
  })

  it('delete dhould throw an exception for an invalid tienda', async() => {
    const tienda: TiendaEntity = tiendasList[0];
    await expect(() => service.delete("0")).rejects.toHaveProperty("message", "No se encontró una tienda con ese id")
}) 
});
