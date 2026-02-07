// @ts-nocheck
import React, { useState } from 'react'
import { Building2 } from 'lucide-react'

const LogoDisplay = () => {
  const [logoSrc, setLogoSrc] = useState('/assets/images/LOGO ESSENZA_page-0002.jpg')
  const [showFallback, setShowFallback] = useState(false)

  if (showFallback) {
    return (
      <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl gradient-primary shadow-lg">
        <Building2 className="w-5 h-5 text-white" />
      </div>
    )
  }

  return (
    <img
      src={logoSrc}
      alt="Essenza Medical Center"
      className="h-14 w-auto"
      onError={() => {
        if (logoSrc.includes('.svg')) {
          setLogoSrc('/assets/images/logo.png')
        } else {
          setShowFallback(true)
        }
      }}
    />
  )
}

export default LogoDisplay
