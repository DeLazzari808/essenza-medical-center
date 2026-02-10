// @ts-nocheck
import React, { useState } from 'react'
import { Building2 } from 'lucide-react'

const LogoDisplay = () => {
  const [logoSrc, setLogoSrc] = useState('/assets/images/essenza-logo.svg')
  const [showFallback, setShowFallback] = useState(false)

  if (showFallback) {
    return (
      <div className="inline-flex items-center justify-center w-32 h-32 rounded-xl gradient-primary shadow-lg">
        <Building2 className="w-16 h-16 text-white" />
      </div>
    )
  }

  return (
    <img
      src={logoSrc}
      alt="Essenza Medical Center"
      className="h-32 w-auto object-contain"
      onError={() => {
        if (logoSrc.includes('.svg')) {
          setLogoSrc('/assets/images/LOGO ESSENZA_page-0002.jpg')
        } else {
          setShowFallback(true)
        }
      }}
    />
  )
}

export default LogoDisplay
