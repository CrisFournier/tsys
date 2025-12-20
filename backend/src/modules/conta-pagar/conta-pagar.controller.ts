import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ContaPagarService } from './conta-pagar.service';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { FilterContaPagarDto } from './dto/filter-conta-pagar.dto';

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
  registrarPagamento(
    @Param('id') id: string,
    @Body() body: {
      valor_pago: number;
      data_pagamento: string;
      forma_pagamento: string;
      observacoes?: string;
    },
  ) {
    return this.contaPagarService.registrarPagamento(
      id,
      body.valor_pago,
      new Date(body.data_pagamento),
      body.forma_pagamento,
      body.observacoes,
    );
  }
}





