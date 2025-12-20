import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Fornecedor } from './entities/fornecedor.entity';
import { CreateFornecedorDto } from './dto/create-fornecedor.dto';
import { UpdateFornecedorDto } from './dto/update-fornecedor.dto';

@Injectable()
export class FornecedorService {
  constructor(
    @InjectRepository(Fornecedor)
    private fornecedorRepository: Repository<Fornecedor>,
  ) {}

  async create(createFornecedorDto: CreateFornecedorDto): Promise<Fornecedor> {
    // Converter strings vazias em null para campos únicos
    const dadosLimpos = {
      ...createFornecedorDto,
      cnpj: createFornecedorDto.cnpj?.trim() || null,
      cpf: createFornecedorDto.cpf?.trim() || null,
      email: createFornecedorDto.email?.trim() || null,
    };

    // Verificar se CNPJ já existe (se foi informado)
    if (dadosLimpos.cnpj) {
      const cnpjExistente = await this.fornecedorRepository.findOne({
        where: { cnpj: dadosLimpos.cnpj },
      });
      if (cnpjExistente) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    // Verificar se CPF já existe (se foi informado)
    if (dadosLimpos.cpf) {
      const cpfExistente = await this.fornecedorRepository.findOne({
        where: { cpf: dadosLimpos.cpf },
      });
      if (cpfExistente) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    const fornecedor = this.fornecedorRepository.create(dadosLimpos);
    return await this.fornecedorRepository.save(fornecedor);
  }

  async findAll(): Promise<Fornecedor[]> {
    return await this.fornecedorRepository.find({
      where: { ativo: true },
      order: { nome: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Fornecedor> {
    const fornecedor = await this.fornecedorRepository.findOne({
      where: { id },
      relations: ['contasPagar'],
    });

    if (!fornecedor) {
      throw new NotFoundException(`Fornecedor com ID ${id} não encontrado`);
    }

    return fornecedor;
  }

  async update(
    id: string,
    updateFornecedorDto: UpdateFornecedorDto,
  ): Promise<Fornecedor> {
    const fornecedor = await this.findOne(id);
    
    // Converter strings vazias em null para campos únicos
    const dadosLimpos = {
      ...updateFornecedorDto,
      cnpj: updateFornecedorDto.cnpj?.trim() || null,
      cpf: updateFornecedorDto.cpf?.trim() || null,
      email: updateFornecedorDto.email?.trim() || null,
    };

    // Verificar duplicatas apenas se o valor foi alterado
    if (dadosLimpos.cnpj && dadosLimpos.cnpj !== fornecedor.cnpj) {
      const cnpjExistente = await this.fornecedorRepository.findOne({
        where: { cnpj: dadosLimpos.cnpj },
      });
      if (cnpjExistente) {
        throw new ConflictException('CNPJ já cadastrado');
      }
    }

    if (dadosLimpos.cpf && dadosLimpos.cpf !== fornecedor.cpf) {
      const cpfExistente = await this.fornecedorRepository.findOne({
        where: { cpf: dadosLimpos.cpf },
      });
      if (cpfExistente) {
        throw new ConflictException('CPF já cadastrado');
      }
    }

    Object.assign(fornecedor, dadosLimpos);
    return await this.fornecedorRepository.save(fornecedor);
  }

  async remove(id: string): Promise<void> {
    const fornecedor = await this.findOne(id);
    fornecedor.ativo = false;
    await this.fornecedorRepository.save(fornecedor);
  }
}





