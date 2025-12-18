/**
 * Funções utilitárias para formatação de dados
 */

/**
 * Formata um valor numérico como moeda brasileira (BRL)
 * @param value - Valor a ser formatado
 * @returns String formatada como R$ X.XXX,XX
 */
export const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
    });
};

/**
 * Formata um valor numérico como moeda sem o símbolo R$
 * @param value - Valor a ser formatado
 * @returns String formatada como X.XXX,XX
 */
export const formatCurrencyValue = (value: number): string => {
    return value.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
};

/**
 * Formata uma data ISO string para mês abreviado em português
 * @param dateStr - String de data no formato ISO
 * @returns Mês abreviado em maiúsculas (ex: "JAN", "FEV")
 */
export const formatMonthAbbr = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date
        .toLocaleString('pt-BR', { month: 'short' })
        .toUpperCase()
        .replace('.', '');
};

/**
 * Extrai o dia do mês de uma data ISO string
 * @param dateStr - String de data no formato ISO
 * @returns Número do dia (1-31)
 */
export const formatDay = (dateStr: string): number => {
    return new Date(dateStr).getDate();
};

/**
 * Formata uma data ISO string para formato brasileiro completo
 * @param dateStr - String de data no formato ISO
 * @returns Data formatada como DD/MM/YYYY
 */
export const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR');
};

/**
 * Formata uma data ISO string para formato brasileiro com hora
 * @param dateStr - String de data no formato ISO
 * @returns Data e hora formatadas como DD/MM/YYYY HH:MM
 */
export const formatDateTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    return date.toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

/**
 * Formata um número de telefone brasileiro
 * @param phone - Número de telefone (apenas dígitos)
 * @returns Telefone formatado como (XX) XXXXX-XXXX
 */
export const formatPhone = (phone: string): string => {
    const cleaned = phone.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{2})(\d{5})(\d{4})$/);
    if (match) {
        return `(${match[1]}) ${match[2]}-${match[3]}`;
    }
    return phone;
};

/**
 * Formata um CPF brasileiro
 * @param cpf - CPF (apenas dígitos)
 * @returns CPF formatado como XXX.XXX.XXX-XX
 */
export const formatCPF = (cpf: string): string => {
    const cleaned = cpf.replace(/\D/g, '');
    const match = cleaned.match(/^(\d{3})(\d{3})(\d{3})(\d{2})$/);
    if (match) {
        return `${match[1]}.${match[2]}.${match[3]}-${match[4]}`;
    }
    return cpf;
};

/**
 * Formata tempo relativo (ex: "há 2 dias", "há 3 horas")
 * @param dateStr - String de data no formato ISO
 * @returns String de tempo relativo
 */
export const formatRelativeTime = (dateStr: string): string => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
        return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
    } else if (diffHours > 0) {
        return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    } else if (diffMins > 0) {
        return `há ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    } else {
        return 'agora mesmo';
    }
};
