import { WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function OfflinePage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <div className="mx-auto h-20 w-20 rounded-full bg-red-100 dark:bg-red-900 flex items-center justify-center mb-4">
            <WifiOff className="h-10 w-10 text-red-600 dark:text-red-400" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Нет подключения</h1>
          <p className="text-muted-foreground">
            Проверьте подключение к интернету и попробуйте снова
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => window.location.reload()}
            className="w-full"
          >
            Попробовать снова
          </Button>
          
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="w-full"
          >
            Назад
          </Button>
        </div>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            💡 <strong>Совет:</strong> Некоторые функции могут работать в автономном режиме
          </p>
        </div>
      </Card>
    </div>
  )
}
