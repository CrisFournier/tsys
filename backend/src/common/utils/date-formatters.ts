/**
 * Utilitários para formatação e conversão de datas
 * Resolve problemas de timezone ao converter strings de data para Date objects
 */

/**
 * Converte string de data (formato YYYY-MM-DD, DD/MM/YYYY ou ISO) para Date local
 * sem problemas de timezone.
 * 
 * Quando você usa `new Date("2025-12-15")`, o JavaScript interpreta como UTC,
 * o que pode resultar em um dia anterior dependendo do timezone do servidor.
 * Esta função cria a data localmente usando os componentes ano, mês e dia.
 * 
 * @param dateString - String da data no formato "YYYY-MM-DD", "DD/MM/YYYY" ou ISO completa
 * @returns Date object criado localmente (sem timezone)
 * 
 * @example
 * parseDateLocal("2025-12-15") // Date para 15/12/2025 (sem problemas de timezone)
 * parseDateLocal("15/12/2025") // Date para 15/12/2025 (formato brasileiro)
 * parseDateLocal("2025-12-15T00:00:00.000Z") // Extrai apenas a parte da data
 */
export function parseDateLocal(dateString: string | Date): Date {
  // Se já for um Date object, retorna como está
  if (dateString instanceof Date) {
    return dateString;
  }

  if (!dateString || typeof dateString !== 'string') {
    throw new Error('Data não fornecida ou formato inválido');
  }

  // Remove espaços e caracteres extras
  const cleaned = dateString.trim();

  // Se for uma string ISO completa, extrai apenas a parte da data (YYYY-MM-DD)
  const datePart = cleaned.split('T')[0];
  
  // Tenta diferentes formatos
  let parts: number[];
  
  // Formato YYYY-MM-DD
  if (datePart.includes('-')) {
    parts = datePart.split('-').map(Number);
  }
  // Formato DD/MM/YYYY (formato brasileiro)
  else if (datePart.includes('/')) {
    const [dia, mes, ano] = datePart.split('/').map(Number);
    parts = [ano, mes, dia]; // Reordena para [ano, mês, dia]
  }
  else {
    throw new Error(`Formato de data inválido: ${dateString}. Esperado: YYYY-MM-DD ou DD/MM/YYYY`);
  }

  if (parts.length !== 3 || parts.some(isNaN)) {
    throw new Error(`Formato de data inválido: ${dateString}. Esperado: YYYY-MM-DD ou DD/MM/YYYY`);
  }

  const [ano, mes, dia] = parts;

  // Validação básica
  if (ano < 1900 || ano > 2100) {
    throw new Error(`Ano inválido: ${ano}`);
  }
  if (mes < 1 || mes > 12) {
    throw new Error(`Mês inválido: ${mes}`);
  }
  if (dia < 1 || dia > 31) {
    throw new Error(`Dia inválido: ${dia}`);
  }

  // Cria a data localmente (sem timezone)
  // mês - 1 porque Date usa índice 0-11 para meses
  return new Date(ano, mes - 1, dia);
}

/**
 * Converte múltiplas strings de data para Date objects localmente
 * Útil para processar DTOs com várias datas
 * 
 * @param dates - Objeto com chaves de string e valores de string de data
 * @returns Objeto com as mesmas chaves mas valores convertidos para Date
 * 
 * @example
 * parseDatesLocal({ data_vencimento: "2025-12-15", data_emissao: "2025-12-01" })
 * // { data_vencimento: Date, data_emissao: Date }
 */
export function parseDatesLocal<T extends Record<string, string | Date | undefined>>(
  dates: T,
): { [K in keyof T]: Date } {
  const result = {} as { [K in keyof T]: Date };

  for (const key in dates) {
    const value = dates[key];
    if (value !== undefined && value !== null) {
      result[key] = parseDateLocal(value as string | Date);
    }
  }

  return result;
}

