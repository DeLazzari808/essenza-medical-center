// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoDisplay from '../components/LogoDisplay'
import Button from '../components/Button'
import { Menu, X } from 'lucide-react'

/**
 * PublicLayout - Layout for public pages (landing, login, register)
 */
const PublicLayout = ({ children }) => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/#features', label: 'Recursos' },
    { href: '/#how-it-works', label: 'Como Funciona' },
    { href: '/#pricing', label: 'Preços' },
  ]

  const isAuthPage = pathname === '/login' || pathname === '/register'
  const isLandingPage = pathname === '/'
  const showHeader = !isAuthPage && !isLandingPage

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <header
        className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${scrolled ? 'py-1' : 'py-3'} ${!showHeader ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
      >
        <div
          className={`absolute inset-0 transition-all duration-500 ${scrolled
              ? 'bg-white/80 backdrop-blur-xl shadow-md border-b border-white/20'
              : 'bg-transparent'
            }`}
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="flex justify-between items-center h-14 overflow-hidden">
            <Link href="/" className="flex items-center h-full overflow-hidden">
              <LogoDisplay />
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {!isAuthPage &&
                navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
                  >
                    {link.label}
                  </a>
                ))}
            </nav>

            <div className="hidden md:flex items-center gap-4">
              {pathname !== '/login' && (
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="text-neutral-600 hover:text-neutral-900 font-medium text-sm"
                  >
                    Entrar
                  </Button>
                </Link>
              )}
              {pathname !== '/register' && (
                <Link href="/register">
                  <Button
                    variant="primary"
                    className="shadow-lg shadow-primary-500/20 rounded-full px-6 py-2 text-sm font-semibold hover:shadow-primary-500/40 transition-all hover:scale-105 active:scale-95"
                  >
                    Reserve seu Espaço
                  </Button>
                </Link>
              )}
            </div>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-700" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-700" />
              )}
            </button>
          </div>
        </div>

        <div
          className={`md:hidden absolute top-full inset-x-0 bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-lg transition-all duration-300 ${mobileMenuOpen
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 -translate-y-4 pointer-events-none'
            }`}
        >
          <div className="px-4 py-6 space-y-4">
            {!isAuthPage &&
              navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  className="block text-base font-medium text-neutral-700 hover:text-primary-600 transition-colors py-2"
                >
                  {link.label}
                </a>
              ))}
            <div className="pt-4 border-t border-neutral-200 space-y-3">
              {pathname !== '/login' && (
                <Link href="/login" className="block">
                  <Button variant="outline" className="w-full justify-center">
                    Entrar
                  </Button>
                </Link>
              )}
              {pathname !== '/register' && (
                <Link href="/register" className="block">
                  <Button variant="primary" className="w-full justify-center">
                    Reserve seu Espaço
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main>{children}</main>
    </div>
  )
}

export default PublicLayout
