import { AxiosError } from 'axios';

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    // Se for um erro do Axios
    if ('response' in error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>;
      
      if (axiosError.response) {
        const { data, status } = axiosError.response;
        
        // Mensagem do backend (pode ser string ou array de strings)
        if (data?.message) {
          if (Array.isArray(data.message)) {
            // Se for array (erros de validação), junta todas as mensagens
            return data.message.join(', ');
          }
          return data.message;
        }
        
        // Mensagens padrão por status code
        switch (status) {
          case 400:
            return 'Dados inválidos. Verifique os campos preenchidos.';
          case 401:
            return 'Não autorizado. Faça login novamente.';
          case 403:
            return 'Acesso negado.';
          case 404:
            return 'Registro não encontrado.';
          case 409:
            return 'Conflito: Este registro já existe ou está em uso.';
          case 422:
            return 'Erro de validação. Verifique os dados informados.';
          case 500:
            return 'Erro interno do servidor. Tente novamente mais tarde.';
          default:
            return `Erro ao processar solicitação (${status}).`;
        }
      }
      
      // Erro de rede
      if (axiosError.request) {
        return 'Erro de conexão. Verifique sua internet.';
      }
    }
    
    // Outros erros
    return error.message || 'Erro desconhecido.';
  }
  
  return 'Erro desconhecido.';
};



