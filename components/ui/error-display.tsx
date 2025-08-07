import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface ErrorDisplayProps {
  error: string
  onRetry?: () => void
}

export function ErrorDisplay({ error, onRetry }: ErrorDisplayProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center bg-white p-8 rounded-2xl shadow-lg max-w-md">
        <div className="flex justify-center mb-4">
          <AlertCircle className="h-12 w-12 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        {onRetry && (
          <Button onClick={onRetry} variant="default">
            Retry
          </Button>
        )}
      </div>
    </div>
  )
}
