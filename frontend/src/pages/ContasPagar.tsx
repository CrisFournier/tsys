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
import SelectWithCreate from '../components/SelectWithCreate';
import { getErrorMessage } from '../utils/errorHandler';
import { formatarValor, converterParaNumero, formatarData } from '../utils/formatters';

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
  // Estado para o valor do input (string) durante a digitação
  const [valorInput, setValorInput] = useState<string>('');

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
      
      // Garantir que valor seja sempre um número decimal com 2 casas
      if (dadosParaEnviar.valor !== undefined) {
        dadosParaEnviar.valor = converterParaNumero(dadosParaEnviar.valor);
      }

      if (editingConta) {
        await contaPagarService.update(editingConta.id, dadosParaEnviar);
      } else {
        await contaPagarService.create(dadosParaEnviar);
      }
      setShowModal(false);
      setEditingConta(null);
      resetForm();
      // Aguardar o recarregamento para garantir que a atualização seja refletida
      await loadContas();
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
    // Garantir que valor seja sempre um número decimal com 2 casas
    const valorRaw = conta.valor as number | string;
    const valorNumerico = converterParaNumero(valorRaw);
    
    setFormData({
      ...conta,
      valor: valorNumerico,
      data_vencimento: conta.data_vencimento.split('T')[0],
      data_emissao: conta.data_emissao.split('T')[0],
      recorrente: conta.recorrente || false,
      periodicidade: conta.periodicidade,
    });
    // Inicializar o valor do input sem formatação forçada (para permitir edição livre)
    setValorInput(valorNumerico > 0 ? valorNumerico.toString().replace('.', ',') : '');
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
    setValorInput('');
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
                  <td>{formatarValor(conta.valor, { incluirMoeda: true })}</td>
                  <td>
                    {formatarData(conta.data_vencimento)}
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
                  type="text"
                  className="form-input"
                  value={valorInput}
                  onChange={(e) => {
                    // Permite apenas números, vírgula, ponto e hífen
                    let value = e.target.value.replace(/[^\d,.-]/g, '');
                    
                    // Garante que só tenha um separador decimal (vírgula ou ponto)
                    const partesVirgula = value.split(',');
                    const partesPonto = value.split('.');
                    
                    // Se tiver múltiplas vírgulas ou pontos, mantém apenas o primeiro
                    if (partesVirgula.length > 2) {
                      value = partesVirgula[0] + ',' + partesVirgula.slice(1).join('');
                    }
                    if (partesPonto.length > 2) {
                      value = partesPonto[0] + '.' + partesPonto.slice(1).join('');
                    }
                    
                    // Se tiver vírgula e ponto, mantém apenas o último como separador decimal
                    if (value.includes(',') && value.includes('.')) {
                      const indiceVirgula = value.lastIndexOf(',');
                      const indicePonto = value.lastIndexOf('.');
                      if (indiceVirgula > indicePonto) {
                        // Vírgula é o separador decimal, remove pontos
                        value = value.replace(/\./g, '');
                      } else {
                        // Ponto é o separador decimal, remove vírgulas
                        value = value.replace(/,/g, '');
                      }
                    }
                    
                    // Atualiza o estado do input (string) - permite deletar normalmente
                    setValorInput(value);
                    
                    // Converte para número e atualiza formData em background
                    // Se o campo estiver vazio, define como 0
                    const numValue = value === '' ? 0 : converterParaNumero(value);
                    setFormData({ ...formData, valor: numValue });
                  }}
                  onBlur={(e) => {
                    // Quando sai do campo, formata o valor com 2 casas decimais e vírgula
                    const numValue = converterParaNumero(e.target.value);
                    if (numValue > 0) {
                      const valorFormatado = formatarValor(numValue, { permiteVazio: true });
                      setValorInput(valorFormatado);
                    } else {
                      setValorInput('');
                    }
                    setFormData({ ...formData, valor: numValue });
                  }}
                  onFocus={(e) => {
                    // Quando foca no campo, remove a formatação para facilitar edição
                    // Converte o valor formatado de volta para formato editável
                    const valorAtual = e.target.value;
                    if (valorAtual) {
                      // Remove vírgula e formatação, mantém apenas números e um separador
                      const valorEditavel = valorAtual.replace(/,/g, '.').replace(/[^\d.-]/g, '');
                      // Se tiver decimais, converte ponto para vírgula para edição
                      const valorLimpo = valorEditavel.includes('.') 
                        ? valorEditavel.replace('.', ',')
                        : valorEditavel;
                      setValorInput(valorLimpo);
                    }
                  }}
                  placeholder="R$ 0,00"
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





