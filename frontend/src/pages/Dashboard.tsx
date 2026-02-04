import { useEffect, useState } from 'react';
import { contaPagarService } from '../services/conta-pagar.service';
import { ContaPagar } from '../types';
import { formatarValor, formatarData } from '../utils/formatters';

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

  return (
    <div>
      <h1 style={{ marginBottom: '2rem', color: '#2c3e50' }}>Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{formatarValor(totalPagar, { incluirMoeda: true })}</div>
          <div className="stat-label">Total a Pagar</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#e74c3c' }}>
            {formatarValor(totalVencidas, { incluirMoeda: true })}
          </div>
          <div className="stat-label">Vencidas</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#27ae60' }}>
            {formatarValor(totalPagas, { incluirMoeda: true })}
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
                    <td>{formatarValor(conta.valor, { incluirMoeda: true })}</td>
                    <td>
                      {formatarData(conta.data_vencimento)}
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





