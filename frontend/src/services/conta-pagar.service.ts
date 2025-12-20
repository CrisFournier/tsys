import api from './api';
import { ContaPagar } from '../types';

export interface FilterContaPagar {
  status?: string;
  fornecedor_id?: string;
  data_inicio?: string;
  data_fim?: string;
}

export const contaPagarService = {
  getAll: async (filters?: FilterContaPagar): Promise<ContaPagar[]> => {
    const response = await api.get('/contas-pagar', { params: filters });
    return response.data;
  },

  getById: async (id: string): Promise<ContaPagar> => {
    const response = await api.get(`/contas-pagar/${id}`);
    return response.data;
  },

  create: async (data: Partial<ContaPagar>): Promise<ContaPagar> => {
    const response = await api.post('/contas-pagar', data);
    return response.data;
  },

  update: async (id: string, data: Partial<ContaPagar>): Promise<ContaPagar> => {
    const response = await api.patch(`/contas-pagar/${id}`, data);
    return response.data;
  },

  cancel: async (id: string): Promise<ContaPagar> => {
    const response = await api.delete(`/contas-pagar/${id}`);
    return response.data;
  },

  pagar: async (
    id: string,
    data: {
      valor_pago: number;
      data_pagamento: string;
      forma_pagamento: string;
      observacoes?: string;
    },
  ): Promise<ContaPagar> => {
    const response = await api.post(`/contas-pagar/${id}/pagar`, data);
    return response.data;
  },
};



