// @ts-nocheck
'use client'

import React from 'react'
import Link from 'next/link'
import Button from '../../components/Button'

const CTASection = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-50/80 pointer-events-none" />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="glass-liquid rounded-[3rem] p-16 md:p-24 shadow-2xl border border-white/80 overflow-hidden relative group">
          {/* Hover glow effect */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 pointer-events-none" />

          <h2 className="text-4xl md:text-6xl font-bold text-neutral-900 mb-8 tracking-tight">
            Pronto para fazer parte <br/> do Essenza?
          </h2>
          <p className="text-xl text-neutral-600 mb-12 max-w-2xl mx-auto font-medium">
            Junte-se ao corpo clínico de excelência e ofereça o melhor atendimento aos seus pacientes em um ambiente de alto padrão.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link href="/register">
              <Button variant="primary" size="lg" className="w-full sm:w-auto rounded-full px-12 py-5 text-lg font-bold shadow-2xl hover:shadow-primary-500/50 hover:-translate-y-1 transition-all">
                Reserve seu Espaço
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export default CTASection
