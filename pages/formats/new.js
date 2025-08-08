// pages/formats/new.js
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/router'
import { supabase } from '../../lib/supabaseClient'

import Card from '../../components/Card'

export default function NewFormat() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [error, setError] = useState(null)
  const [saving, setSaving] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    const value = name.trim()
    if (!value) return

    setSaving(true)
    setError(null)

    const { error } = await supabase.from('games').insert({ name: value })
    setSaving(false)

    if (error) {
      setError(error.message)
    } else {
      router.push('/formats')
    }
  }

  return (
    <main className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">➕ Nuevo formato</h1>
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
              placeholder="Commander, Pauper, Modern…"
              required
            />
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              className="btn-primary"
              disabled={saving || !name.trim()}
            >
              {saving ? 'Guardando…' : 'Crear'}
            </button>
          </div>
        </form>
      </Card>
    </main>
  )
}
