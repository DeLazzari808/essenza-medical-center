// @ts-nocheck
/**
 * Supabase Client - Database only (auth handled by Clerk)
 *
 * Se as variáveis de ambiente do Supabase não estiverem configuradas,
 * ou se FORCE_MOCK estiver ativo, usa o mock local.
 */

import { mockSupabase } from './mockService'
import { createClient } from '@supabase/supabase-js'

// Flag para forçar uso do mock (útil para desenvolvimento)
const FORCE_MOCK = false // Altere para true para usar dados mock locais

function getSupabaseClient() {
  if (FORCE_MOCK) {
    return mockSupabase
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Supabase env vars not set, falling back to mock')
    return mockSupabase
  }

  return createClient(supabaseUrl, supabaseAnonKey)
}

/**
 * Cliente Supabase (ou Mock) configurado para a aplicação
 * Usado apenas para operações de banco de dados (auth via Clerk)
 */
export const supabase = getSupabaseClient()

/**
 * Roles de usuário disponíveis no sistema
 */
export const USER_ROLES = {
  OWNER: 'owner',
  TENANT: 'tenant',
}

export default supabase
