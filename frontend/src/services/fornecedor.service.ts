import api from './api';
import { Fornecedor } from '../types';

export const fornecedorService = {
  getAll: async (): Promise<Fornecedor[]> => {
    const response = await api.get('/fornecedores');
    return response.data;
  },

  getById: async (id: string): Promise<Fornecedor> => {
    const response = await api.get(`/fornecedores/${id}`);
    return response.data;
  },

  create: async (data: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.post('/fornecedores', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Fornecedor>): Promise<Fornecedor> => {
    const response = await api.patch(`/fornecedores/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/fornecedores/${id}`);
  },
};



