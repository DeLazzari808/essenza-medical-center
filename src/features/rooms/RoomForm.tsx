// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useRooms } from './useRooms'
import { useAuthStore } from '../../store/useAuthStore'
import { useToast } from '../../contexts/ToastContext'
import Card from '../../components/Card'
import Button from '../../components/Button'
import Input from '../../components/Input'
import ImageUploader from '../../components/ImageUploader/ImageUploader'
import Loading from '../../components/Loading'
import {
  Building2,
  MapPin,
  DollarSign,
  Users,
  Check,
  ArrowLeft,
  ArrowRight,
  FileText,
  Image as ImageIcon,
  CheckCircle2
} from 'lucide-react'

const AMENITIES = [
  'Wi-Fi',
  'Ar condicionado',
  'Projetor',
  'Estacionamento',
  'Café grátis',
  'Escritório',
  'Sala de reunião',
  'Pontos de energia',
  'Rede privada',
  'Equipamentos de vídeo',
]

const STEPS = [
  { id: 1, title: 'Informações', description: 'Dados básicos do espaço', icon: Building2 },
  { id: 2, title: 'Localização', description: 'Endereço completo', icon: MapPin },
  { id: 3, title: 'Comodidades', description: 'Recursos disponíveis', icon: Check },
  { id: 4, title: 'Fotos', description: 'Galeria de imagens', icon: ImageIcon },
]

const StepIndicator = ({ steps, currentStep, onStepClick }) => {
  return (
    <div className="mb-8">
      {/* Desktop Steps */}
      <div className="hidden md:flex items-center justify-between relative">
        {/* Progress Line Background */}
        <div className="absolute top-6 left-0 right-0 h-0.5 bg-neutral-200" />
        {/* Progress Line Active */}
        <div
          className="absolute top-6 left-0 h-0.5 bg-primary-500 transition-all duration-500"
          style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, index) => {
          const isActive = currentStep === step.id
          const isCompleted = currentStep > step.id
          const Icon = step.icon

          return (
            <button
              key={step.id}
              onClick={() => onStepClick(step.id)}
              className="relative z-10 flex flex-col items-center group"
              disabled={step.id > currentStep + 1}
            >
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300
                ${isCompleted
                  ? 'bg-primary-500 text-white'
                  : isActive
                    ? 'bg-primary-500 text-white ring-4 ring-primary-100 scale-110'
                    : 'bg-white border-2 border-neutral-200 text-neutral-400 group-hover:border-neutral-300'
                }
              `}>
                {isCompleted ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>
              <div className="mt-3 text-center">
                <p className={`text-sm font-semibold transition-colors ${
                  isActive || isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                }`}>
                  {step.title}
                </p>
                <p className={`text-xs mt-0.5 transition-colors ${
                  isActive || isCompleted ? 'text-neutral-500' : 'text-neutral-300'
                }`}>
                  {step.description}
                </p>
              </div>
            </button>
          )
        })}
      </div>

      {/* Mobile Steps */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-neutral-500">
            Passo {currentStep} de {steps.length}
          </span>
          <span className="text-sm font-semibold text-primary-600">
            {steps[currentStep - 1].title}
          </span>
        </div>
        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

const RoomForm = () => {
  const router = useRouter()
  const { id } = useParams()
  const { profile } = useAuthStore()
  const { createRoom, updateRoom, fetchRoom } = useRooms()
  const { showToast } = useToast()

  // Verificar se o usuário é administrador
  const isAdmin = profile?.role === 'owner'

  // Redirecionar se não for admin
  useEffect(() => {
    if (profile && !isAdmin) {
      showToast('Acesso restrito a administradores', 'error')
      router.push('/app/rooms')
    }
  }, [profile, isAdmin, router, showToast])

  const [loading, setLoading] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    price_per_day: '',
    capacity: '',
    amenities: [],
  })
  const [images, setImages] = useState([])
  const [errors, setErrors] = useState({})
  const isEditing = Boolean(id)

  useEffect(() => {
    if (isEditing && id) {
      loadRoomData()
    }
  }, [id])

  const loadRoomData = async () => {
    try {
      setLoading(true)
      const result = await fetchRoom(id)
      if (result.success) {
        const room = result.data
        setFormData({
          title: room.title || '',
          description: room.description || '',
          address: room.address || '',
          city: room.city || '',
          state: room.state || '',
          zip_code: room.zip_code || '',
          price_per_day: room.price_per_day || room.price_per_hour || '',
          capacity: room.capacity?.toString() || '',
          amenities: room.amenities || [],
        })
        setImages(room.images || [])
      }
    } catch (err) {
      showToast('Erro ao carregar dados do espaço', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  const handleAmenityToggle = (amenity) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter((a) => a !== amenity)
        : [...prev.amenities, amenity],
    }))
  }

  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          newErrors.title = 'Título é obrigatório'
        }
        if (!formData.price_per_day || parseFloat(formData.price_per_day) <= 0) {
          newErrors.price_per_day = 'Preço por período é obrigatório'
        }
        if (!formData.capacity || parseInt(formData.capacity) <= 0) {
          newErrors.capacity = 'Capacidade é obrigatória'
        }
        break
      case 2:
        if (!formData.address.trim()) {
          newErrors.address = 'Endereço é obrigatório'
        }
        if (!formData.city.trim()) {
          newErrors.city = 'Cidade é obrigatória'
        }
        break
      case 3:
        // Amenities are optional
        break
      case 4:
        if (images.length === 0) {
          newErrors.images = 'Adicione pelo menos uma imagem'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1)
      }
    } else {
      showToast('Corrija os erros antes de continuar', 'error')
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleStepClick = (step) => {
    // Allow going back or to any completed step
    if (step < currentStep) {
      setCurrentStep(step)
    } else if (step === currentStep + 1) {
      // Only allow going forward one step if current is valid
      if (validateStep(currentStep)) {
        setCurrentStep(step)
      }
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()

    // Validate all steps
    let hasErrors = false
    for (let step = 1; step <= STEPS.length; step++) {
      if (!validateStep(step)) {
        hasErrors = true
        setCurrentStep(step)
        break
      }
    }

    if (hasErrors) {
      showToast('Corrija os erros no formulário', 'error')
      return
    }

    try {
      setLoading(true)

      const roomData = {
        title: formData.title,
        description: formData.description,
        address: formData.address,
        city: formData.city,
        state: formData.state || null,
        zip_code: formData.zip_code || null,
        price_per_day: parseFloat(formData.price_per_day),
        capacity: parseInt(formData.capacity),
        amenities: formData.amenities,
        images,
      }

      let result
      if (isEditing) {
        result = await updateRoom(id, roomData)
      } else {
        result = await createRoom(roomData)
      }

      if (result.success) {
        showToast(
          isEditing ? 'Espaço atualizado com sucesso!' : 'Espaço criado com sucesso!',
          'success'
        )
        router.push('/rooms')
      } else {
        showToast(result.error || 'Erro ao salvar espaço', 'error')
      }
    } catch (err) {
      console.error('Error saving room:', err)
      showToast('Erro ao salvar espaço', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (loading && isEditing) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loading />
      </div>
    )
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card className="border-0 shadow-medium animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div className="p-2 bg-primary-50 rounded-lg text-primary-600">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">Detalhes do Espaço</h2>
                <p className="text-sm text-neutral-500">Informações básicas sobre o espaço clínico</p>
              </div>
            </div>

            <div className="space-y-6">
              <Input
                label="Nome do Espaço"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Ex: Sala Médica 01, Estúdio de Podcast"
                error={errors.title}
                icon={FileText}
                required
              />

              <Input
                label="Descrição Completa"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Descreva o ambiente, iluminação, equipamentos e diferenciais..."
                type="textarea"
                rows={5}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Capacidade (pessoas)"
                  name="capacity"
                  type="number"
                  value={formData.capacity}
                  onChange={handleChange}
                  placeholder="0"
                  error={errors.capacity}
                  icon={Users}
                  required
                />

                <Input
                  label="Preço por Período (R$)"
                  name="price_per_day"
                  type="number"
                  step="0.01"
                  value={formData.price_per_day}
                  onChange={handleChange}
                  placeholder="0,00"
                  error={errors.price_per_day}
                  icon={DollarSign}
                  required
                />
              </div>
            </div>
          </Card>
        )

      case 2:
        return (
          <Card className="border-0 shadow-medium animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">Localização</h2>
                <p className="text-sm text-neutral-500">Onde fica o seu espaço</p>
              </div>
            </div>

            <div className="space-y-4">
              <Input
                label="CEP"
                name="zip_code"
                value={formData.zip_code}
                onChange={handleChange}
                placeholder="00000-000"
              />

              <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                  <Input
                    label="Cidade"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Cidade"
                    error={errors.city}
                    required
                  />
                </div>
                <Input
                  label="UF"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="UF"
                  maxLength={2}
                />
              </div>

              <Input
                label="Endereço Completo"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Logradouro, número, complemento"
                error={errors.address}
                required
                type="textarea"
                rows={3}
              />

              {/* Map Preview Placeholder */}
              <div className="mt-6 p-6 bg-neutral-50 rounded-xl border border-neutral-200 text-center">
                <MapPin className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm text-neutral-400">
                  Preview do mapa será exibido aqui
                </p>
              </div>
            </div>
          </Card>
        )

      case 3:
        return (
          <Card className="border-0 shadow-medium animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div className="p-2 bg-accent-50 rounded-lg text-accent-600">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">Comodidades</h2>
                <p className="text-sm text-neutral-500">Selecione os recursos disponíveis</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {AMENITIES.map((amenity) => {
                const isSelected = formData.amenities.includes(amenity)
                return (
                  <div
                    key={amenity}
                    onClick={() => handleAmenityToggle(amenity)}
                    className={`
                      cursor-pointer px-4 py-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-3 select-none
                      ${isSelected
                        ? 'border-primary-500 bg-primary-50 text-primary-700 font-medium shadow-sm'
                        : 'border-neutral-100 bg-white text-neutral-600 hover:border-neutral-200 hover:bg-neutral-50'
                      }
                    `}
                  >
                    <div className={`
                      w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors flex-shrink-0
                      ${isSelected ? 'bg-primary-500 border-primary-500' : 'border-neutral-300'}
                    `}>
                      {isSelected && <Check className="w-4 h-4 text-white" />}
                    </div>
                    <span className="text-sm">{amenity}</span>
                  </div>
                )
              })}
            </div>

            {formData.amenities.length > 0 && (
              <div className="mt-6 p-4 bg-primary-50 rounded-xl">
                <p className="text-sm text-primary-700 font-medium">
                  {formData.amenities.length} comodidade{formData.amenities.length !== 1 ? 's' : ''} selecionada{formData.amenities.length !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </Card>
        )

      case 4:
        return (
          <Card className="border-0 shadow-medium animate-fade-in">
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-neutral-100">
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <ImageIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-neutral-800">Galeria de Fotos</h2>
                <p className="text-sm text-neutral-500">Adicione imagens do seu espaço</p>
              </div>
            </div>

            <div className="space-y-4">
              <ImageUploader
                maxImages={10}
                onImagesChange={setImages}
                initialImages={images}
              />
              {errors.images && (
                <p className="text-red-500 text-sm font-medium flex items-center gap-2 bg-red-50 p-3 rounded-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {errors.images}
                </p>
              )}
              <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-200">
                <p className="text-xs text-neutral-500 leading-relaxed">
                  <strong className="text-neutral-700">Dicas para boas fotos:</strong>
                </p>
                <ul className="text-xs text-neutral-500 mt-2 space-y-1 list-disc list-inside">
                  <li>A primeira imagem será usada como capa</li>
                  <li>Fotografe com boa iluminação natural</li>
                  <li>Mostre diferentes ângulos do espaço</li>
                  <li>Inclua fotos dos equipamentos disponíveis</li>
                </ul>
              </div>
            </div>
          </Card>
        )

      default:
        return null
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <Button variant="ghost" onClick={() => router.push('/rooms')} className="pl-0 hover:bg-transparent hover:text-primary-600 mb-2">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar para lista
          </Button>
          <h1 className="text-3xl font-display font-bold text-neutral-900">
            {isEditing ? 'Editar Espaço' : 'Cadastrar Novo Espaço'}
          </h1>
          <p className="text-neutral-500">
            Preencha as informações abaixo para configurar o espaço clínico.
          </p>
        </div>
      </div>

      {/* Step Indicator */}
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        onStepClick={handleStepClick}
      />

      {/* Step Content */}
      <form onSubmit={handleSubmit}>
        {renderStepContent()}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-200">
          <div>
            {currentStep > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Anterior
              </Button>
            )}
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/rooms')}
            >
              Cancelar
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                type="button"
                variant="primary"
                onClick={handleNext}
              >
                Próximo
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? 'Salvando...' : isEditing ? 'Salvar Alterações' : 'Publicar Espaço'}
                <Check className="w-4 h-4 ml-2" />
              </Button>
            )}
          </div>
        </div>
      </form>

      {/* Summary Preview on Last Step */}
      {currentStep === STEPS.length && (
        <Card className="border-0 shadow-medium bg-gradient-to-br from-primary-50 to-white mt-6">
          <h3 className="text-lg font-bold text-neutral-800 mb-4">Resumo do Espaço</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3 bg-white rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">Nome</p>
              <p className="font-semibold text-neutral-800 truncate">{formData.title || '-'}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">Cidade</p>
              <p className="font-semibold text-neutral-800 truncate">{formData.city || '-'}</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">Capacidade</p>
              <p className="font-semibold text-neutral-800">{formData.capacity || '-'} pessoas</p>
            </div>
            <div className="p-3 bg-white rounded-lg border border-neutral-100">
              <p className="text-xs text-neutral-500 mb-1">Preço/período</p>
              <p className="font-semibold text-neutral-800">R$ {formData.price_per_day || '-'}</p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
            <ImageIcon className="w-4 h-4" />
            <span>{images.length} {images.length === 1 ? 'foto adicionada' : 'fotos adicionadas'}</span>
            <span className="text-neutral-300">•</span>
            <Check className="w-4 h-4" />
            <span>{formData.amenities.length} {formData.amenities.length === 1 ? 'comodidade' : 'comodidades'}</span>
          </div>
        </Card>
      )}
    </div>
  )
}

export default RoomForm
