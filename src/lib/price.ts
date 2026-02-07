// @ts-nocheck
/**
 * Essenza Medical Center - Price Calculation
 *
 * Sistema de preços por período:
 * - Manhã (morning): 08h - 13h
 * - Tarde (afternoon): 14h - 19h
 */

export type Period = 'morning' | 'afternoon'

export interface PeriodSelection {
  date: string // formato YYYY-MM-DD
  period: Period
}

export interface PriceResult {
  total: number
  pricePerPeriod: number
  periodsCount: number
  breakdown: PeriodSelection[]
}

/**
 * Calcula o preço total baseado no preço por período e períodos selecionados
 *
 * @param pricePerPeriod - Preço por período da sala
 * @param selectedPeriods - Array de períodos selecionados
 * @returns Objeto com preço total e detalhes
 */
export function calculatePricePerPeriod(
  pricePerPeriod: number,
  selectedPeriods: PeriodSelection[]
): PriceResult {
  const periodsCount = selectedPeriods.length

  if (periodsCount === 0 || !pricePerPeriod || pricePerPeriod <= 0) {
    return {
      total: 0,
      pricePerPeriod: pricePerPeriod || 0,
      periodsCount: 0,
      breakdown: []
    }
  }

  const total = pricePerPeriod * periodsCount

  return {
    total: Math.round(total * 100) / 100,
    pricePerPeriod: Math.round(pricePerPeriod * 100) / 100,
    periodsCount,
    breakdown: selectedPeriods
  }
}

/**
 * Calcula o preço total simples (para compatibilidade)
 *
 * @param pricePerPeriod - Preço por período
 * @param periodsCount - Número de períodos selecionados
 * @returns Preço total
 */
export function calculateTotalPrice(
  pricePerPeriod: number,
  periodsCount: number
): number {
  if (!pricePerPeriod || !periodsCount || periodsCount <= 0) {
    return 0
  }
  return Math.round(pricePerPeriod * periodsCount * 100) / 100
}

/**
 * Retorna o label do período
 */
export function getPeriodLabel(period: Period): string {
  return period === 'morning' ? 'Manhã (08h-13h)' : 'Tarde (14h-19h)'
}

/**
 * Retorna o horário de início e fim do período
 */
export function getPeriodTimes(period: Period): { start: string; end: string } {
  if (period === 'morning') {
    return { start: '08:00', end: '13:00' }
  }
  return { start: '14:00', end: '19:00' }
}

/**
 * Formata preço em BRL
 */
export function formatPriceBRL(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(price)
}

/**
 * Função de compatibilidade com código legado
 * Mantida para não quebrar código existente durante a transição
 */
export function estimateTotalPriceBRL(pricePerDay: number, start: Date | string, end: Date | string): number {
  // Durante a transição, esta função pode ser chamada
  // Retornamos o preço por período como fallback
  return pricePerDay || 0
}

/**
 * Função de compatibilidade com código legado
 */
export function calculatePriceWithDiscounts(pricePerDay: number, start: Date | string, end: Date | string) {
  return {
    total: pricePerDay || 0,
    discount: 0,
    discountPercent: 0,
    days: 1,
    basePrice: pricePerDay || 0,
    finalPrice: pricePerDay || 0
  }
}
