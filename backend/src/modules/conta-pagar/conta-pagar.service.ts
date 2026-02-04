import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { ContaPagar, StatusContaPagar } from './entities/conta-pagar.entity';
import { CreateContaPagarDto } from './dto/create-conta-pagar.dto';
import { UpdateContaPagarDto } from './dto/update-conta-pagar.dto';
import { FilterContaPagarDto } from './dto/filter-conta-pagar.dto';
import { Pagamento } from '../pagamento/entities/pagamento.entity';
import { parseDateLocal } from '../../common/utils/date-formatters';

@Injectable()
export class ContaPagarService {
  constructor(
    @InjectRepository(ContaPagar)
    private contaPagarRepository: Repository<ContaPagar>,
    @InjectRepository(Pagamento)
    private pagamentoRepository: Repository<Pagamento>,
  ) {}

  async create(createContaPagarDto: CreateContaPagarDto): Promise<ContaPagar> {
    const contaPagar = this.contaPagarRepository.create({
      ...createContaPagarDto,
      data_vencimento: parseDateLocal(createContaPagarDto.data_vencimento),
      data_emissao: parseDateLocal(createContaPagarDto.data_emissao),
      status: createContaPagarDto.status || StatusContaPagar.PENDENTE,
    });

    // Verificar se está vencida
    if (contaPagar.data_vencimento < new Date() && contaPagar.status === StatusContaPagar.PENDENTE) {
      contaPagar.status = StatusContaPagar.VENCIDO;
    }

    return await this.contaPagarRepository.save(contaPagar);
  }

  async findAll(filters?: FilterContaPagarDto): Promise<ContaPagar[]> {
    const queryBuilder = this.contaPagarRepository
      .createQueryBuilder('contaPagar')
      .leftJoinAndSelect('contaPagar.fornecedor', 'fornecedor')
      .leftJoinAndSelect('contaPagar.categoria', 'categoria')
      .leftJoinAndSelect('contaPagar.centroCusto', 'centroCusto')
      .leftJoinAndSelect('contaPagar.pagamentos', 'pagamentos');

    if (filters?.status) {
      queryBuilder.andWhere('contaPagar.status = :status', {
        status: filters.status,
      });
    }

    if (filters?.fornecedor_id) {
      queryBuilder.andWhere('contaPagar.fornecedor_id = :fornecedor_id', {
        fornecedor_id: filters.fornecedor_id,
      });
    }

    if (filters?.data_inicio && filters?.data_fim) {
      queryBuilder.andWhere('contaPagar.data_vencimento BETWEEN :data_inicio AND :data_fim', {
        data_inicio: filters.data_inicio,
        data_fim: filters.data_fim,
      });
    }

    // Atualizar status de contas vencidas
    await this.atualizarStatusVencidas();

    return await queryBuilder.orderBy('contaPagar.data_vencimento', 'ASC').getMany();
  }

  async findOne(id: string): Promise<ContaPagar> {
    const contaPagar = await this.contaPagarRepository.findOne({
      where: { id },
      relations: ['fornecedor', 'categoria', 'centroCusto', 'pagamentos'],
    });

    if (!contaPagar) {
      throw new NotFoundException(`Conta a pagar com ID ${id} não encontrada`);
    }

    return contaPagar;
  }

  async update(
    id: string,
    updateContaPagarDto: UpdateContaPagarDto,
  ): Promise<ContaPagar> {
    const contaPagar = await this.findOne(id);

    if (contaPagar.status === StatusContaPagar.PAGO) {
      throw new BadRequestException('Não é possível editar uma conta já paga');
    }

    if (updateContaPagarDto.data_vencimento) {
      updateContaPagarDto.data_vencimento = parseDateLocal(
        updateContaPagarDto.data_vencimento as any,
      ) as any;
    }

    if (updateContaPagarDto.data_emissao) {
      updateContaPagarDto.data_emissao = parseDateLocal(
        updateContaPagarDto.data_emissao as any,
      ) as any;
    }

    Object.assign(contaPagar, updateContaPagarDto);

    // Verificar se está vencida
    if (contaPagar.data_vencimento < new Date() && contaPagar.status === StatusContaPagar.PENDENTE) {
      contaPagar.status = StatusContaPagar.VENCIDO;
    }

    return await this.contaPagarRepository.save(contaPagar);
  }

  async cancel(id: string): Promise<ContaPagar> {
    const contaPagar = await this.findOne(id);

    if (contaPagar.status === StatusContaPagar.PAGO) {
      throw new BadRequestException('Não é possível cancelar uma conta já paga');
    }

    contaPagar.status = StatusContaPagar.CANCELADO;
    return await this.contaPagarRepository.save(contaPagar);
  }

  async registrarPagamento(
    id: string,
    valorPago: number,
    dataPagamento: Date,
    formaPagamento: string,
    observacoes?: string,
  ): Promise<ContaPagar> {
    const contaPagar = await this.findOne(id);

    if (contaPagar.status === StatusContaPagar.PAGO) {
      throw new BadRequestException('Esta conta já foi paga');
    }

    if (contaPagar.status === StatusContaPagar.CANCELADO) {
      throw new BadRequestException('Não é possível pagar uma conta cancelada');
    }

    // Criar registro de pagamento
    const pagamento = this.pagamentoRepository.create({
      conta_pagar_id: id,
      valor_pago: valorPago,
      data_pagamento: dataPagamento,
      forma_pagamento: formaPagamento as any,
      observacoes,
    });

    await this.pagamentoRepository.save(pagamento);

    // Calcular total pago
    const totalPago = await this.calcularTotalPago(id);

    // Atualizar status se totalmente pago
    if (totalPago >= Number(contaPagar.valor)) {
      contaPagar.status = StatusContaPagar.PAGO;
    }

    return await this.contaPagarRepository.save(contaPagar);
  }

  private async calcularTotalPago(contaPagarId: string): Promise<number> {
    const pagamentos = await this.pagamentoRepository.find({
      where: { conta_pagar_id: contaPagarId },
    });

    return pagamentos.reduce((total, pagamento) => total + Number(pagamento.valor_pago), 0);
  }

  private async atualizarStatusVencidas(): Promise<void> {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    await this.contaPagarRepository.update(
      {
        status: StatusContaPagar.PENDENTE,
        data_vencimento: Between(new Date('1900-01-01'), hoje),
      },
      {
        status: StatusContaPagar.VENCIDO,
      },
    );
  }
}





