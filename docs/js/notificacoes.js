import { supabase } from './supabase-config.js'

let pollingInterval = null

export async function fetchNaoLidas(userId) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('destinatario_id', userId)
    .eq('lida', false)
    .order('created_at', { ascending: false })
  if (error) { console.error('Erro notificacoes:', error); return [] }
  return data || []
}

export async function fetchTodas(userId, limite = 50) {
  const { data, error } = await supabase
    .from('notificacoes')
    .select('*')
    .eq('destinatario_id', userId)
    .order('created_at', { ascending: false })
    .limit(limite)
  if (error) { console.error('Erro notificacoes:', error); return [] }
  return data || []
}

export async function marcarComoLida(id) {
  const { error } = await supabase
    .from('notificacoes')
    .update({ lida: true })
    .eq('id', id)
  if (error) console.error('Erro ao marcar lida:', error)
}

export function atualizarBadge(count) {
  const badges = document.querySelectorAll('.notif-badge')
  badges.forEach(b => {
    if (count > 0) {
      b.textContent = count > 9 ? '9+' : count
      b.style.display = 'flex'
    } else {
      b.style.display = 'none'
    }
  })
}

export async function refreshBadge(userId) {
  const naoLidas = await fetchNaoLidas(userId)
  atualizarBadge(naoLidas.length)
  return naoLidas
}

export function iniciarPolling(userId, intervaloMs = 30000) {
  pararPolling()
  refreshBadge(userId)
  pollingInterval = setInterval(() => refreshBadge(userId), intervaloMs)
}

export function pararPolling() {
  if (pollingInterval) {
    clearInterval(pollingInterval)
    pollingInterval = null
  }
}
