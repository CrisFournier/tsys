import { useEffect, useState } from 'react';
import { contaPagarService } from '../services/conta-pagar.service';
import { ContaPagar } from '../types';
import { format } from 'date-fns';

const Dashboard = () => {
  const [contas, setContas] = useState<ContaPagar[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await contaPagarService.getAll();
      setContas(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  const totalPagar = contas
    .filter((c) => c.status === 'PENDENTE' || c.status === 'VENCIDO')
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const totalVencidas = contas
    .filter((c) => c.status === 'VENCIDO')
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const totalPagas = contas
    .filter((c) => c.status === 'PAGO')
    .reduce((sum, c) => sum + Number(c.valor), 0);

  const contasVencidas = contas.filter((c) => c.status === 'VENCIDO').length;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  };

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totalPagar)}</div>
          <div className="stat-label">Total a Pagar</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            {formatCurrency(totalVencidas)}
          </div>
          <div className="stat-label">Vencidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {formatCurrency(totalPagas)}
          </div>
          <div className="stat-label">Total Pagas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{contasVencidas}</div>
          <div className="stat-label">Contas Vencidas</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h2 className="card-title">Contas Vencidas</h2>
        </div>
        {contas.filter((c) => c.status === 'VENCIDO').length === 0 ? (
          <p>Nenhuma conta vencida.</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Fornecedor</th>
                <th>Descrição</th>
                <th>Valor</th>
                <th>Vencimento</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {contas
                .filter((c) => c.status === 'VENCIDO')
                .slice(0, 10)
                .map((conta) => (
                  <tr key={conta.id}>
                    <td>{conta.fornecedor?.nome || '-'}</td>
                    <td>{conta.descricao}</td>
                    <td>{formatCurrency(Number(conta.valor))}</td>
                    <td>
                      {format(new Date(conta.data_vencimento), 'dd/MM/yyyy')}
                    </td>
                    <td>
                      <span className="badge badge-vencido">
                        {conta.status}
                      </span>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Dashboard;




