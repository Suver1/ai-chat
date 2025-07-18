import { createMiddleware } from '@tanstack/react-start'
import { getHeaders } from '@tanstack/react-start/server'
import { auth } from '~/auth/auth'
import { objectToHeaders } from '../utils/header'

export const authMiddleware = createMiddleware({ type: 'function' }).server(
  async ({ next }) => {
    const headers = objectToHeaders(getHeaders())
    const session = await auth.api.getSession({ headers })
    if (!session?.user?.id) {
      throw new Error('Unauthorized')
    }
    return next({
      context: {
        session: session.session,
        user: session.user,
      },
    })
  }
)
