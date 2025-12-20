import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CentroCustoService } from './centro-custo.service';
import { CentroCustoController } from './centro-custo.controller';
import { CentroCusto } from './entities/centro-custo.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CentroCusto])],
  controllers: [CentroCustoController],
  providers: [CentroCustoService],
  exports: [CentroCustoService],
})
export class CentroCustoModule {}





