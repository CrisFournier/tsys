import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Fornecedor } from '../../fornecedor/entities/fornecedor.entity';
import { Categoria } from '../../categoria/entities/categoria.entity';
import { CentroCusto } from '../../centro-custo/entities/centro-custo.entity';
import { Pagamento } from '../../pagamento/entities/pagamento.entity';

export enum StatusContaPagar {
  PENDENTE = 'PENDENTE',
  PAGO = 'PAGO',
  VENCIDO = 'VENCIDO',
  CANCELADO = 'CANCELADO',
}

export enum PeriodicidadeRecorrente {
  SEMANAL = 'SEMANAL',
  MENSAL = 'MENSAL',
  ANUAL = 'ANUAL',
}

@Entity('conta_pagar')
export class ContaPagar {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  fornecedor_id: string;

  @Column({ type: 'uuid' })
  categoria_id: string;

  @Column({ type: 'uuid', nullable: true })
  centro_custo_id: string;

  @Column({ type: 'varchar', length: 255 })
  descricao: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor: number;

  @Column({ type: 'date' })
  data_vencimento: Date;

  @Column({ type: 'date' })
  data_emissao: Date;

  @Column({
    type: 'enum',
    enum: StatusContaPagar,
    default: StatusContaPagar.PENDENTE,
  })
  status: StatusContaPagar;

  @Column({ type: 'boolean', default: false })
  recorrente: boolean;

  @Column({
    type: 'enum',
    enum: PeriodicidadeRecorrente,
    nullable: true,
  })
  periodicidade?: PeriodicidadeRecorrente;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => Fornecedor, (fornecedor) => fornecedor.contasPagar)
  @JoinColumn({ name: 'fornecedor_id' })
  fornecedor: Fornecedor;

  @ManyToOne(() => Categoria, (categoria) => categoria.contasPagar)
  @JoinColumn({ name: 'categoria_id' })
  categoria: Categoria;

  @ManyToOne(() => CentroCusto, (centroCusto) => centroCusto.contasPagar)
  @JoinColumn({ name: 'centro_custo_id' })
  centroCusto: CentroCusto;

  @OneToMany(() => Pagamento, (pagamento) => pagamento.contaPagar)
  pagamentos: Pagamento[];
}




