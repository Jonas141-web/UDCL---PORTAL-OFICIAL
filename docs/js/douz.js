import { supabase } from './supabase-config.js'

export const TIPOS = [
  'Decreto', 'Lei Ordinária', 'Lei Complementar', 'Emenda Constitucional',
  'Resolução', 'Sentença', 'Acórdão', 'Ato Administrativo',
  'Portaria', 'Edital', 'Comunicado', 'Marco Histórico'
]

export const CORES_TIPO = {
  'Decreto': '#1B3A6B',
  'Lei Ordinária': '#2E7D32',
  'Lei Complementar': '#1B5E20',
  'Emenda Constitucional': '#D4AF37',
  'Resolução': '#7B1FA2',
  'Sentença': '#C62828',
  'Acórdão': '#8B1A1A',
  'Ato Administrativo': '#616161',
  'Portaria': '#9E9E9E',
  'Edital': '#E65100',
  'Comunicado': '#00ACC1',
  'Marco Histórico': '#D4AF37'
}

export async function listarPublicacoes({ tipo, busca, pagina = 1, porPagina = 10 } = {}) {
  let query = supabase
    .from('douz_publicacoes')
    .select('*', { count: 'exact' })
    .eq('status', 'Publicado')
    .order('published_at', { ascending: false })

  if (tipo && tipo !== 'all') query = query.eq('tipo', tipo)
  if (busca) query = query.or(`titulo.ilike.%${busca}%,ementa.ilike.%${busca}%`)

  const from = (pagina - 1) * porPagina
  query = query.range(from, from + porPagina - 1)

  const { data, error, count } = await query
  if (error) { console.error('Erro publicacoes:', error); return { data: [], total: 0 } }
  return { data: data || [], total: count || 0 }
}

export async function listarUltimas(limite = 5) {
  const { data, error } = await supabase
    .from('douz_publicacoes')
    .select('*')
    .eq('status', 'Publicado')
    .order('published_at', { ascending: false })
    .limit(limite)
  if (error) { console.error('Erro ultimas:', error); return [] }
  return data || []
}

export async function listarRascunhos(userId) {
  const { data, error } = await supabase
    .from('douz_publicacoes')
    .select('*')
    .eq('autor_id', userId)
    .eq('status', 'Rascunho')
    .order('created_at', { ascending: false })
  if (error) { console.error('Erro rascunhos:', error); return [] }
  return data || []
}

export async function criarPublicacao({ tipo, titulo, ementa, conteudo, requer_consenso, autor_id, autor_nome, status }) {
  const payload = {
    tipo,
    titulo,
    ementa,
    conteudo,
    requer_consenso: requer_consenso || false,
    autor_id,
    autor_nome,
    status
  }

  if (status === 'Publicado') {
    payload.published_at = new Date().toISOString()
  }

  const { data, error } = await supabase
    .from('douz_publicacoes')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function publicarNoDouz(publicacaoId) {
  try {
    const { data, error } = await supabase.rpc('publicar_no_douz', {
      publicacao_id: publicacaoId
    })
    if (error) console.warn('RPC publicar_no_douz:', error.message)
    return data
  } catch (e) {
    console.warn('RPC publicar_no_douz nao disponivel:', e.message)
  }
}

export function corTipo(tipo) {
  return CORES_TIPO[tipo] || '#616161'
}
