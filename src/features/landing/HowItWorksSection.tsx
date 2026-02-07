// @ts-nocheck
import React from 'react'
import {
  Building2,
  CalendarCheck,
  CreditCard,
  ArrowRight
} from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Building2,
    title: 'Escolha seu Espaço',
    description: 'Navegue pelos nossos 14 consultórios médicos, estúdio de podcast, teatro para 100 pessoas ou hub digital. Cada espaço foi projetado para atender suas necessidades.',
    gradient: 'from-primary-500 to-primary-400',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
  {
    number: '02',
    icon: CalendarCheck,
    title: 'Selecione seus Períodos',
    description: 'Escolha os turnos que deseja reservar: manhã (08h-13h) ou tarde (14h-19h). Visualize a disponibilidade em tempo real e faça múltiplas reservas.',
    gradient: 'from-neutral-700 to-neutral-600',
    bgColor: 'bg-neutral-100',
    borderColor: 'border-neutral-200',
  },
  {
    number: '03',
    icon: CreditCard,
    title: 'Confirme sua Reserva',
    description: 'Finalize sua reserva com pagamento seguro via Stripe. Receba confirmação instantânea e acesse seu espaço no horário agendado.',
    gradient: 'from-primary-600 to-primary-500',
    bgColor: 'bg-primary-50',
    borderColor: 'border-primary-200',
  },
]

const StepCard = ({ step, index, isLast }) => {
  const Icon = step.icon

  return (
    <div className="relative group">
      {/* Connector Line */}
      {!isLast && (
        <div className="hidden lg:block absolute top-24 left-[calc(100%+0.5rem)] w-[calc(100%-1rem)] h-0.5 z-0">
          <div className="h-full bg-gradient-to-r from-neutral-200 via-neutral-300 to-neutral-200 rounded-full" />
          <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-5 h-5 text-neutral-400" />
        </div>
      )}

      {/* Card */}
      <div
        className={`relative p-8 rounded-3xl ${step.bgColor} border ${step.borderColor} transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group`}
      >
        {/* Step Number Badge */}
        <div className="absolute -top-4 -left-2 z-10">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
            <span className="text-white font-bold text-lg">{step.number}</span>
          </div>
        </div>

        {/* Icon */}
        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.gradient} flex items-center justify-center mb-6 shadow-md mt-4 group-hover:scale-105 transition-transform duration-300`}>
          <Icon className="w-8 h-8 text-white" />
        </div>

        {/* Content */}
        <h3 className="text-xl font-bold text-neutral-900 mb-3 tracking-tight">
          {step.title}
        </h3>
        <p className="text-neutral-600 leading-relaxed">
          {step.description}
        </p>

        {/* Hover Shimmer */}
        <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none rounded-3xl overflow-hidden" />
      </div>
    </div>
  )
}

const HowItWorksSection = () => {
  return (
    <section id="how-it-works" className="py-32 relative bg-gradient-to-b from-white to-neutral-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-20 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
            Simples e Rápido
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
            Como <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Funciona</span>
          </h2>
          <p className="text-lg text-neutral-600 font-medium">
            Em apenas três passos simples, você reserva o espaço ideal para seu atendimento.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-6">
          {steps.map((step, index) => (
            <StepCard
              key={step.number}
              step={step}
              index={index}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: '14', label: 'Consultórios' },
            { value: '100', label: 'Lugares no Teatro' },
            { value: '2', label: 'Turnos por Dia' },
            { value: '24h', label: 'Suporte' },
          ].map((stat, i) => (
            <div
              key={i}
              className="text-center p-6 rounded-2xl bg-white/60 backdrop-blur-sm border border-neutral-100 hover:border-primary-200 hover:shadow-md transition-all duration-300"
            >
              <div className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-neutral-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorksSection
