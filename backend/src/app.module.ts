import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig } from './config/database.config';
import { FornecedorModule } from './modules/fornecedor/fornecedor.module';
import { CategoriaModule } from './modules/categoria/categoria.module';
import { CentroCustoModule } from './modules/centro-custo/centro-custo.module';
import { ContaPagarModule } from './modules/conta-pagar/conta-pagar.module';
import { PagamentoModule } from './modules/pagamento/pagamento.module';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    FornecedorModule,
    CategoriaModule,
    CentroCustoModule,
    ContaPagarModule,
    PagamentoModule,
  ],
})
export class AppModule {}


