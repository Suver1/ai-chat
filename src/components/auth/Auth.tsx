import { socialSignIn, useSession, socialSignOut } from '~/auth/authClient'
import Loader from '../loader'
import { useCallback, useEffect } from 'react'

export default function Auth() {
  const { data, isPending, error } = useSession()
  console.log('Session:', { data, isPending, error })

  const onSignIn = useCallback(async () => {
    console.log('Auth')
    const signin = await socialSignIn()
    console.log('Auth complete', signin)
  }, [])

  const onSignOut = useCallback(async () => {
    const signout = await socialSignOut()
    console.log('signout:', signout)
  }, [])

  useEffect(() => {
    if (error) {
      console.error('Error fetching session:', error)
    }
  }, [error])

  if (isPending) {
    return <Loader />
  }

  return (
    <div>
      {error && <p className="error">Error fetching session</p>}
      {data ? (
        <div>
          <p>Welcome, {data.user.name || data.user.email}!</p>
          <button type="button" onClick={onSignOut}>
            Sign Out
          </button>
        </div>
      ) : (
        <button type="button" onClick={onSignIn}>
          Login
        </button>
      )}
    </div>
  )
}
