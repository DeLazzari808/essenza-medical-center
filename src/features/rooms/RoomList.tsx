// @ts-nocheck
'use client'

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useRooms } from './useRooms'
import RoomCard from './RoomCard'
import FiltersPanel from './FiltersPanel'
import Loading from '../../components/Loading'
import EmptyState from '../../components/EmptyState'
import Button from '../../components/Button'
import Skeleton from '../../components/Skeleton'
import {
  Plus,
  SortAsc,
  SortDesc,
  Search,
  LayoutGrid,
  List,
  Sliders,
  MapPin,
  Star
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'

const RoomList = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { profile } = useAuthStore()
  const { rooms, loading, error, fetchRooms } = useRooms()

  // View mode state (grid/list)
  const [viewMode, setViewMode] = useState(() => {
    return searchParams.get('view') || 'grid'
  })

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    price_min: searchParams.get('price_min') || '',
    price_max: searchParams.get('price_max') || '',
    capacity: searchParams.get('capacity') || '',
    amenities: searchParams.get('amenities')?.split(',').filter(Boolean) || [],
    city: searchParams.get('city') || '',
  })
  const [sortBy, setSortBy] = useState(searchParams.get('sort') || 'created_at')
  const [sortOrder, setSortOrder] = useState(searchParams.get('order') || 'desc')

  // Update URL params when filters change
  useEffect(() => {
    const params = new URLSearchParams()
    if (filters.search) params.set('search', filters.search)
    if (filters.price_min) params.set('price_min', filters.price_min)
    if (filters.price_max) params.set('price_max', filters.price_max)
    if (filters.capacity) params.set('capacity', filters.capacity)
    if (filters.amenities?.length) params.set('amenities', filters.amenities.join(','))
    if (filters.city) params.set('city', filters.city)
    if (sortBy !== 'created_at') params.set('sort', sortBy)
    if (sortOrder !== 'desc') params.set('order', sortOrder)
    if (viewMode !== 'grid') params.set('view', viewMode)
    const queryString = params.toString()
    router.replace(queryString ? `?${queryString}` : window.location.pathname)
  }, [filters, sortBy, sortOrder, viewMode, router])

  useEffect(() => {
    fetchRooms({
      search: filters.search || undefined,
      price_min: filters.price_min || undefined,
      price_max: filters.price_max || undefined,
      capacity: filters.capacity || undefined,
      amenities: filters.amenities?.length > 0 ? filters.amenities : undefined,
      city: filters.city || undefined,
    }, sortBy, sortOrder)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters, sortBy, sortOrder])

  const isOwner = profile?.role === 'owner'

  // Quick filter chips
  const quickFilters = [
    { label: 'Salas Médicas', value: 'Sala Médica', type: 'search', icon: MapPin },
    { label: 'Estúdio', value: 'Podcast', type: 'search', icon: MapPin },
    { label: 'Bem Avaliados', value: 'rating', type: 'sort', icon: Star },
    { label: 'Menor Preço', value: 'price_asc', type: 'price', icon: SortAsc },
  ]

  const handleQuickFilter = (filter) => {
    if (filter.type === 'search') {
      setFilters(prev => ({
        ...prev,
        search: prev.search === filter.value ? '' : filter.value
      }))
    } else if (filter.type === 'sort') {
      setSortBy('rating')
      setSortOrder('desc')
    } else if (filter.type === 'price') {
      setSortBy('price')
      setSortOrder('asc')
    }
  }

  const RoomCardSkeleton = ({ viewMode }) => {
    if (viewMode === 'list') {
      return (
        <div className="rounded-2xl overflow-hidden shadow-soft border border-neutral-100 bg-white flex flex-col md:flex-row">
          <Skeleton className="h-48 md:h-auto md:w-72 flex-shrink-0" />
          <div className="p-6 flex-1 space-y-4">
            <div className="flex justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20 rounded-lg" />
                <Skeleton className="h-6 w-48 rounded-lg" />
              </div>
              <Skeleton className="h-10 w-24 rounded-lg" />
            </div>
            <Skeleton className="h-4 w-full rounded-lg" />
            <Skeleton className="h-4 w-2/3 rounded-lg" />
            <div className="pt-4 border-t border-neutral-100 flex justify-between">
              <Skeleton className="h-6 w-32 rounded-lg" />
              <Skeleton className="h-6 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="rounded-2xl overflow-hidden shadow-soft border border-neutral-100 bg-white">
        <Skeleton className="h-56 w-full" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-3/4 rounded-lg" />
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-4 w-1/2 rounded-lg" />
          <div className="pt-4 border-t border-neutral-100 flex justify-between">
            <Skeleton className="h-6 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-neutral-900">
              {isOwner ? 'Gerenciar Espaços' : 'Espaços Clínicos'}
            </h1>
            <p className="text-neutral-500 mt-1">
              {isOwner ? 'Gerencie os espaços clínicos do Essenza Medical Center.' : 'Encontre o espaço ideal para sua prática médica.'}
            </p>
          </div>

          {isOwner && (
            <Button
              onClick={() => router.push('/app/rooms/new')}
              variant="primary"
              className="shadow-lg shadow-primary-500/20"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Espaço
            </Button>
          )}
        </div>

        {/* Filtros */}
        {!isOwner && (
          <div className="space-y-6">
            <FiltersPanel onFiltersChange={setFilters} filters={filters} />

            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-neutral-500 mr-2">Filtros rápidos:</span>
              {quickFilters.map((filter) => {
                const isActive =
                  (filter.type === 'search' && filters.search === filter.value) ||
                  (filter.type === 'sort' && sortBy === 'rating') ||
                  (filter.type === 'price' && sortBy === 'price' && sortOrder === 'asc')
                const Icon = filter.icon
                return (
                  <button
                    key={filter.label}
                    onClick={() => handleQuickFilter(filter)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-primary-100 text-primary-700 ring-2 ring-primary-200'
                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {filter.label}
                  </button>
                )
              })}
            </div>

            {/* Ordenação, Contagem e View Toggle */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-neutral-500 mr-2">Ordenar por:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'price') {
                      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
                    } else {
                      setSortBy('price')
                      setSortOrder('asc')
                    }
                  }}
                  className={`flex items-center gap-2 ${sortBy === 'price' ? 'text-primary-600 bg-primary-50' : 'text-neutral-600'}`}
                >
                  Preço
                  {sortBy === 'price' && (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'created_at') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                    } else {
                      setSortBy('created_at')
                      setSortOrder('desc')
                    }
                  }}
                  className={`flex items-center gap-2 ${sortBy === 'created_at' ? 'text-primary-600 bg-primary-50' : 'text-neutral-600'}`}
                >
                  Recentes
                  {sortBy === 'created_at' && (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    if (sortBy === 'capacity') {
                      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')
                    } else {
                      setSortBy('capacity')
                      setSortOrder('desc')
                    }
                  }}
                  className={`flex items-center gap-2 ${sortBy === 'capacity' ? 'text-primary-600 bg-primary-50' : 'text-neutral-600'}`}
                >
                  Capacidade
                  {sortBy === 'capacity' && (
                    sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <div className="flex items-center gap-4">
                {/* Results count */}
                <div className="text-sm font-medium text-neutral-500">
                  {loading
                    ? <Skeleton className="w-32 h-4 rounded" />
                    : `${rooms.length} espaço${rooms.length !== 1 ? 's' : ''} encontrado${rooms.length !== 1 ? 's' : ''}`
                  }
                </div>

                {/* View Toggle */}
                <div className="flex items-center bg-neutral-100 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'grid'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                    title="Visualização em grade"
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === 'list'
                        ? 'bg-white text-primary-600 shadow-sm'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                    title="Visualização em lista"
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Owner view toggle (simplified) */}
        {isOwner && (
          <div className="flex justify-end mb-6">
            <div className="flex items-center bg-neutral-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                title="Visualização em grade"
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-all ${
                  viewMode === 'list'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
                title="Visualização em lista"
              >
                <List className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Lista de salas */}
        {loading ? (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            : "flex flex-col gap-6 mt-6"
          }>
            {[1, 2, 3, 4, 5, 6].map(i => <RoomCardSkeleton key={i} viewMode={viewMode} />)}
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl flex items-center gap-3 mt-6">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            {error}
          </div>
        ) : rooms.length === 0 ? (
          <div className="mt-12">
            <EmptyState
              title={isOwner ? 'Nenhum espaço cadastrado' : 'Nenhum espaço encontrado'}
              description={
                isOwner
                  ? 'Comece adicionando o primeiro espaço clínico do Essenza Medical Center.'
                  : 'Não encontramos espaços com os filtros selecionados. Tente remover alguns filtros.'
              }
              action={
                isOwner ? (
                  <Button onClick={() => router.push('/app/rooms/new')} variant="primary" size="lg">
                    Adicionar Primeiro Espaço
                  </Button>
                ) : (
                  <Button onClick={() => setFilters({
                    search: '',
                    price_min: '',
                    price_max: '',
                    capacity: '',
                    amenities: [],
                    city: '',
                  })} variant="outline">
                    Limpar Filtros
                  </Button>
                )
              }
            />
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6"
            : "flex flex-col gap-6 mt-6"
          }>
            {rooms.map((room) => (
              <RoomCard key={room.id} room={room} viewMode={viewMode} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default RoomList
