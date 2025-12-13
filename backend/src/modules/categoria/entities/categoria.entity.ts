import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ContaPagar } from '../../conta-pagar/entities/conta-pagar.entity';

export enum TipoCategoria {
  DESPESA = 'DESPESA',
  RECEITA = 'RECEITA',
}

@Entity('categoria')
export class Categoria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({
    type: 'enum',
    enum: TipoCategoria,
    default: TipoCategoria.DESPESA,
  })
  tipo: TipoCategoria;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ContaPagar, (contaPagar) => contaPagar.categoria)
  contasPagar: ContaPagar[];
}


