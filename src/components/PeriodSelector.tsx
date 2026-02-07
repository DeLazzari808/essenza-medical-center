// @ts-nocheck
'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Sun, Moon, Check } from 'lucide-react'
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, startOfDay } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export type Period = 'morning' | 'afternoon'

export interface PeriodSelection {
  date: string // formato YYYY-MM-DD
  period: Period
}

export interface BookedPeriod {
  date: string
  period: Period
  status?: string
}

interface PeriodSelectorProps {
  selectedPeriods: PeriodSelection[]
  onSelectionChange: (periods: PeriodSelection[]) => void
  bookedPeriods?: BookedPeriod[]
  pricePerPeriod?: number
  maxPeriods?: number
  disabled?: boolean
}

const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  selectedPeriods,
  onSelectionChange,
  bookedPeriods = [],
  pricePerPeriod = 0,
  maxPeriods,
  disabled = false,
}) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  // Gerar dias do mês atual
  const days = useMemo(() => {
    const start = startOfMonth(currentMonth)
    const end = endOfMonth(currentMonth)
    return eachDayOfInterval({ start, end })
  }, [currentMonth])

  // Verificar se um período está reservado
  const isPeriodBooked = (date: string, period: Period): boolean => {
    return bookedPeriods.some(
      (bp) => bp.date === date && bp.period === period && bp.status !== 'cancelled'
    )
  }

  // Verificar se um período está selecionado
  const isPeriodSelected = (date: string, period: Period): boolean => {
    return selectedPeriods.some((sp) => sp.date === date && sp.period === period)
  }

  // Toggle seleção de um período
  const togglePeriod = (date: string, period: Period) => {
    if (disabled) return
    if (isPeriodBooked(date, period)) return

    const isSelected = isPeriodSelected(date, period)

    if (isSelected) {
      // Remover da seleção
      onSelectionChange(
        selectedPeriods.filter((sp) => !(sp.date === date && sp.period === period))
      )
    } else {
      // Adicionar à seleção (se não exceder máximo)
      if (maxPeriods && selectedPeriods.length >= maxPeriods) {
        return
      }
      onSelectionChange([...selectedPeriods, { date, period }])
    }
  }

  // Navegar entre meses
  const goToPreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1))
  }

  // Verificar se uma data está no passado
  const isDateInPast = (date: Date): boolean => {
    return isBefore(startOfDay(date), startOfDay(new Date()))
  }

  // Obter classes do botão de período
  const getPeriodButtonClasses = (date: Date, period: Period): string => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const isBooked = isPeriodBooked(dateStr, period)
    const isSelected = isPeriodSelected(dateStr, period)
    const isPast = isDateInPast(date)

    const baseClasses = 'flex-1 py-1.5 px-2 rounded-lg text-xs font-medium transition-all duration-200 flex items-center justify-center gap-1'

    if (isPast || isBooked) {
      return `${baseClasses} bg-neutral-100 text-neutral-400 cursor-not-allowed`
    }

    if (isSelected) {
      return `${baseClasses} bg-primary-500 text-neutral-900 shadow-md`
    }

    return `${baseClasses} bg-neutral-50 text-neutral-600 hover:bg-primary-100 hover:text-primary-700 cursor-pointer`
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden">
      {/* Header do calendário */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50">
        <button
          onClick={goToPreviousMonth}
          className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
          aria-label="Mês anterior"
        >
          <ChevronLeft className="w-5 h-5 text-neutral-600" />
        </button>

        <h3 className="text-lg font-semibold text-neutral-900 capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
        </h3>

        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-neutral-200 transition-colors"
          aria-label="Próximo mês"
        >
          <ChevronRight className="w-5 h-5 text-neutral-600" />
        </button>
      </div>

      {/* Legenda */}
      <div className="flex items-center justify-center gap-6 py-3 border-b border-neutral-100 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-50 border border-neutral-200" />
          <span className="text-neutral-600">Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-primary-500" />
          <span className="text-neutral-600">Selecionado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-neutral-100" />
          <span className="text-neutral-600">Ocupado</span>
        </div>
      </div>

      {/* Grid do calendário */}
      <div className="p-4">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day) => (
            <div
              key={day}
              className="text-center text-xs font-medium text-neutral-500 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-1">
          {/* Espaços vazios para alinhar o primeiro dia */}
          {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, i) => (
            <div key={`empty-${i}`} className="min-h-[80px]" />
          ))}

          {/* Dias do mês */}
          {days.map((day) => {
            const dateStr = format(day, 'yyyy-MM-dd')
            const isPast = isDateInPast(day)

            return (
              <div
                key={dateStr}
                className={`min-h-[80px] p-1 rounded-lg border transition-colors ${
                  isToday(day)
                    ? 'border-primary-300 bg-primary-50/30'
                    : 'border-transparent hover:border-neutral-200'
                } ${isPast ? 'opacity-50' : ''}`}
              >
                {/* Número do dia */}
                <div
                  className={`text-center text-sm font-medium mb-1 ${
                    isToday(day) ? 'text-primary-600' : 'text-neutral-700'
                  }`}
                >
                  {format(day, 'd')}
                </div>

                {/* Botões de período */}
                <div className="flex flex-col gap-1">
                  {/* Manhã */}
                  <button
                    onClick={() => togglePeriod(dateStr, 'morning')}
                    disabled={disabled || isPast || isPeriodBooked(dateStr, 'morning')}
                    className={getPeriodButtonClasses(day, 'morning')}
                    title="Manhã (08h-13h)"
                  >
                    <Sun className="w-3 h-3" />
                    {isPeriodSelected(dateStr, 'morning') && <Check className="w-3 h-3" />}
                  </button>

                  {/* Tarde */}
                  <button
                    onClick={() => togglePeriod(dateStr, 'afternoon')}
                    disabled={disabled || isPast || isPeriodBooked(dateStr, 'afternoon')}
                    className={getPeriodButtonClasses(day, 'afternoon')}
                    title="Tarde (14h-19h)"
                  >
                    <Moon className="w-3 h-3" />
                    {isPeriodSelected(dateStr, 'afternoon') && <Check className="w-3 h-3" />}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumo da seleção */}
      {selectedPeriods.length > 0 && (
        <div className="px-4 py-3 border-t border-neutral-100 bg-primary-50/50">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-neutral-600">
                {selectedPeriods.length} período{selectedPeriods.length !== 1 ? 's' : ''} selecionado{selectedPeriods.length !== 1 ? 's' : ''}
              </span>
            </div>
            {pricePerPeriod > 0 && (
              <div className="text-right">
                <div className="text-sm text-neutral-500">Total</div>
                <div className="text-lg font-bold text-primary-700">
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(pricePerPeriod * selectedPeriods.length)}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default PeriodSelector
