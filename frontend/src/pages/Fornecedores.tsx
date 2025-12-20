import { useEffect, useState } from 'react';
import { fornecedorService } from '../services/fornecedor.service';
import { Fornecedor } from '../types';
import { getErrorMessage } from '../utils/errorHandler';

const Fornecedores = () => {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFornecedor, setEditingFornecedor] = useState<Fornecedor | null>(null);
  const [formData, setFormData] = useState<Partial<Fornecedor>>({
    nome: '',
    cnpj: '',
    cpf: '',
    email: '',
    telefone: '',
    observacoes: '',
    ativo: true,
  });

  useEffect(() => {
    loadFornecedores();
  }, []);

  const loadFornecedores = async () => {
    try {
      const data = await fornecedorService.getAll();
      setFornecedores(data);
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao carregar fornecedores:', error);
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getCamposPermitidos = (data: Partial<Fornecedor>) => {
    const { id, created_at, updated_at, ...camposPermitidos } = data;
    return camposPermitidos;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const dadosParaEnviar = getCamposPermitidos(formData);

      if (editingFornecedor) {
        await fornecedorService.update(editingFornecedor.id, dadosParaEnviar);
      } else {
        await fornecedorService.create(dadosParaEnviar);
      }
      setShowModal(false);
      setEditingFornecedor(null);
      setFormData({
        nome: '',
        cnpj: '',
        cpf: '',
        email: '',
        telefone: '',
        observacoes: '',
        ativo: true,
      });
      loadFornecedores();
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      console.error('Erro ao salvar fornecedor:', error);
      alert(errorMessage);
    }
  };

  const handleEdit = (fornecedor: Fornecedor) => {
    setEditingFornecedor(fornecedor);
    setFormData(fornecedor);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este fornecedor?')) {
      try {
        await fornecedorService.delete(id);
        loadFornecedores();
      } catch (error) {
        const errorMessage = getErrorMessage(error);
        console.error('Erro ao excluir fornecedor:', error);
        alert(errorMessage);
      }
    }
  };

  const handleNew = () => {
    setEditingFornecedor(null);
    setFormData({
      nome: '',
      cnpj: '',
      cpf: '',
      email: '',
      telefone: '',
      observacoes: '',
      ativo: true,
    });
    setShowModal(true);
  };

  if (loading) {
    return <div className="card">Carregando...</div>;
  }

  return (
    <div>
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">Fornecedores</h1>
          <button className="btn btn-primary" onClick={handleNew}>
            Novo Fornecedor
          </button>
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CNPJ/CPF</th>
              <th>Email</th>
              <th>Telefone</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {fornecedores.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  Nenhum fornecedor cadastrado
                </td>
              </tr>
            ) : (
              fornecedores.map((fornecedor) => (
                <tr key={fornecedor.id}>
                  <td>{fornecedor.nome}</td>
                  <td>{fornecedor.cnpj || fornecedor.cpf || '-'}</td>
                  <td>{fornecedor.email || '-'}</td>
                  <td>{fornecedor.telefone || '-'}</td>
                  <td>
                    <span className={`badge ${fornecedor.ativo ? 'badge-pago' : 'badge-cancelado'}`}>
                      {fornecedor.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-secondary"
                      style={{ marginRight: '0.5rem' }}
                      onClick={() => handleEdit(fornecedor)}
                    >
                      Editar
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(fornecedor.id)}
                    >
                      Excluir
                    </button>
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
                {editingFornecedor ? 'Editar Fornecedor' : 'Novo Fornecedor'}
              </h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Nome *</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">CNPJ</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cnpj || ''}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">CPF</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.cpf || ''}
                  onChange={(e) => setFormData({ ...formData, cpf: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Telefone</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.telefone || ''}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Observações</label>
                <textarea
                  className="form-input"
                  rows={3}
                  value={formData.observacoes || ''}
                  onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
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
    </div>
  );
};

export default Fornecedores;





