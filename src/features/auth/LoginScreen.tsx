// @ts-nocheck
'use client'

import { SignIn } from '@clerk/nextjs'

const LoginScreen = () => {
  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side - Brand/Art */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-neutral-900">
        <div className="absolute inset-0 bg-gradient-to-br from-primary-900 via-neutral-900 to-neutral-800 opacity-90" />
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&q=80')] bg-cover bg-center mix-blend-overlay" />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-blob" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="relative z-10 flex flex-col justify-between p-16 w-full text-white">
          <div className="flex items-center">
            <img
              src="/assets/images/essenza-logo.svg"
              alt="Essenza Medical Center"
              className="h-12 w-auto"
            />
          </div>
          <div className="space-y-6 max-w-lg">
            <h1 className="text-5xl font-display font-bold leading-tight">
              Espaços clínicos de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-100">alto padrão</span>.
            </h1>
            <p className="text-lg text-neutral-300 leading-relaxed">
              Acesse sua conta e gerencie suas reservas de consultórios, estúdio de podcast, teatro e hub digital.
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm text-neutral-400">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-neutral-900 bg-neutral-700 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?img=${i + 10}`} alt="User" className="w-full h-full object-cover opacity-80" />
                </div>
              ))}
            </div>
            <span>Corpo clínico seleto</span>
          </div>
        </div>
      </div>

      {/* Right Side - Clerk SignIn */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-white relative">
        <div className="animate-scale-in">
          <SignIn
            appearance={{
              elements: {
                rootBox: 'mx-auto',
                card: 'shadow-none',
              },
            }}
            routing="hash"
            signUpUrl="/register"
            afterSignInUrl="/app/dashboard"
          />
        </div>
      </div>
    </div>
  )
}

export default LoginScreen
