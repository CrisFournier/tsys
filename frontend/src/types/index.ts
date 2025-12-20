export interface Fornecedor {
  id: string;
  nome: string;
  cnpj?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    estado?: string;
    cep?: string;
  };
  observacoes?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Categoria {
  id: string;
  nome: string;
  descricao?: string;
  tipo: 'DESPESA' | 'RECEITA';
  created_at: string;
}

export interface CentroCusto {
  id: string;
  nome: string;
  descricao?: string;
  ativo: boolean;
  created_at: string;
}

export type StatusContaPagar = 'PENDENTE' | 'PAGO' | 'VENCIDO' | 'CANCELADO';

export type PeriodicidadeRecorrente = 'SEMANAL' | 'MENSAL' | 'ANUAL';

export interface ContaPagar {
  id: string;
  fornecedor_id: string;
  categoria_id: string;
  centro_custo_id?: string;
  descricao: string;
  valor: number;
  data_vencimento: string;
  data_emissao: string;
  status: StatusContaPagar;
  recorrente: boolean;
  periodicidade?: PeriodicidadeRecorrente;
  observacoes?: string;
  created_at: string;
  updated_at: string;
  fornecedor?: Fornecedor;
  categoria?: Categoria;
  centroCusto?: CentroCusto;
  pagamentos?: Pagamento[];
}

export type FormaPagamento =
  | 'DINHEIRO'
  | 'PIX'
  | 'TED'
  | 'BOLETO'
  | 'CARTAO_CREDITO'
  | 'CARTAO_DEBITO'
  | 'OUTROS';

export interface Pagamento {
  id: string;
  conta_pagar_id: string;
  valor_pago: number;
  data_pagamento: string;
  forma_pagamento: FormaPagamento;
  observacoes?: string;
  created_at: string;
  contaPagar?: ContaPagar;
}





