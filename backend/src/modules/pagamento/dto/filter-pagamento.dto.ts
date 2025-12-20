import { IsOptional, IsUUID, IsDateString } from 'class-validator';

export class FilterPagamentoDto {
  @IsOptional()
  @IsUUID()
  conta_pagar_id?: string;

  @IsOptional()
  @IsDateString()
  data_inicio?: string;

  @IsOptional()
  @IsDateString()
  data_fim?: string;
}




