import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ContaPagar } from '../../conta-pagar/entities/conta-pagar.entity';

export enum FormaPagamento {
  DINHEIRO = 'DINHEIRO',
  PIX = 'PIX',
  TED = 'TED',
  BOLETO = 'BOLETO',
  CARTAO_CREDITO = 'CARTAO_CREDITO',
  CARTAO_DEBITO = 'CARTAO_DEBITO',
  OUTROS = 'OUTROS',
}

@Entity('pagamento')
export class Pagamento {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  conta_pagar_id: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  valor_pago: number;

  @Column({ type: 'date' })
  data_pagamento: Date;

  @Column({
    type: 'enum',
    enum: FormaPagamento,
  })
  forma_pagamento: FormaPagamento;

  @Column({ type: 'text', nullable: true })
  observacoes: string;

  @CreateDateColumn()
  created_at: Date;

  @ManyToOne(() => ContaPagar, (contaPagar) => contaPagar.pagamentos)
  @JoinColumn({ name: 'conta_pagar_id' })
  contaPagar: ContaPagar;
}



