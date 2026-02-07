// @ts-nocheck
import React from 'react'
import {
  Stethoscope,
  Heart,
  Activity,
  Laptop,
  CheckCircle2
} from 'lucide-react'

const features = [
  {
    icon: Stethoscope,
    title: 'Consultório Premium',
    description: 'Consultórios totalmente equipados com infraestrutura de alto padrão para atendimento clínico.',
    benefits: ['Climatização individual', 'Mobiliário ergonômico', 'Ponto de rede dedicado'],
    gradient: 'from-primary-500 to-primary-400',
    bgColor: 'bg-primary-50',
  },
  {
    icon: Heart,
    title: 'Sala de Cardiologia',
    description: 'Espaço especializado para consultas e exames cardiológicos com equipamentos de última geração.',
    benefits: ['Eletrocardiógrafo', 'Maca ergonômica', 'Ambiente silencioso'],
    gradient: 'from-red-500 to-red-400',
    bgColor: 'bg-red-50',
  },
  {
    icon: Activity,
    title: 'Sala de Procedimentos',
    description: 'Ambiente preparado para procedimentos ambulatoriais com toda infraestrutura necessária.',
    benefits: ['Iluminação adequada', 'Equipamentos esterilizados', 'Ponto de oxigênio'],
    gradient: 'from-primary-600 to-primary-500',
    bgColor: 'bg-primary-50',
  },
  {
    icon: Laptop,
    title: 'Hub Digital',
    description: 'Espaço de coworking para networking e trabalho colaborativo entre profissionais de saúde.',
    benefits: ['Internet de alta velocidade', 'Ambiente climatizado', 'Área de café'],
    gradient: 'from-neutral-600 to-neutral-500',
    bgColor: 'bg-neutral-100',
  },
]

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 relative overflow-hidden bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Section */}
        <div className="text-center mb-16 max-w-4xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
            Infraestrutura Completa
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight leading-tight">
            Espaços pensados para{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">
              profissionais de saúde
            </span>
          </h2>
          <p className="text-xl text-neutral-600 font-medium max-w-2xl mx-auto">
            Ambientes de alto padrão projetados para proporcionar conforto aos pacientes e praticidade ao seu dia a dia.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <div
                key={index}
                className={`relative p-8 rounded-3xl ${feature.bgColor} border border-neutral-200/50 transition-all duration-500 hover:-translate-y-2 hover:shadow-xl group`}
              >
                {/* Icon */}
                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-300`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="text-2xl font-bold text-neutral-900 mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed mb-6">
                  {feature.description}
                </p>

                {/* Benefits */}
                <ul className="space-y-2">
                  {feature.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm text-neutral-700">
                      <CheckCircle2 className="w-4 h-4 text-primary-500" />
                      {benefit}
                    </li>
                  ))}
                </ul>

                {/* Hover Effect */}
                <div className="absolute inset-0 -translate-x-full group-hover:animate-shimmer bg-gradient-to-r from-transparent via-white/30 to-transparent z-10 pointer-events-none rounded-3xl overflow-hidden" />
              </div>
            )
          })}
        </div>

      </div>
    </section>
  )
}

export default FeaturesSection
