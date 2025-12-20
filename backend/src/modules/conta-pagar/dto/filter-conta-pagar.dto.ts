import { IsOptional, IsEnum, IsUUID, IsDateString } from 'class-validator';
import { StatusContaPagar } from '../entities/conta-pagar.entity';

export class FilterContaPagarDto {
  @IsOptional()
  @IsEnum(StatusContaPagar)
  status?: StatusContaPagar;

  @IsOptional()
  @IsUUID()
  fornecedor_id?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;
}



