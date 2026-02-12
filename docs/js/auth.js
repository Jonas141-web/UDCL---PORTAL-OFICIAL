import { supabase } from './supabase-config.js?v=20250212'

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function registro(email, password, nome) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nome } }
  })
  if (error) throw error
  return data
}

export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getSession() {
  const { data: { session } } = await supabase.auth.getSession()
  return session
}

export async function isLoggedIn() {
  const session = await getSession()
  return !!session
}

export function getUserName(user) {
  if (!user) return ''
  return user.user_metadata?.nome || user.email
}

export async function requireAuth() {
  const logged = await isLoggedIn()
  if (!logged) {
    window.location.href = 'index.html'
    return null
  }
  return await getUser()
}
