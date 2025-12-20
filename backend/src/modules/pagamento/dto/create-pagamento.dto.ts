import {
  IsUUID,
  IsNumber,
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
} from 'class-validator';
import { FormaPagamento } from '../entities/pagamento.entity';

export class CreatePagamentoDto {
  @IsUUID()
  conta_pagar_id: string;

  @IsNumber()
  valor_pago: number;

  @IsDateString()
  data_pagamento: string;

  @IsEnum(FormaPagamento)
  forma_pagamento: FormaPagamento;

  @IsString()
  @IsOptional()
  observacoes?: string;
}





