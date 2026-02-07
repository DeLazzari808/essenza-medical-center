// @ts-nocheck
import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight, Quote, Star } from 'lucide-react'

const testimonials = [
  {
    id: 1,
    name: 'Dra. Marina Santos',
    role: 'Dermatologista',
    avatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=150&q=80',
    content: 'O Essenza Medical Center transformou meu atendimento. Os consultórios são impecáveis e a infraestrutura permite que eu foque totalmente nos meus pacientes. A reserva por períodos é muito prática.',
    rating: 5,
    specialty: 'Dermatologia'
  },
  {
    id: 2,
    name: 'Dr. Ricardo Oliveira',
    role: 'Cardiologista',
    avatar: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=150&q=80',
    content: 'Encontrei o espaço perfeito para minha clínica. O teatro é excelente para palestras e eventos do corpo clínico. O suporte da equipe é excepcional.',
    rating: 5,
    specialty: 'Cardiologia'
  },
  {
    id: 3,
    name: 'Dra. Ana Paula Ferreira',
    role: 'Psicóloga',
    avatar: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=150&q=80',
    content: 'O ambiente do Essenza é perfeito para atendimentos que exigem privacidade e conforto. Meus pacientes sempre elogiam a estrutura e a localização.',
    rating: 5,
    specialty: 'Psicologia'
  },
  {
    id: 4,
    name: 'Dr. Carlos Mendes',
    role: 'Ortopedista',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=150&q=80',
    content: 'A flexibilidade de reservar apenas os períodos que preciso foi decisiva. O sistema de pagamento via Stripe é seguro e prático. Recomendo para todos os colegas.',
    rating: 5,
    specialty: 'Ortopedia'
  },
  {
    id: 5,
    name: 'Dra. Juliana Costa',
    role: 'Nutricionista',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80',
    content: 'O estúdio de podcast me permitiu expandir meu trabalho para o digital. Gravo meus conteúdos com qualidade profissional e atendo pacientes no mesmo dia.',
    rating: 5,
    specialty: 'Nutrição'
  }
]

const TestimonialCard = ({ testimonial, isActive }) => {
  if (!isActive) return null

  return (
    <div
      className="relative bg-white rounded-3xl p-8 md:p-10 shadow-xl border border-neutral-100 animate-fade-in"
    >
      {/* Quote Icon */}
      <div className="absolute -top-6 left-8">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-400 flex items-center justify-center shadow-lg">
          <Quote className="w-6 h-6 text-neutral-900" />
        </div>
      </div>

      {/* Stars */}
      <div className="flex gap-1 mb-6 mt-2">
        {[...Array(testimonial.rating)].map((_, i) => (
          <Star key={i} className="w-5 h-5 fill-amber-400 text-amber-400" />
        ))}
      </div>

      {/* Content */}
      <blockquote className="text-lg md:text-xl text-neutral-700 leading-relaxed mb-8 font-medium">
        "{testimonial.content}"
      </blockquote>

      {/* Author */}
      <div className="flex items-center gap-4">
        <img
          src={testimonial.avatar}
          alt={testimonial.name}
          className="w-14 h-14 rounded-full object-cover ring-4 ring-primary-100"
        />
        <div>
          <div className="font-bold text-neutral-900">{testimonial.name}</div>
          <div className="text-sm text-neutral-500">{testimonial.role}</div>
        </div>
      </div>

      {/* Decorative gradient */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-tl from-primary-50 to-transparent rounded-br-3xl pointer-events-none" />
    </div>
  )
}

const TestimonialsSection = () => {
  const [current, setCurrent] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % testimonials.length)
  }, [])

  const prev = useCallback(() => {
    setCurrent((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [])

  useEffect(() => {
    if (isPaused) return
    const interval = setInterval(next, 6000)
    return () => clearInterval(interval)
  }, [isPaused, next])

  return (
    <section className="py-32 relative bg-gradient-to-b from-neutral-50 to-white overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-30" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16 max-w-3xl mx-auto">
          <span className="inline-block px-4 py-2 rounded-full bg-primary-100 text-primary-700 text-sm font-semibold mb-6">
            Depoimentos
          </span>
          <h2 className="text-3xl md:text-5xl font-bold text-neutral-900 mb-6 tracking-tight">
            O que nosso <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400">corpo clínico</span> diz
          </h2>
          <p className="text-lg text-neutral-600 font-medium">
            Profissionais de saúde que escolheram o Essenza Medical Center para seus atendimentos.
          </p>
        </div>

        {/* Carousel Container */}
        <div
          className="relative max-w-4xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Cards */}
          <div className="relative min-h-[320px]">
            {testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={testimonial.id}
                testimonial={testimonial}
                isActive={index === current}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-center gap-4 mt-10">
            <button
              onClick={prev}
              className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Dots */}
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrent(index)}
                  className={`h-2.5 rounded-full transition-all duration-300 ${index === current
                      ? 'w-8 bg-gradient-to-r from-primary-500 to-primary-400'
                      : 'w-2.5 bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>

            <button
              onClick={next}
              className="w-12 h-12 rounded-full bg-white border border-neutral-200 flex items-center justify-center text-neutral-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-600 transition-all duration-300 shadow-sm hover:shadow-md"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Specialties */}
        <div className="mt-20 text-center">
          <p className="text-sm text-neutral-500 mb-6 font-medium">Especialidades presentes no Essenza</p>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-60">
            {['Dermatologia', 'Cardiologia', 'Psicologia', 'Ortopedia', 'Nutrição'].map((specialty, i) => (
              <span key={i} className="text-lg font-bold text-neutral-500 hover:text-neutral-700 transition-colors">
                {specialty}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default TestimonialsSection
