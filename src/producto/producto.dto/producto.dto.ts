import { IsNotEmpty, IsNumber, IsString } from "class-validator";

export class ProductoDto {
    @IsString()
    @IsNotEmpty()
    nombre:string

    @IsNumber()
    @IsNotEmpty()
    precio:number

    @IsString()
    @IsNotEmpty()
    tipo: string
}
