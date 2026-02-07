// @ts-nocheck
import { create } from 'zustand'
import { supabase } from '../services/supabase'

export type Period = 'morning' | 'afternoon'

export interface Booking {
  id: string
  room_id: string
  user_id: string
  date: string // formato YYYY-MM-DD
  period: Period
  total_price: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  notes?: string
  created_at: string
  updated_at: string
  room?: {
    id: string
    title: string
    address: string
    price_per_period: number
    room_type: string
  }
  user?: {
    id: string
    name: string
    email: string
  }
}

export interface BookingData {
  room_id: string
  user_id: string
  date: string
  period: Period
  total_price: number
  notes?: string
}

interface BookingStore {
  bookings: Booking[]
  loading: boolean
  error: string | null
  fetchBookings: (userId: string) => Promise<{ success: boolean; data?: Booking[]; error?: string }>
  fetchRoomBookings: (roomId: string) => Promise<{ success: boolean; data?: Booking[]; error?: string }>
  fetchRoomAvailability: (roomId: string, startDate: string, endDate: string) => Promise<{ success: boolean; data?: Booking[]; error?: string }>
  createBooking: (bookingData: BookingData) => Promise<{ success: boolean; data?: Booking; error?: string }>
  createMultipleBookings: (bookings: BookingData[]) => Promise<{ success: boolean; data?: Booking[]; error?: string }>
  cancelBooking: (bookingId: string) => Promise<{ success: boolean; error?: string }>
  clearBookings: () => void
}

export const useBookingStore = create<BookingStore>((set) => ({
  bookings: [],
  loading: false,
  error: null,

  // Buscar reservas do usuário logado
  fetchBookings: async (userId) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          room:rooms (
            id,
            title,
            address,
            price_per_period,
            room_type
          )
        `)
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error

      set({ bookings: data || [] })
      return { success: true, data: data || [] }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Buscar reservas de uma sala (para admin)
  fetchRoomBookings: async (roomId) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          user:profiles (
            id,
            name,
            email
          )
        `)
        .eq('room_id', roomId)
        .order('date', { ascending: false })

      if (error) throw error

      set({ bookings: data || [] })
      return { success: true, data: data || [] }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Buscar disponibilidade de uma sala em um período de datas
  fetchRoomAvailability: async (roomId, startDate, endDate) => {
    try {
      set({ loading: true, error: null })

      const { data, error } = await supabase
        .from('bookings')
        .select('id, date, period, status')
        .eq('room_id', roomId)
        .gte('date', startDate)
        .lte('date', endDate)
        .in('status', ['pending', 'confirmed'])

      if (error) throw error

      return { success: true, data: data || [] }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Criar nova reserva (um período)
  createBooking: async (bookingData) => {
    try {
      set({ loading: true, error: null })

      // Validar conflito (mesmo room_id + date + period)
      const { data: conflicting, error: checkError } = await supabase
        .from('bookings')
        .select('id')
        .eq('room_id', bookingData.room_id)
        .eq('date', bookingData.date)
        .eq('period', bookingData.period)
        .in('status', ['pending', 'confirmed'])

      if (checkError) throw checkError
      if (conflicting && conflicting.length > 0) {
        throw new Error('Este período já está reservado')
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookingData)
        .select()
        .single()

      if (error) throw error

      set((state) => ({
        bookings: [data, ...state.bookings],
      }))

      return { success: true, data }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Criar múltiplas reservas de uma vez
  createMultipleBookings: async (bookings) => {
    try {
      set({ loading: true, error: null })

      // Validar conflitos para todos os períodos
      for (const booking of bookings) {
        const { data: conflicting, error: checkError } = await supabase
          .from('bookings')
          .select('id')
          .eq('room_id', booking.room_id)
          .eq('date', booking.date)
          .eq('period', booking.period)
          .in('status', ['pending', 'confirmed'])

        if (checkError) throw checkError
        if (conflicting && conflicting.length > 0) {
          throw new Error(`O período ${booking.period === 'morning' ? 'Manhã' : 'Tarde'} do dia ${booking.date} já está reservado`)
        }
      }

      const { data, error } = await supabase
        .from('bookings')
        .insert(bookings)
        .select()

      if (error) throw error

      set((state) => ({
        bookings: [...(data || []), ...state.bookings],
      }))

      return { success: true, data: data || [] }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Cancelar reserva
  cancelBooking: async (bookingId) => {
    try {
      set({ loading: true, error: null })

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' })
        .eq('id', bookingId)

      if (error) throw error

      set((state) => ({
        bookings: state.bookings.map((b) =>
          b.id === bookingId ? { ...b, status: 'cancelled' } : b
        ),
      }))

      return { success: true }
    } catch (error: any) {
      set({ error: error.message })
      return { success: false, error: error.message }
    } finally {
      set({ loading: false })
    }
  },

  // Limpar reservas
  clearBookings: () => {
    set({ bookings: [], error: null })
  },
}))
