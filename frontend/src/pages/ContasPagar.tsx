import { useEffect, useState } from 'react';
import { contaPagarService } from '../services/conta-pagar.service';
import { fornecedorService } from '../services/fornecedor.service';
import { categoriaService } from '../services/categoria.service';
import { centroCustoService } from '../services/centro-custo.service';
import {
  ContaPagar,
  Fornecedor,
  Categoria,
  CentroCusto,
  FormaPagamento,
  PeriodicidadeRecorrente,
} from '../types';
import { format } from 'date-fns';
import SelectWithCreate from '../components/SelectWithCreate';
import { getErrorMessage } from '../utils/errorHandler';

const ContasPagar = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [centrosCusto, setCentrosCusto] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPagamentoModal, setShowPagamentoModal] = useState(false);
  const [selectedConta, setSelectedConta] = useState<ContaPagar | null>(null);
  const [editingConta, setEditingConta] = useState<ContaPagar | null>(null);
  const [filters, setFilters] = useState({ status: '', fornecedor_id: '' });
  const [formData, setFormData] = useState<Partial<ContaPagar>>({
    fornecedor_id: '',
    categoria_id: '',
    centro_custo_id: '',
    descricao: '',
    valor: 0,
    data_vencimento: '',
    data_emissao: '',
    recorrente: false,
    periodicidade: undefined,
    observacoes: '',
  });
  const [pagamentoData, setPagamentoData] = useState({
    valor_pago: 0,
    data_pagamento: new Date().toISOString().split('T')[0],
    forma_pagamento: 'PIX' as FormaPagamento,
    observacoes: '',
  });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadContas();
  }, [filters]);

  const loadData = async () => {
    try {
      const [fornecedoresData, categoriasData, centrosCustoData] = await Promise.all([
        fornecedorService.getAll(),
        categoriaService.getAll(),
        centroCustoService.getAll(),
      ]);
      setFornecedores(fornecedoresData);
      setCategorias(categoriasData);
      setCentrosCusto(centrosCustoData);
      await loadContas();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao carregar dados:', error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const loadContas = async () => {
    try {
      const filterParams: any = {};
      if (filters.status) filterParams.status = filters.status;
      if (filters.fornecedor_id) filterParams.fornecedor_id = filters.fornecedor_id;
      const data = await contaPagarService.getAll(filterParams);
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar contas:', error);
    }
  };

  const handleCreateCategoria = async (nome: string): Promise<Categoria> => {
    const novaCategoria = await categoriaService.create({
      nome,
      tipo: 'DESPESA',
    });
    setCategorias([...categorias, novaCategoria]);
    return novaCategoria;
  };

  const handleCreateCentroCusto = async (nome: string): Promise<CentroCusto> => {
    const novoCentroCusto = await centroCustoService.create({
      nome,
      ativo: true,
    });
    setCentrosCusto([...centrosCusto, novoCentroCusto]);
    return novoCentroCusto;
  };

  const getCamposPermitidos = (data: Partial<ContaPagar>) => {
    const { id, created_at, updated_at, fornecedor, categoria, centroCusto, pagamentos, ...camposPermitidos } = data;
    return camposPermitidos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = getCamposPermitidos(formData);

      if (editingConta) {
        await contaPagarService.update(editingConta.id, dadosParaEnviar);
      } else {
        await contaPagarService.create(dadosParaEnviar);
      }
      setShowModal(false);
      setEditingConta(null);
      resetForm();
      loadContas();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao salvar conta:', error);
      alert(errorMessage);
    }
  };

  const handlePagar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedConta) return;
    try {
      await contaPagarService.pagar(selectedConta.id, pagamentoData);
      setShowPagamentoModal(false);
      setSelectedConta(null);
      setPagamentoData({
        valor_pago: 0,
        data_pagamento: new Date().toISOString().split('T')[0],
        forma_pagamento: 'PIX',
        observacoes: '',
      });
      loadContas();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao registrar pagamento:', error);
      alert(errorMessage);
    }
  };

  const handleEdit = (conta: ContaPagar) => {
    setEditingConta(conta);
    setFormData({
      ...conta,
      data_vencimento: conta.data_vencimento.split('T')[0],
      data_emissao: conta.data_emissao.split('T')[0],
      recorrente: conta.recorrente || false,
      periodicidade: conta.periodicidade,
    });
    setShowModal(true);
  };

  const handleCancel = async (id: string) => {
    if (confirm('Tem certeza que deseja cancelar esta conta?')) {
      try {
        await contaPagarService.cancel(id);
        loadContas();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Erro ao cancelar conta:', error);
        alert(errorMessage);
      }
    }
  };

  const handleNew = () => {
    setEditingConta(null);
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      fornecedor_id: '',
      categoria_id: '',
      centro_custo_id: '',
      descricao: '',
      valor: 0,
      data_vencimento: '',
      data_emissao: '',
      recorrente: false,
      periodicidade: undefined,
      observacoes: '',
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  const getStatusBadgeClass = (status: string) => {
    const statusMap: Record<string, string> = {
      PENDENTE: 'badge-pendente',
      PAGO: 'badge-pago',
      VENCIDO: 'badge-vencido',
      CANCELADO: 'badge-cancelado',
    };
    return statusMap[status] || 'badge-secondary';
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Contas a Pagar</h1>
          <button className="btn btn-primary" onClick={handleNew}>
            Nova Conta
          </button>
        </div>

        <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
          >
            <option value="">Todos os Status</option>
            <option value="PENDENTE">Pendente</option>
            <option value="PAGO">Pago</option>
            <option value="VENCIDO">Vencido</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
          <select
            className="form-select"
            style={{ width: 'auto' }}
            value={filters.fornecedor_id}
            onChange={(e) => setFilters({ ...filters, fornecedor_id: e.target.value })}
          >
            <option value="">Todos os Fornecedores</option>
            {fornecedores.map((f) => (
              <option key={f.id} value={f.id}>
                {f.nome}
              </option>
            ))}
          </select>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Fornecedor</th>
              <th>Descrição</th>
              <th>Valor</th>
              <th>Vencimento</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {contas.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Nenhuma conta encontrada
                </td>
              </tr>
            ) : (
              contas.map((conta) => (
                <tr key={conta.id}>
                  <td>{conta.fornecedor?.nome || '-'}</td>
                  <td>{conta.descricao}</td>
                  <td>{formatCurrency(Number(conta.valor))}</td>
                  <td>
                    {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}
                  </td>
                  <td>
                    <span className={`badge ${getStatusBadgeClass(conta.status)}`}>
                      {conta.status}
                    </span>
                  </td>
                  <td>
                    {conta.status !== 'PAGO' && conta.status !== 'CANCELADO' && (
                      <>
                        <button
                          className="btn btn-success"
                          style={{ marginRight: '0.5rem' }}
                          onClick={() => {
                            setSelectedConta(conta);
                            setPagamentoData({
                              ...pagamentoData,
                              valor_pago: Number(conta.valor),
                            });
                            setShowPagamentoModal(true);
                          }}
                        >
                          Pagar
                        </button>
                        <button
                          className="btn btn-secondary"
                          style={{ marginRight: '0.5rem' }}
                          onClick={() => handleEdit(conta)}
                        >
                          Editar
                        </button>
                      </>
                    )}
                    {conta.status !== 'PAGO' && (
                      <button
                        className="btn btn-danger"
                        onClick={() => handleCancel(conta.id)}
                      >
                        Cancelar
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">
                {editingConta ? 'Editar Conta' : 'Nova Conta a Pagar'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Fornecedor *</label>
                <select
                  className="form-select"
                  value={formData.fornecedor_id}
                  onChange={(e) =>
                    setFormData({ ...formData, fornecedor_id: e.target.value })
                  }
                  required
                >
                  <option value="">Selecione...</option>
                  {fornecedores.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nome}
                    </option>
                  ))}
                </select>
              </div>
              <SelectWithCreate
                value={formData.categoria_id || ''}
                onChange={(value) =>
                  setFormData({ ...formData, categoria_id: value })
                }
                options={categorias}
                onCreate={handleCreateCategoria}
                placeholder="Selecione ou digite para criar..."
                label="Categoria"
                required
              />
              <SelectWithCreate
                value={formData.centro_custo_id || ''}
                onChange={(value) =>
                  setFormData({ ...formData, centro_custo_id: value })
                }
                options={centrosCusto}
                onCreate={handleCreateCentroCusto}
                placeholder="Selecione ou digite para criar..."
                label="Centro de Custo"
                required={false}
              />
              <div className="form-group">
                <label className="form-label">Descrição *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.descricao}
                  onChange={(e) =>
                    setFormData({ ...formData, descricao: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Valor *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={formData.valor}
                  onChange={(e) =>
                    setFormData({ ...formData, valor: parseFloat(e.target.value) })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Emissão *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.data_emissao}
                  onChange={(e) =>
                    setFormData({ ...formData, data_emissao: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Vencimento *</label>
                <input
                  type="date"
                  className="form-input"
                  value={formData.data_vencimento}
                  onChange={(e) =>
                    setFormData({ ...formData, data_vencimento: e.target.value })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Conta Recorrente</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <input
                    type="checkbox"
                    checked={formData.recorrente || false}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        recorrente: e.target.checked,
                        periodicidade: e.target.checked
                          ? formData.periodicidade || 'MENSAL'
                          : undefined,
                      })
                    }
                  />
                  <span>Esta conta é recorrente</span>
                </div>
              </div>
              {formData.recorrente && (
                <div className="form-group">
                  <label className="form-label">Periodicidade *</label>
                  <select
                    className="form-select"
                    value={formData.periodicidade || 'MENSAL'}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        periodicidade: e.target.value as PeriodicidadeRecorrente,
                      })
                    }
                    required={formData.recorrente}
                  >
                    <option value="SEMANAL">Semanal</option>
                    <option value="MENSAL">Mensal</option>
                    <option value="ANUAL">Anual</option>
                  </select>
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary">
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showPagamentoModal && selectedConta && (
        <div className="modal" onClick={() => setShowPagamentoModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Registrar Pagamento</h2>
              <button
                className="modal-close"
                onClick={() => setShowPagamentoModal(false)}
              >
                ×
              </button>
            </div>
            <form onSubmit={handlePagar}>
              <div className="form-group">
                <label className="form-label">Valor a Pagar *</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  value={pagamentoData.valor_pago}
                  onChange={(e) =>
                    setPagamentoData({
                      ...pagamentoData,
                      valor_pago: parseFloat(e.target.value),
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Data de Pagamento *</label>
                <input
                  type="date"
                  className="form-input"
                  value={pagamentoData.data_pagamento}
                  onChange={(e) =>
                    setPagamentoData({
                      ...pagamentoData,
                      data_pagamento: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Forma de Pagamento *</label>
                <select
                  className="form-select"
                  value={pagamentoData.forma_pagamento}
                  onChange={(e) =>
                    setPagamentoData({
                      ...pagamentoData,
                      forma_pagamento: e.target.value as FormaPagamento,
                    })
                  }
                  required
                >
                  <option value="PIX">PIX</option>
                  <option value="TED">TED</option>
                  <option value="BOLETO">Boleto</option>
                  <option value="DINHEIRO">Dinheiro</option>
                  <option value="CARTAO_CREDITO">Cartão de Crédito</option>
                  <option value="CARTAO_DEBITO">Cartão de Débito</option>
                  <option value="OUTROS">Outros</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={pagamentoData.observacoes}
                  onChange={(e) =>
                    setPagamentoData({
                      ...pagamentoData,
                      observacoes: e.target.value,
                    })
                  }
                />
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPagamentoModal(false)}
                >
                  Cancelar
                </button>
                <button type="submit" className="btn btn-success">
                  Registrar Pagamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContasPagar;



