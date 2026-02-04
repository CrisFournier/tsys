import { format, parseISO } from 'date-fns';

/**
 * Formata um valor numérico para exibição em formato brasileiro
 * @param valor - Valor a ser formatado (number, string ou undefined)
 * @param opcoes - Opções de formatação
 * @param opcoes.incluirMoeda - Se true, inclui símbolo R$ (padrão: false)
 * @param opcoes.permiteVazio - Se true, retorna string vazia quando valor é 0 (padrão: false)
 * @returns String formatada como "250,30" ou "R$ 250,00"
 * 
 * @example
 * formatarValor(250.30) // "250,30"
 * formatarValor(250.30, { incluirMoeda: true }) // "R$ 250,30"
 * formatarValor("250,30") // "250,30"
 * formatarValor(0, { permiteVazio: true }) // ""
 */
export const formatarValor = (
  valor: number | string | undefined,
  opcoes?: {
    incluirMoeda?: boolean;
    permiteVazio?: boolean;
  }
): string => {
  const { incluirMoeda = false, permiteVazio = false } = opcoes || {};

  // Converte para número
  let numero: number;
  
  if (valor === undefined || valor === null || valor === '') {
    numero = 0;
  } else if (typeof valor === 'number') {
    numero = parseFloat(valor.toFixed(2));
  } else {
    // Se for string, converte para número
    let valorLimpo = valor.replace(/[^\d,.-]/g, '');
    
    // Trata vírgula e ponto como separador decimal
    const temVirgula = valorLimpo.includes(',');
    const temPonto = valorLimpo.includes('.');
    
    if (temVirgula && temPonto) {
      const indiceVirgula = valorLimpo.lastIndexOf(',');
      const indicePonto = valorLimpo.lastIndexOf('.');
      if (indiceVirgula > indicePonto) {
        valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
      } else {
        valorLimpo = valorLimpo.replace(/,/g, '');
      }
    } else if (temVirgula) {
      valorLimpo = valorLimpo.replace(',', '.');
    }
    
    numero = parseFloat(valorLimpo);
    if (isNaN(numero)) {
      numero = 0;
    } else {
      numero = parseFloat(numero.toFixed(2));
    }
  }
  
  // Se permite vazio e valor é 0, retorna string vazia
  if (permiteVazio && numero === 0) {
    return '';
  }
  
  // Formata o número
  const valorFormatado = numero.toFixed(2).replace('.', ',');
  
  // Adiciona símbolo de moeda se solicitado
  if (incluirMoeda) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numero);
  }
  
  return valorFormatado;
};

/**
 * Converte string ou número para número decimal (sempre com 2 casas decimais)
 * Função auxiliar para conversão antes de enviar ao backend
 * @param valor - Valor a ser convertido (string ou number)
 * @returns Número decimal com 2 casas decimais
 * 
 * @example
 * converterParaNumero("250,30") // 250.30
 * converterParaNumero("250.30") // 250.30
 * converterParaNumero("250") // 250.00
 */
export const converterParaNumero = (valor: string | number): number => {
  if (typeof valor === 'number') {
    return parseFloat(valor.toFixed(2));
  }
  
  if (typeof valor !== 'string' || valor.trim() === '') {
    return 0;
  }
  
  let valorLimpo = valor.replace(/[^\d,.-]/g, '');
  
  const temVirgula = valorLimpo.includes(',');
  const temPonto = valorLimpo.includes('.');
  
  if (temVirgula && temPonto) {
    const indiceVirgula = valorLimpo.lastIndexOf(',');
    const indicePonto = valorLimpo.lastIndexOf('.');
    if (indiceVirgula > indicePonto) {
      valorLimpo = valorLimpo.replace(/\./g, '').replace(',', '.');
    } else {
      valorLimpo = valorLimpo.replace(/,/g, '');
    }
  } else if (temVirgula) {
    valorLimpo = valorLimpo.replace(',', '.');
  }
  
  const numero = parseFloat(valorLimpo);
  if (isNaN(numero)) {
    return 0;
  }
  
  return parseFloat(numero.toFixed(2));
};

/**
 * Formata data sem problemas de timezone
 * Trata tanto strings ISO completas quanto formato YYYY-MM-DD
 * @param dataString - String da data a ser formatada
 * @param formato - Formato de saída (padrão: 'dd/MM/yyyy')
 * @returns String formatada ou string vazia se data inválida
 * 
 * @example
 * formatarData("2025-12-30") // "30/12/2025"
 * formatarData("2025-12-30T00:00:00.000Z") // "30/12/2025"
 * formatarData("2025-12-30", "dd/MM/yyyy HH:mm") // "30/12/2025 00:00"
 */
export const formatarData = (
  dataString: string,
  formato: string = 'dd/MM/yyyy'
): string => {
  if (!dataString) return '';
  
  try {
    // Se a data vem como string ISO completa, usa parseISO
    if (dataString.includes('T')) {
      const data = parseISO(dataString);
      return format(data, formato);
    }
    
    // Se vem apenas como YYYY-MM-DD, cria a data localmente
    const [ano, mes, dia] = dataString.split('-');
    if (!ano || !mes || !dia) {
      return dataString; // Retorna original se formato inválido
    }
    
    const data = new Date(parseInt(ano), parseInt(mes) - 1, parseInt(dia));
    return format(data, formato);
  } catch (error) {
    console.error('Erro ao formatar data:', error);
    return dataString; // Retorna original em caso de erro
  }
};

