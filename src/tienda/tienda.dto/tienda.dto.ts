import { IsNotEmpty, IsString } from "class-validator"

export class TiendaDto {
    @IsString()
    @IsNotEmpty()
    nombre:string

    @IsString()
    @IsNotEmpty()
    ciudad:number

    @IsString()
    @IsNotEmpty()
    direccion: string
}
