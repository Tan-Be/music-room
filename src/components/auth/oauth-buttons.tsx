'use client'

import { GoogleLoginButton } from './google-login-button'
import { GithubLoginButton } from './github-login-button'
import { SpotifyLoginButton } from './spotify-login-button'

interface OAuthButtonsProps {
  className?: string
  showSpotify?: boolean
}

export function OAuthButtons({ className, showSpotify = true }: OAuthButtonsProps) {
  return (
    <div className={className}>
      <div className="space-y-3">
        <GoogleLoginButton />
        <GithubLoginButton />
        {showSpotify && <SpotifyLoginButton />}
      </div>
    </div>
  )
}
