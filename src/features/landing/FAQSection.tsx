// @ts-nocheck
import React, { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'

const faqs = [
  {
    question: 'Como funciona a reserva de períodos?',
    answer: 'Nosso sistema funciona com dois turnos fixos: manhã (08h-13h) e tarde (14h-19h). Você pode reservar quantos períodos precisar, visualizando a disponibilidade em tempo real no calendário. A confirmação é instantânea após o pagamento.'
  },
  {
    question: 'Quais são as formas de pagamento aceitas?',
    answer: 'Aceitamos cartões de crédito (Visa, Mastercard, American Express), cartões de débito e PIX. Todos os pagamentos são processados de forma segura através do Stripe, garantindo a proteção dos seus dados.'
  },
  {
    question: 'Posso cancelar minha reserva?',
    answer: 'Sim! Oferecemos cancelamento gratuito até 48 horas antes do período reservado. Após esse prazo, pode haver uma taxa de cancelamento. Consulte nossa política de cancelamento para mais detalhes.'
  },
  {
    question: 'O que está incluso no valor do período?',
    answer: 'O valor inclui o uso completo do espaço equipado, climatização, internet de alta velocidade, recepção compartilhada, estacionamento e áreas comuns. Cada consultório possui mobiliário ergonômico e ponto de rede dedicado.'
  },
  {
    question: 'Como faço para me tornar parte do corpo clínico?',
    answer: 'Crie sua conta gratuitamente na plataforma e complete seu cadastro profissional. Após a aprovação, você terá acesso ao sistema de reservas e poderá agendar seus atendimentos nos espaços disponíveis.'
  },
  {
    question: 'Qual a infraestrutura disponível?',
    answer: 'O Essenza Medical Center conta com 14 consultórios médicos totalmente equipados, um estúdio de podcast profissional, um teatro para até 100 pessoas e um hub digital para coworking e networking entre profissionais de saúde.'
  },
  {
    question: 'O Essenza oferece suporte ao profissional?',
    answer: 'Sim! Nossa equipe de suporte está disponível de segunda a sexta, das 8h às 20h, via chat, e-mail e telefone. Para questões urgentes durante seus atendimentos, oferecemos suporte presencial imediato.'
  }
]

const AccordionItem = ({ faq, isOpen, onToggle, index }) => {
  return (
    <div
      className={`border-b border-neutral-200 last:border-0 transition-all duration-300 ${
        isOpen ? 'bg-primary-50/50' : 'bg-transparent hover:bg-neutral-50'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-6 px-6 text-left group"
        aria-expanded={isOpen}
      >
        <span className={`text-lg font-semibold transition-colors duration-300 ${
          isOpen ? 'text-primary-700' : 'text-neutral-900 group-hover:text-primary-600'
        }`}>
          {faq.question}
        </span>
        <div className={`flex-shrink-0 ml-4 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? 'bg-primary-500 text-neutral-900 rotate-180'
            : 'bg-neutral-100 text-neutral-500 group-hover:bg-primary-100 group-hover:text-primary-600'
        }`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>

      <div
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <p className="px-6 pb-6 text-neutral-600 leading-relaxed">
          {faq.answer}
        </p>
      </div>
    </div>
  )
}

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(0)

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index)
  }

  return (
    <section id="faq" className="py-32 relative bg-gradient-to-b from-white to-neutral-50">
      {/* Decorative Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-20" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
            <HelpCircle className="w-4 h-4" />
            <span>Dúvidas Frequentes</span>
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
            Perguntas <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">Frequentes</span>
          </h2>
          <p className="text-lg text-neutral-600 font-medium max-w-2xl mx-auto">
            Encontre respostas para as perguntas mais comuns sobre o Essenza Medical Center.
          </p>
        </div>

        {/* Accordion */}
        <div className="bg-white rounded-3xl shadow-xl border border-neutral-100 overflow-hidden">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              faq={faq}
              index={index}
              isOpen={openIndex === index}
              onToggle={() => handleToggle(index)}
            />
          ))}
        </div>

        {/* Contact CTA */}
        <div className="mt-12 text-center">
          <p className="text-neutral-600 mb-4">
            Não encontrou o que procurava?
          </p>
          <a
            href="mailto:contato@essenzamedical.com.br"
            className="inline-flex items-center gap-2 text-primary-600 font-semibold hover:text-primary-700 transition-colors"
          >
            Entre em contato com nossa equipe
            <span className="text-lg">→</span>
          </a>
        </div>
      </div>
    </section>
  )
}

export default FAQSection
