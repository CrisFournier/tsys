import api from './api';
import { Categoria } from '../types';

export const categoriaService = {
  getAll: async (): Promise<Categoria[]> => {
    const response = await api.get('/categorias');
    return response.data;
  },

  getById: async (id: string): Promise<Categoria> => {
    const response = await api.get(`/categorias/${id}`);
    return response.data;
  },

  create: async (data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.post('/categorias', data);
    return response.data;
  },

  update: async (id: string, data: Partial<Categoria>): Promise<Categoria> => {
    const response = await api.patch(`/categorias/${id}`, data);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/categorias/${id}`);
  },
};



