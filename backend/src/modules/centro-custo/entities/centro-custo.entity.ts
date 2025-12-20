import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ContaPagar } from '../../conta-pagar/entities/conta-pagar.entity';

@Entity('centro_custo')
export class CentroCusto {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  nome: string;

  @Column({ type: 'text', nullable: true })
  descricao: string;

  @Column({ type: 'boolean', default: true })
  ativo: boolean;

  @CreateDateColumn()
  created_at: Date;

  @OneToMany(() => ContaPagar, (contaPagar) => contaPagar.centroCusto)
  contasPagar: ContaPagar[];
}





