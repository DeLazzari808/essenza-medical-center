// @ts-nocheck
'use client'

import React from 'react'
import { Smartphone, Calendar, CreditCard, Bell, CheckCircle2 } from 'lucide-react'
// Note: Some icons reserved for potential future use

const AppPreviewSection = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#e5e5e5] via-[#f5f3f0] to-[#d6c4ae]/20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8 items-center">

          {/* Left - Text Content */}
          <div className="text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#d6c4ae] bg-white/90 text-[#262626] text-sm font-medium mb-8 shadow-sm">
              <Smartphone className="w-4 h-4" />
              Em Breve
            </div>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-2 leading-[1.1]">
              Gerencie suas
            </h2>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-neutral-900 mb-2 leading-[1.1]">
              reservas
            </h2>
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-[1.1] mb-8">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#262626] via-[#8a7a68] to-[#d6c4ae]">
                na palma da mão
              </span>
            </h2>

            <p className="text-lg text-neutral-500 mb-12 leading-relaxed max-w-lg mx-auto lg:mx-0">
              O aplicativo Essenza Medical Center está em desenvolvimento. Em breve você poderá reservar espaços, gerenciar agendamentos e receber notificações diretamente no seu smartphone.
            </p>

            {/* Features list - 2x2 grid */}
            <div className="grid sm:grid-cols-2 gap-x-8 gap-y-4 mb-12">
              {[
                { icon: Calendar, text: 'Reservas instantâneas' },
                { icon: CreditCard, text: 'Pagamento seguro' },
                { icon: Bell, text: 'Notificações em tempo real' },
                { icon: CheckCircle2, text: 'Gestão simplificada' },
              ].map((feature, idx) => (
                <div key={idx} className="flex items-center gap-3 text-neutral-600">
                  <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm border border-[#d6c4ae]/50">
                    <feature.icon className="w-5 h-5 text-[#262626]" />
                  </div>
                  <span className="font-medium">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Coming soon badge */}
            <div className="inline-flex items-center gap-3 px-6 py-4 rounded-2xl bg-[#262626] text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="flex -space-x-1">
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                </div>
                <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.523 2H6.477C5.114 2 4 3.114 4 4.477v15.046C4 20.886 5.114 22 6.477 22h11.046c1.363 0 2.477-1.114 2.477-2.477V4.477C20 3.114 18.886 2 17.523 2zM12 18.5c-.828 0-1.5-.672-1.5-1.5s.672-1.5 1.5-1.5 1.5.672 1.5 1.5-.672 1.5-1.5 1.5zm4-4H8V6h8v8.5z" />
                  </svg>
                </div>
              </div>
              <span className="text-sm font-semibold">Disponível em breve para iOS e Android</span>
            </div>
          </div>

          {/* Right - Phone Mockup Image */}
          <div className="relative flex justify-center">
            <div className="relative">
              {/* Warm brand glow effect behind phone */}
              <div className="absolute inset-0 bg-gradient-to-br from-[#d6c4ae]/50 via-[#d6c4ae]/30 to-transparent blur-3xl scale-150 -z-10" />

              {/* Phone mockup image - larger and cleaner */}
              <div className="relative transform hover:scale-105 transition-transform duration-500">
                <img
                  src="/assets/phone_mockup_nobg.png"
                  alt="Essenza Medical Center App"
                  className="w-[320px] md:w-[420px] lg:w-[500px] h-auto drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default AppPreviewSection
