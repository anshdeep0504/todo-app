'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

interface Profile {
  id: string
  username: string
  full_name: string
  updated_at: string
}

export default function ProfilesPage() {
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProfiles() {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          
        if (error) {
          throw error
        }

        setProfiles(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchProfiles()
  }, [])

  if (loading) return <div>Loading profiles...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Profiles</h1>
      <div className="grid gap-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="border p-4 rounded-lg">
            <h2 className="font-semibold">{profile.full_name}</h2>
            <p className="text-gray-600">@{profile.username}</p>
            <p className="text-sm text-gray-500">
              Last updated: {new Date(profile.updated_at).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
