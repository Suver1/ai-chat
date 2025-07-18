import { createServerFn } from '@tanstack/react-start'
import { authMiddleware } from './middleware/auth'
import { auth } from '~/auth/auth'
import { objectToHeaders } from './utils/header'
import { getHeaders } from '@tanstack/react-start/server'

export const fetchUser = createServerFn({ method: 'GET' }).handler(async () => {
  const headers = objectToHeaders(getHeaders())
  const session = await auth.api.getSession({ headers })

  if (!session?.user?.id) {
    return {
      session: undefined,
      user: undefined,
    }
  }
  return {
    session: session.session,
    user: session.user,
  }
})
