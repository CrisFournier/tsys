import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Pagamento } from './entities/pagamento.entity';
import { CreatePagamentoDto } from './dto/create-pagamento.dto';
import { UpdatePagamentoDto } from './dto/update-pagamento.dto';
import { FilterPagamentoDto } from './dto/filter-pagamento.dto';
import { ContaPagar, StatusContaPagar } from '../conta-pagar/entities/conta-pagar.entity';
import { parseDateLocal } from '../../common/utils/date-formatters';

@Injectable()
export class PagamentoService {
  constructor(
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
    @InjectRepository(ContaPagar)
    private contaPagarRepository: Repository<ContaPagar>,
  ) {}

  async create(createPagamentoDto: CreatePagamentoDto): Promise<Pagamento> {
    const contaPagar = await this.contaPagarRepository.findOne({
      where: { id: createPagamentoDto.conta_pagar_id },
    });

    if (!contaPagar) {
      throw new NotFoundException(
        `Conta a pagar com ID ${createPagamentoDto.conta_pagar_id} não encontrada`,
      );
    }

    if (contaPagar.status === StatusContaPagar.PAGO) {
      throw new BadRequestException('Esta conta já foi totalmente paga');
    }

    if (contaPagar.status === StatusContaPagar.CANCELADO) {
      throw new BadRequestException('Não é possível pagar uma conta cancelada');
    }

    const pagamento = this.pagamentoRepository.create({
      ...createPagamentoDto,
      data_pagamento: parseDateLocal(createPagamentoDto.data_pagamento),
    });

    const savedPagamento = await this.pagamentoRepository.save(pagamento);

    // Atualizar status da conta
    await this.atualizarStatusConta(createPagamentoDto.conta_pagar_id);

    return savedPagamento;
  }

  async findAll(filters?: FilterPagamentoDto): Promise<Pagamento[]> {
    const queryBuilder = this.pagamentoRepository
      .createQueryBuilder('pagamento')
      .leftJoinAndSelect('pagamento.contaPagar', 'contaPagar')
      .leftJoinAndSelect('contaPagar.fornecedor', 'fornecedor');

    if (filters?.conta_pagar_id) {
      queryBuilder.andWhere('pagamento.conta_pagar_id = :conta_pagar_id', {
        conta_pagar_id: filters.conta_pagar_id,
      });
    }

    if (filters?.data_inicio && filters?.data_fim) {
      queryBuilder.andWhere('pagamento.data_pagamento BETWEEN :data_inicio AND :data_fim', {
        data_inicio: filters.data_inicio,
        data_fim: filters.data_fim,
      });
    }

    return await queryBuilder
      .orderBy('pagamento.data_pagamento', 'DESC')
      .getMany();
  }

  async findOne(id: string): Promise<Pagamento> {
    const pagamento = await this.pagamentoRepository.findOne({
      where: { id },
      relations: ['contaPagar', 'contaPagar.fornecedor'],
    });

    if (!pagamento) {
      throw new NotFoundException(`Pagamento com ID ${id} não encontrado`);
    }

    return pagamento;
  }

  async update(
    id: string,
    updatePagamentoDto: UpdatePagamentoDto,
  ): Promise<Pagamento> {
    const pagamento = await this.findOne(id);

    if (updatePagamentoDto.data_pagamento) {
      updatePagamentoDto.data_pagamento = parseDateLocal(
        updatePagamentoDto.data_pagamento as any,
      ) as any;
    }

    Object.assign(pagamento, updatePagamentoDto);
    const savedPagamento = await this.pagamentoRepository.save(pagamento);

    // Atualizar status da conta
    if (updatePagamentoDto.conta_pagar_id) {
      await this.atualizarStatusConta(updatePagamentoDto.conta_pagar_id as string);
    } else {
      await this.atualizarStatusConta(pagamento.conta_pagar_id);
    }

    return savedPagamento;
  }

  async remove(id: string): Promise<void> {
    const pagamento = await this.findOne(id);
    const contaPagarId = pagamento.conta_pagar_id;

    await this.pagamentoRepository.remove(pagamento);

    // Atualizar status da conta
    await this.atualizarStatusConta(contaPagarId);
  }

  private async atualizarStatusConta(contaPagarId: string): Promise<void> {
    const contaPagar = await this.contaPagarRepository.findOne({
      where: { id: contaPagarId },
    });

    if (!contaPagar) return;

    const pagamentos = await this.pagamentoRepository.find({
      where: { conta_pagar_id: contaPagarId },
    });

    const totalPago = pagamentos.reduce(
      (total, pagamento) => total + Number(pagamento.valor_pago),
      0,
    );

    if (totalPago >= Number(contaPagar.valor)) {
      contaPagar.status = StatusContaPagar.PAGO;
    } else if (contaPagar.data_vencimento < new Date()) {
      contaPagar.status = StatusContaPagar.VENCIDO;
    } else {
      contaPagar.status = StatusContaPagar.PENDENTE;
    }

    await this.contaPagarRepository.save(contaPagar);
  }
}





