import type { TourFormValues } from '../types'

const NEW_TOUR_DRAFT_KEY = 'admin-tour-form:new'

function editDraftKey(id: string) {
  return `admin-tour-form:edit:${id}`
}

export function getTourFormDraftKey(isEdit: boolean, id?: string) {
  return isEdit && id ? editDraftKey(id) : NEW_TOUR_DRAFT_KEY
}

export function readTourFormDraft(key: string): TourFormValues | null {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TourFormValues>
    if (!parsed || typeof parsed !== 'object') return null
    return {
      id: parsed.id ?? '',
      name: parsed.name ?? '',
      link: parsed.link ?? '',
      city_id: parsed.city_id ?? '',
      media_type: parsed.media_type === 'video' ? 'video' : 'virtual-tour',
      category: parsed.category ?? '',
      is_published: parsed.is_published ?? true,
      sort_order: parsed.sort_order ?? 0,
    }
  } catch {
    return null
  }
}

export function writeTourFormDraft(key: string, form: TourFormValues) {
  try {
    localStorage.setItem(key, JSON.stringify(form))
  } catch {
    // ignore quota / private mode
  }
}

export function clearTourFormDraft(key: string) {
  try {
    localStorage.removeItem(key)
  } catch {
    // ignore
  }
}

export function hasTourFormDraftContent(form: TourFormValues) {
  return Boolean(form.name.trim() || form.link.trim() || form.id.trim() || form.city_id)
}
