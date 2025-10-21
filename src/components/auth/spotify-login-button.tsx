'use client'

import { useAuth } from '@/contexts/auth-context'
import { Button } from '@/components/ui/button'
import { Icons } from '@/components/icons'

export function SpotifyLoginButton() {
  const { signInWithSpotify, isLoading } = useAuth()

  const handleSpotifyLogin = async () => {
    try {
      await signInWithSpotify()
    } catch (err) {
      // Error is handled by the auth context
      console.error('Spotify login error:', err)
    }
  }

  return (
    <Button
      variant="outline"
      onClick={handleSpotifyLogin}
      disabled={isLoading}
      className="w-full flex items-center gap-2"
    >
      <Icons.music className="h-5 w-5 text-green-500" />
      Войти через Spotify
    </Button>
  )
}
