// @ts-nocheck
'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useClerk, useUser } from '@clerk/nextjs'
import { useAuthStore } from '../store/useAuthStore'
import Button from '../components/Button'
import {
  Home,
  Building2,
  Calendar,
  LogOut,
  User,
  Menu,
  X,
  ChevronLeft,
  Settings,
  HelpCircle
} from 'lucide-react'

/**
 * AppLayout - Layout for authenticated app routes (/app/*)
 */
const AppLayout = ({ children }) => {
  const pathname = usePathname()
  const { signOut } = useClerk()
  const { user: clerkUser } = useUser()
  const { profile } = useAuthStore()
  const isOwner = profile?.role === 'owner'
  const [logoSrc, setLogoSrc] = useState('/assets/images/essenza-logo.svg')
  const [showFallback, setShowFallback] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    try {
      useAuthStore.setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      })
      await signOut({ redirectUrl: '/login' })
    } catch (error) {
      console.error('Error signing out:', error)
      useAuthStore.setState({
        user: null,
        profile: null,
        loading: false,
        error: null,
      })
      window.location.href = '/login'
    }
  }

  const navItems = [
    { path: '/app/dashboard', icon: Home, label: 'Dashboard' },
    { path: '/app/rooms', icon: Building2, label: 'Salas' },
    { path: '/app/bookings', icon: Calendar, label: 'Reservas' },
  ]

  const secondaryNavItems = [
    { path: '/app/settings', icon: Settings, label: 'Configurações' },
    { path: '/app/help', icon: HelpCircle, label: 'Ajuda' },
  ]

  const NavLink = ({ item, collapsed = false }) => {
    const Icon = item.icon
    const isActive = pathname === item.path || pathname.startsWith(item.path + '/')

    return (
      <Link
        href={item.path}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group ${isActive
          ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-md shadow-primary-500/20'
          : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
          } ${collapsed ? 'justify-center' : ''}`}
        title={collapsed ? item.label : undefined}
      >
        <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? '' : 'group-hover:scale-110 transition-transform'}`} />
        {!collapsed && <span className="font-medium text-sm">{item.label}</span>}
      </Link>
    )
  }

  const displayName = profile?.name || clerkUser?.firstName || 'Usuário'

  return (
    <div className="min-h-screen bg-gradient-soft flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-neutral-200/50 transition-all duration-300 ${sidebarCollapsed ? 'w-20' : 'w-64'
          }`}
      >
        {/* Sidebar Header */}
        <div className={`h-16 flex items-center border-b border-neutral-100 ${sidebarCollapsed ? 'justify-center' : 'justify-center'} overflow-hidden`}>
          <Link href="/app/dashboard" className="flex items-center">
            {!showFallback ? (
              <img
                src={logoSrc}
                alt="Essenza Medical Center"
                className={`${sidebarCollapsed ? 'h-12 max-h-full' : 'h-14 max-h-full'} w-auto object-contain`}
                onError={() => {
                  if (logoSrc.includes('.svg')) {
                    setLogoSrc('/assets/images/logo.png')
                  } else {
                    setShowFallback(true)
                  }
                }}
              />
            ) : (
              <div className={`${sidebarCollapsed ? 'w-12 h-12' : 'w-14 h-14'} rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow`}>
                <Building2 className={`${sidebarCollapsed ? 'w-6 h-6' : 'w-7 h-7'} text-white`} />
              </div>
            )}

          </Link>
        </div>

        {/* Expand Button (when collapsed) */}
        {sidebarCollapsed && (
          <button
            onClick={() => setSidebarCollapsed(false)}
            className="mx-auto mt-4 p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
            aria-label="Expandir menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        {/* Main Navigation */}
        <nav className={`flex-1 py-6 ${sidebarCollapsed ? 'px-2' : 'px-3'}`}>
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink key={item.path} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>

          {/* Divider */}
          <div className={`my-6 border-t border-neutral-100 ${sidebarCollapsed ? 'mx-2' : ''}`} />

          {/* Secondary Navigation */}
          <div className="space-y-1">
            {secondaryNavItems.map((item) => (
              <NavLink key={item.path} item={item} collapsed={sidebarCollapsed} />
            ))}
          </div>
        </nav>

        {/* User Section */}
        <div className={`border-t border-neutral-100 ${sidebarCollapsed ? 'p-2' : 'p-4'}`}>
          <div className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center flex-shrink-0">
              <User className="w-5 h-5 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-neutral-500 truncate">
                  {isOwner ? 'Administrador' : 'Médico'}
                </p>
              </div>
            )}
            {!sidebarCollapsed && (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
                aria-label="Sair"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {sidebarCollapsed && (
            <button
              onClick={handleSignOut}
              className="mt-3 w-full p-2 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors flex justify-center"
              aria-label="Sair"
            >
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Header & Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-neutral-200/50">
          <div className="flex items-center justify-between h-16 px-4 overflow-hidden">
            <Link href="/app/dashboard" className="flex items-center h-full">
              {!showFallback ? (
                <img
                  src={logoSrc}
                  alt="Essenza Medical Center"
                  className="h-8 max-h-full w-auto object-contain"
                  onError={() => {
                    if (logoSrc.includes('.svg')) {
                      setLogoSrc('/assets/images/logo.png')
                    } else {
                      setShowFallback(true)
                    }
                  }}
                />
              ) : (
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}

            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6 text-neutral-700" />
              ) : (
                <Menu className="w-6 h-6 text-neutral-700" />
              )}
            </button>
          </div>
        </header>

        {/* Mobile Menu Overlay */}
        {mobileMenuOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Mobile Menu Panel */}
        <div
          className={`lg:hidden fixed top-16 right-0 bottom-0 z-40 w-72 bg-white shadow-xl transform transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
        >
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path || pathname.startsWith(item.path + '/')
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}

            <div className="my-4 border-t border-neutral-100" />

            {secondaryNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.path
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                    ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white'
                    : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )
            })}
          </nav>

          {/* Mobile User Section */}
          <div className="absolute bottom-0 inset-x-0 p-4 border-t border-neutral-100 bg-white">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-neutral-900 truncate">
                  {displayName}
                </p>
                <p className="text-xs text-neutral-500">
                  {isOwner ? 'Administrador' : 'Médico'}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full justify-center"
              onClick={handleSignOut}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sair
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <main className="flex-1 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AppLayout
