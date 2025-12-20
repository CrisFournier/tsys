# TSYS Financeiro

Sistema ERP financeiro desenvolvido para controle de gestão financeira da Tayra Systems LTDA.

## Stack Tecnológica

### Backend
- **NestJS** - Framework Node.js com TypeScript
- **PostgreSQL** - Banco de dados relacional
- **TypeORM** - ORM para gerenciamento de entidades

### Frontend
- **React** - Biblioteca para interface
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **Axios** - Cliente HTTP para API
- **React Router** - Roteamento

## Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL (versão 12 ou superior)
- npm ou yarn

## Instalação

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd tsys
```

### 2. Configurar Backend

```bash
cd backend
npm install
```

Crie um arquivo `.env` na pasta `backend` com as seguintes variáveis:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_DATABASE=tsys_financeiro
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### 3. Configurar Banco de Dados

Crie o banco de dados PostgreSQL:

```sql
CREATE DATABASE tsys_financeiro;
```

O TypeORM irá criar as tabelas automaticamente quando você iniciar o servidor (modo development).

### 4. Configurar Frontend

```bash
cd frontend
npm install
```

## Executando a Aplicação

### Backend

```bash
cd backend
npm run start:dev
```

O servidor estará rodando em `http://localhost:3001`

### Frontend

```bash
cd frontend
npm run dev
```

A aplicação estará rodando em `http://localhost:3000`

## Funcionalidades do MVP

### Módulo de Gestão Financeira

1. **Fornecedores**
   - Cadastro completo de fornecedores
   - Edição e exclusão (soft delete)
   - Listagem de fornecedores ativos
   - Validação de CNPJ/CPF únicos
   - Validação de email opcional

2. **Contas a Pagar**
   - Cadastro de contas a pagar
   - Filtros por status e fornecedor
   - Controle automático de status (Pendente, Pago, Vencido, Cancelado)
   - Registro de pagamentos
   - Campos de recorrência (semanal, mensal, anual)
   - Criação inline de categorias e centros de custo

3. **Pagamentos**
   - Histórico de pagamentos
   - Múltiplas formas de pagamento (PIX, TED, Boleto, etc.)
   - Atualização automática do status da conta após pagamento

4. **Dashboard**
   - Visão geral financeira
   - Total a pagar
   - Contas vencidas
   - Total pago

5. **Categorias e Centros de Custo**
   - CRUD completo
   - Criação inline no formulário de contas

## Estrutura do Projeto

```
tsys/
├── backend/                 # API NestJS
│   ├── src/
│   │   ├── modules/         # Módulos da aplicação
│   │   │   ├── fornecedor/
│   │   │   ├── conta-pagar/
│   │   │   ├── pagamento/
│   │   │   ├── categoria/
│   │   │   └── centro-custo/
│   │   ├── common/          # Filtros, decorators
│   │   ├── config/          # Configurações
│   │   └── main.ts
│   └── package.json
├── frontend/                # Aplicação React
│   ├── src/
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── pages/           # Páginas da aplicação
│   │   ├── services/        # Serviços de API
│   │   ├── types/           # Tipos TypeScript
│   │   ├── utils/           # Utilitários
│   │   └── App.tsx
│   └── package.json
└── README.md
```

## Endpoints da API

### Fornecedores
- `GET /api/fornecedores` - Listar todos
- `GET /api/fornecedores/:id` - Buscar por ID
- `POST /api/fornecedores` - Criar
- `PATCH /api/fornecedores/:id` - Atualizar
- `DELETE /api/fornecedores/:id` - Deletar (soft delete)

### Contas a Pagar
- `GET /api/contas-pagar` - Listar (com filtros)
- `GET /api/contas-pagar/:id` - Buscar por ID
- `POST /api/contas-pagar` - Criar
- `PATCH /api/contas-pagar/:id` - Atualizar
- `DELETE /api/contas-pagar/:id` - Cancelar
- `POST /api/contas-pagar/:id/pagar` - Registrar pagamento

### Pagamentos
- `GET /api/pagamentos` - Listar (com filtros)
- `GET /api/pagamentos/:id` - Buscar por ID
- `POST /api/pagamentos` - Criar
- `PATCH /api/pagamentos/:id` - Atualizar
- `DELETE /api/pagamentos/:id` - Deletar (estornar)

### Categorias
- `GET /api/categorias` - Listar todas
- `POST /api/categorias` - Criar
- `PATCH /api/categorias/:id` - Atualizar
- `DELETE /api/categorias/:id` - Deletar

### Centros de Custo
- `GET /api/centros-custo` - Listar todos
- `POST /api/centros-custo` - Criar
- `PATCH /api/centros-custo/:id` - Atualizar
- `DELETE /api/centros-custo/:id` - Deletar (soft delete)

## Funcionalidades Implementadas

### Recursos Especiais

1. **SelectWithCreate Component**
   - Permite selecionar de uma lista ou criar novos itens inline
   - Usado para Categorias e Centros de Custo

2. **Tratamento de Erros Melhorado**
   - Mensagens de erro específicas e claras
   - Filtro global de exceções no backend
   - Helper de tratamento de erros no frontend

3. **Campos de Recorrência**
   - Contas podem ser marcadas como recorrentes
   - Periodicidade: Semanal, Mensal ou Anual

4. **Validações Inteligentes**
   - Email opcional com validação quando informado
   - CNPJ/CPF únicos com tratamento de strings vazias
   - Filtro de campos não permitidos no update

## Próximos Passos

- Módulo de Contas a Receber
- Módulo Fiscal (importação XML de notas fiscais)
- Autenticação e autorização
- Relatórios e gráficos
- Exportação de dados
- Provisionamento futuro

## Desenvolvimento

Este projeto foi desenvolvido como MVP para aprendizado e controle financeiro da Tayra Systems LTDA.




