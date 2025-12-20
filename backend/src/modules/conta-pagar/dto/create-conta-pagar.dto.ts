import {
  IsString,
  IsUUID,
  IsNumber,
  IsDateString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import {
  StatusContaPagar,
  PeriodicidadeRecorrente,
} from '../entities/conta-pagar.entity';

export class CreateContaPagarDto {
  @IsUUID()
  fornecedor_id: string;

  @IsUUID()
  categoria_id: string;

  @IsUUID()
  @IsOptional()
  centro_custo_id?: string;

  @IsString()
  descricao: string;

  @IsNumber()
  valor: number;

  @IsDateString()
  data_vencimento: string;

  @IsDateString()
  data_emissao: string;

  @IsEnum(StatusContaPagar)
  @IsOptional()
  status?: StatusContaPagar;

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsEnum(PeriodicidadeRecorrente)
  @IsOptional()
  periodicidade?: PeriodicidadeRecorrente;

  @IsString()
  @IsOptional()
  observacoes?: string;
}





