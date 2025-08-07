'use client'

import { UserList } from '@/components/user/UserList'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function UsersPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">User Management</h1>
              <p className="text-slate-600">Manage users and their assignments</p>
            </div>
          </div>
          
          <UserList />
        </div>
      </div>
    </div>
  )
}
