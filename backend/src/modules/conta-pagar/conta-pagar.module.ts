import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ContaPagarService } from './conta-pagar.service';
import { ContaPagarController } from './conta-pagar.controller';
import { ContaPagar } from './entities/conta-pagar.entity';
import { Pagamento } from '../pagamento/entities/pagamento.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ContaPagar, Pagamento])],
  controllers: [ContaPagarController],
  providers: [ContaPagarService],
  exports: [ContaPagarService],
})
export class ContaPagarModule {}




