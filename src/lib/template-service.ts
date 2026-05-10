import { supabase } from './supabase'
import type { Template } from '../types'

export type SavedTemplate = {
  id: string
  name: string
  data: Template
  is_public: boolean
  is_default: boolean
  user_id: string | null
  created_at: string
  updated_at: string
}

// Fetch all templates available to the user
// (own templates + public templates + default templates)
export async function fetchTemplates(search?: string): Promise<SavedTemplate[]> {
  let query = supabase
    .from('templates')
    .select('*')
    .order('created_at', { ascending: false })

  if (search && search.trim()) {
    query = query.ilike('name', `%${search}%`)
  }

  const { data, error } = await query
  if (error) throw error
  return data as SavedTemplate[]
}

// Save a new template
export async function saveTemplate(
  template: Template,
  isPublic: boolean
): Promise<SavedTemplate> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('templates')
    .insert({
      name: template.name,
      data: template,
      is_public: isPublic,
      is_default: false,
      user_id: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return data as SavedTemplate
}

// Update an existing template
export async function updateTemplate(
  id: string,
  template: Template,
  isPublic: boolean
): Promise<SavedTemplate> {
  const { data, error } = await supabase
    .from('templates')
    .update({
      name: template.name,
      data: template,
      is_public: isPublic,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as SavedTemplate
}

// Delete a template
export async function deleteTemplate(id: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function renameTemplate(id: string, name: string): Promise<void> {
  const { error } = await supabase
    .from('templates')
    .update({ name, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw error
}

