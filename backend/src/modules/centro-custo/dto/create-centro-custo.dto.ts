import { IsString, IsOptional, IsBoolean } from 'class-validator';

export class CreateCentroCustoDto {
  @IsString()
  nome: string;

  @IsString()
  @IsOptional()
  descricao?: string;

  @IsBoolean()
  @IsOptional()
  ativo?: boolean;
}



