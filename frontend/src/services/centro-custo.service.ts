import api from './api';
import { CentroCusto } from '../types';

export const centroCustoService = {
  getAll: async (): Promise<CentroCusto[]> => {
    const response = await api.get('/centros-custo');
    return response.data;
  },

  getById: async (id: string): Promise<CentroCusto> => {
    const response = await api.get(`/centros-custo/${id}`);
    return response.data;
  },

  create: async (data: Partial<CentroCusto>): Promise<CentroCusto> => {
    const response = await api.post('/centros-custo', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CentroCusto>): Promise<CentroCusto> => {
    const response = await api.patch(`/centros-custo/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/centros-custo/${id}`);
  },
};




