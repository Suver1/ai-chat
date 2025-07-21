import { createFileRoute, Link } from '@tanstack/react-router'
import { socialSignOut, useSession } from '~/auth/authClient'
import SignOutIcon from '/signout-icon.svg'
import Loader from '~/components/loader'
import { useCallback, useState } from 'react'

export const Route = createFileRoute('/_authed/profile')({
  component: Profile,
})

function Profile() {
  const { data, isPending, error } = useSession()
  const [signoutError, setSignoutError] = useState('')

  const handleSignOut = useCallback(
    async (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      e.preventDefault()
      try {
        setSignoutError('')
        const response = await socialSignOut()
        if (response.data?.success) {
          window.location.href = '/'
        } else {
          setSignoutError('Failed to sign out. Please try again.')
        }
      } catch (error) {
        console.error('Error signing out:', error)
        setSignoutError('Failed to sign out. Please try again.')
      }
    },
    [setSignoutError]
  )

  return (
    <div className="bg-chat-background bg-chat-foreground text-center w-full h-svh p-30 flex flex-col gap-2 items-center">
      Hello {data?.user.name || 'you'}!
      <p>
        {isPending ? (
          <Loader />
        ) : (
          <Link
            to="/$"
            className="link flex items-center gap-0.5"
            onClick={handleSignOut}
          >
            <img src={SignOutIcon} height={24} width={24} />
            <span>Sign out</span>
          </Link>
        )}
      </p>
      {!!signoutError && <p className="error">{signoutError}</p>}
      {!!error && <p className="error">{error.message}</p>}
    </div>
  )
}
