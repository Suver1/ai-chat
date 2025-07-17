import { socialSignIn, useSession, socialSignOut } from '~/auth/authClient'
import Loader from '../loader'
import { useCallback, useEffect } from 'react'
import { Link } from '@tanstack/react-router'

export default function Auth() {
  const { data, isPending, error } = useSession()
  console.log('Session:', { data, isPending, error })

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
          Logged in as
          <br />
          <Link to="/profile">{data.user.name || data.user.email}</Link>
        </div>
      ) : (
        <Link to="/auth">Login</Link>
      )}
    </div>
  )
}
