import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagamentoService } from './pagamento.service';
import { PagamentoController } from './pagamento.controller';
import { Pagamento } from './entities/pagamento.entity';
import { ContaPagar } from '../conta-pagar/entities/conta-pagar.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Pagamento, ContaPagar])],
  controllers: [PagamentoController],
  providers: [PagamentoService],
  exports: [PagamentoService],
})
export class PagamentoModule {}




