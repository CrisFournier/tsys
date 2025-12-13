---
name: TSYS Financeiro MVP
overview: "Criar MVP do sistema ERP TSYS Financeiro com NestJS, PostgreSQL e React, implementando o fluxo básico: Cadastro de Fornecedor → Registro de Conta a Pagar → Baixa de Pagamentos."
todos: []
---

# TSYS Financeiro - MVP

## Visão Geral

Sistema ERP financeiro desenvolvido com NestJS (backend) e React (frontend), utilizando PostgreSQL como banco de dados. O MVP foca no módulo de Gestão Financeira, especificamente no fluxo básico de Contas a Pagar.

## Stack Tecnológica

### Backend

- **NestJS** - Framework Node.js com TypeScript
- **PostgreSQL** - Banco de dados relacional
- **TypeORM** - ORM para gerenciamento de entidades
- **class-validator** - Validação de dados
- **class-transformer** - Transformação de objetos

### Frontend

- **React** - Biblioteca para interface
- **TypeScript** - Tipagem estática
- **Axios** - Cliente HTTP para API
- **React Router** - Roteamento
- **CSS Modules ou Tailwind CSS** - Estilização

## Estrutura do Projeto

```
tsys/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/
│   │   │   ├── fornecedor/
│   │   │   ├── conta-pagar/
│   │   │   └── pagamento/
│   │   ├── common/          # DTOs, decorators, filters
│   │   ├── config/          # Configurações (DB, etc)
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/        # API calls
│   │   ├── types/           # TypeScript types
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Modelagem de Dados (MVP)

### Tabela: `fornecedor`

- `id` (UUID, PK)
- `nome` (string, obrigatório)
- `cnpj` (string, único, opcional)
- `cpf` (string, único, opcional)
- `email` (string, opcional)
- `telefone` (string, opcional)
- `endereco` (JSON, opcional)
- `observacoes` (text, opcional)
- `ativo` (boolean, default: true)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `categoria`

- `id` (UUID, PK)
- `nome` (string, obrigatório, único)
- `descricao` (text, opcional)
- `tipo` (enum: 'DESPESA', 'RECEITA')
- `created_at` (timestamp)

### Tabela: `centro_custo`

- `id` (UUID, PK)
- `nome` (string, obrigatório, único)
- `descricao` (text, opcional)
- `ativo` (boolean, default: true)
- `created_at` (timestamp)

### Tabela: `conta_pagar`

- `id` (UUID, PK)
- `fornecedor_id` (UUID, FK → fornecedor)
- `categoria_id` (UUID, FK → categoria)
- `centro_custo_id` (UUID, FK → centro_custo, opcional)
- `descricao` (string, obrigatório)
- `valor` (decimal, obrigatório)
- `data_vencimento` (date, obrigatório)
- `data_emissao` (date, obrigatório)
- `status` (enum: 'PENDENTE', 'PAGO', 'VENCIDO', 'CANCELADO')
- `observacoes` (text, opcional)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Tabela: `pagamento`

- `id` (UUID, PK)
- `conta_pagar_id` (UUID, FK → conta_pagar)
- `valor_pago` (decimal, obrigatório)
- `data_pagamento` (date, obrigatório)
- `forma_pagamento` (enum: 'DINHEIRO', 'PIX', 'TED', 'BOLETO', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'OUTROS')
- `observacoes` (text, opcional)
- `created_at` (timestamp)

## Endpoints da API (MVP)

### Fornecedores

- `GET /api/fornecedores` - Listar todos
- `GET /api/fornecedores/:id` - Buscar por ID
- `POST /api/fornecedores` - Criar
- `PUT /api/fornecedores/:id` - Atualizar
- `DELETE /api/fornecedores/:id` - Deletar (soft delete)

### Contas a Pagar

- `GET /api/contas-pagar` - Listar (com filtros: status, fornecedor, período)
- `GET /api/contas-pagar/:id` - Buscar por ID
- `POST /api/contas-pagar` - Criar
- `PUT /api/contas-pagar/:id` - Atualizar
- `DELETE /api/contas-pagar/:id` - Cancelar
- `POST /api/contas-pagar/:id/pagar` - Registrar pagamento

### Pagamentos

- `GET /api/pagamentos` - Listar (com filtros)
- `GET /api/pagamentos/:id` - Buscar por ID
- `PUT /api/pagamentos/:id` - Atualizar
- `DELETE /api/pagamentos/:id` - Deletar (estornar)

### Categorias e Centros de Custo

- Endpoints CRUD básicos para ambas entidades

## Funcionalidades do Frontend (MVP)

### Páginas Principais

1. **Dashboard** - Visão geral (total a pagar, vencidas, pagas)
2. **Fornecedores** - Listagem e cadastro
3. **Contas a Pagar** - Listagem, cadastro, filtros
4. **Pagamentos** - Histórico de pagamentos

### Componentes Reutilizáveis

- Formulário de Fornecedor
- Formulário de Conta a Pagar
- Tabela de listagem
- Modal de confirmação
- Filtros de busca
- Cards de resumo financeiro

## Implementação

### Fase 1: Setup Inicial

1. Criar estrutura de pastas
2. Configurar NestJS com TypeORM e PostgreSQL
3. Configurar React com TypeScript
4. Configurar scripts de desenvolvimento

### Fase 2: Backend - Entidades e Migrations

1. Criar entidades (Fornecedor, Categoria, CentroCusto, ContaPagar, Pagamento)
2. Configurar relacionamentos
3. Criar migrations do banco
4. Seeders básicos (categorias padrão)

### Fase 3: Backend - Módulos e Controllers

1. Módulo de Fornecedor (CRUD completo)
2. Módulo de Conta a Pagar (CRUD + lógica de status)
3. Módulo de Pagamento (registro e estorno)
4. Validações e tratamento de erros

### Fase 4: Frontend - Estrutura Base

1. Configurar roteamento
2. Criar serviços de API (Axios)
3. Criar tipos TypeScript
4. Layout base com navegação

### Fase 5: Frontend - Páginas e Funcionalidades

1. Página de Fornecedores (listagem e cadastro)
2. Página de Contas a Pagar (listagem, cadastro, filtros)
3. Modal/formulário de pagamento
4. Dashboard com resumo financeiro

### Fase 6: Melhorias e Testes

1. Validações no frontend
2. Feedback visual (loading, erros, sucesso)
3. Testes básicos de integração
4. Documentação da API

## Próximos Passos (Pós-MVP)

- Módulo de Contas a Receber
- Módulo Fiscal (importação XML)
- Autenticação e autorização
- Relatórios e gráficos
- Exportação de dados
- Provisionamento futuro