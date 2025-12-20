import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CentroCusto } from './entities/centro-custo.entity';
import { CreateCentroCustoDto } from './dto/create-centro-custo.dto';
import { UpdateCentroCustoDto } from './dto/update-centro-custo.dto';

@Injectable()
export class CentroCustoService {
  constructor(
    @InjectRepository(CentroCusto)
    private centroCustoRepository: Repository<CentroCusto>,
  ) {}

  async create(
    createCentroCustoDto: CreateCentroCustoDto,
  ): Promise<CentroCusto> {
    const centroCusto =
      this.centroCustoRepository.create(createCentroCustoDto);
    return await this.centroCustoRepository.save(centroCusto);
  }

  async findAll(): Promise<CentroCusto[]> {
    return await this.centroCustoRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<CentroCusto> {
    const centroCusto = await this.centroCustoRepository.findOne({
      where: { id },
    });

    if (!centroCusto) {
      throw new NotFoundException(`Centro de Custo com ID ${id} não encontrado`);
    }

    return centroCusto;
  }

  async update(
    id: string,
    updateCentroCustoDto: UpdateCentroCustoDto,
  ): Promise<CentroCusto> {
    const centroCusto = await this.findOne(id);
    Object.assign(centroCusto, updateCentroCustoDto);
    return await this.centroCustoRepository.save(centroCusto);
  }

  async remove(id: string): Promise<void> {
    const centroCusto = await this.findOne(id);
    centroCusto.ativo = false;
    await this.centroCustoRepository.save(centroCusto);
  }
}



