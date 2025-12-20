import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TipoCategoria } from '../entities/categoria.entity';

export class CreateCategoriaDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsEnum(TipoCategoria)
  @IsOptional()
  tipo?: TipoCategoria;
}
