import { useEffect, useState } from 'react';
import { pagamentoService } from '../services/pagamento.service';
import { Pagamento } from '../types';
import { formatarValor, formatarData } from '../utils/formatters';

const Pagamentos = () => {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPagamentos();
  }, []);

  const loadPagamentos = async () => {
    try {
      const data = await pagamentoService.getAll();
      setPagamentos(data);
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      alert('Erro ao carregar pagamentos');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Histórico de Pagamentos</h1>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Data</th>
              <th>Fornecedor</th>
              <th>Descrição</th>
              <th>Valor Pago</th>
              <th>Forma de Pagamento</th>
              <th>Observações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Nenhum pagamento registrado
                </td>
              </tr>
            ) : (
              pagamentos.map((pagamento) => (
                <tr key={pagamento.id}>
                  <td>
                    {formatarData(pagamento.data_pagamento)}
                  </td>
                  <td>
                    {pagamento.contaPagar?.fornecedor?.nome || '-'}
                  </td>
                  <td>{pagamento.contaPagar?.descricao || '-'}</td>
                  <td>{formatarValor(pagamento.valor_pago, { incluirMoeda: true })}</td>
                  <td>{pagamento.forma_pagamento}</td>
                  <td>{pagamento.observacoes || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pagamentos;





