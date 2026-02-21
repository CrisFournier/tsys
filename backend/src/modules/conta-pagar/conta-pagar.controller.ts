import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { ContaPagarService } from './conta-pagar.service';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { FilterContaPagarDto } from './dto/filter-conta-pagar.dto';
import { parseDateLocal } from '../../common/utils/date-formatters';

@Controller('contas-pagar')
export class ContaPagarController {
  constructor(private readonly contaPagarService: ContaPagarService) {}

  @Post()
  create(@Body() createContaPagarDto: CreateContaPagarDto) {
    return this.contaPagarService.create(createContaPagarDto);
  }

  @Get()
  findAll(@Query() filters: FilterContaPagarDto) {
    return this.contaPagarService.findAll(filters);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.contaPagarService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateContaPagarDto: UpdateContaPagarDto,
  ) {
    return this.contaPagarService.update(id, updateContaPagarDto);
  }

  @Delete(':id')
  cancel(@Param('id') id: string) {
    return this.contaPagarService.cancel(id);
  }

  @Post(':id/pagar')
  async registrarPagamento(
    @Param('id') id: string,
    @Body() body: {
      valor_pago: number;
      data_pagamento: string;
      forma_pagamento: string;
      observacoes?: string;
    },
  ) {
    if (!body) {
      throw new BadRequestException('Dados do pagamento são obrigatórios');
    }
    if (!body.data_pagamento) {
      throw new BadRequestException('Data de pagamento é obrigatória');
    }

    try {
      return await this.contaPagarService.registrarPagamento(
        id,
        body.valor_pago,
        parseDateLocal(body.data_pagamento),
        body.forma_pagamento,
        body.observacoes,
      );
    } catch (error) {
      // Se for erro de formatação de data, retorna BadRequest
      if (error instanceof Error && (error.message.includes('data') || error.message.includes('Data'))) {
        throw new BadRequestException(`Data inválida: ${error.message}`);
      }
      // Se for erro de validação de data (ano, mês, dia inválido)
      if (error instanceof Error && (error.message.includes('Ano') || error.message.includes('Mês') || error.message.includes('Dia'))) {
        throw new BadRequestException(`Data inválida: ${error.message}`);
      }
      // Re-lança outros erros (BadRequestException, NotFoundException, etc.)
      throw error;
    }
  }
}





