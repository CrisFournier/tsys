import api from './api';
import { Pagamento } from '../types';

export interface FilterPagamento {
  conta_pagar_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const pagamentoService = {
  getAll: async (filters?: FilterPagamento): Promise<Pagamento[]> => {
    const response = await api.get('/pagamentos', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<Pagamento> => {
    const response = await api.get(`/pagamentos/${id}`);
    return response.data;
  },

  create: async (data: Partial<Pagamento>): Promise<Pagamento> => {
    const response = await api.post('/pagamentos', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Pagamento>): Promise<Pagamento> => {
    const response = await api.patch(`/pagamentos/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pagamentos/${id}`);
  },
};



