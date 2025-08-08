// pages/formats/[id].js
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

import Card from '../../components/Card'
import SkeletonCard from '../../components/SkeletonCard'

export default function EditFormat() {
  const router = useRouter()
  const { id } = router.query

  const [name, setName] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!id) return
    let ignore = false

    ;(async () => {
      setLoading(true); setError(null); setNotFound(false)
      const { data, error } = await supabase
        .from('games')
        .select('id, name')
        .eq('id', id)
        .single()

      if (ignore) return
      if (error) {
        if (error.code === 'PGRST116' || error.details?.includes('Results contain 0 rows')) {
          setNotFound(true)
        } else {
          setError(error.message)
        }
      } else {
        setName(data?.name || '')
      }
      setLoading(false)
    })()

    return () => { ignore = true }
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    const value = name.trim()
    if (!value) return
    setSaving(true); setError(null)
    const { error } = await supabase.from('games').update({ name: value }).eq('id', id)
    setSaving(false)
    if (error) return setError(error.message)
    router.push('/formats')
  }

  async function handleDelete() {
    if (!confirm('¿Borrar este formato?')) return
    setDeleting(true); setError(null)
    const { error } = await supabase.from('games').delete().eq('id', id)
    setDeleting(false)
    if (error) return setError(error.message)
    router.push('/formats')
  }

  if (loading) {
    return (
      <main className="p-6">
        <SkeletonCard />
      </main>
    )
  }

  if (notFound) {
    return (
      <main className="p-6">
        <Card className="p-6">
          <p className="font-medium">Formato no encontrado</p>
          <p className="text-sm text-gray-600">Puede que se haya borrado o el enlace no sea correcto.</p>
          <div className="mt-4">
            <Link href="/formats" className="btn-outline">Volver a formatos</Link>
          </div>
        </Card>
      </main>
    )
  }

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">✏️ Editar formato</h1>
        <Link href="/formats" className="btn-outline">← Volver</Link>
      </div>

      {error && (
        <Card className="mb-4 text-red-700 bg-red-50 border-red-200">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </Card>
      )}

      <Card>
        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <label className="text-sm font-medium block mb-1.5">Nombre del formato</label>
            <input
              className="input w-full"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Commander, Modern, Draft…"
              required
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="btn-outline disabled:opacity-50"
            >
              {deleting ? 'Borrando…' : '🗑️ Borrar'}
            </button>
          </div>
        </form>
      </Card>
    </main>
  )
}
