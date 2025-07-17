import { createAuthClient } from 'better-auth/react'
export const authClient = createAuthClient()
export const { signIn, signOut, useSession, getSession } = authClient

export const socialSignIn = async () => {
  return await signIn.social({
    provider: 'google',
  })
}

export const socialSignOut = async () => {
  return await signOut()
}
