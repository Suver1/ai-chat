import { createFileRoute, Link } from '@tanstack/react-router'
import { useSession } from '~/auth/authClient'
import GoogleSignInButton from '~/components/auth/GoogleSignInButton'

export const Route = createFileRoute('/auth')({
  component: Auth,
})

function Auth() {
  const { data, isPending, error } = useSession()
  console.log('Session:', { data, isPending, error })
  return (
    <div className="bg-chat-background bg-chat-foreground text-center w-full h-svh p-30 flex flex-col gap-2 items-center">
      <p>Welcome to Chat</p>
      {!!data?.user ? (
        <p>
          You are already signed in.{' '}
          <Link to="/$" className="link">
            Back to chat
          </Link>
        </p>
      ) : (
        <>
          <p>Sign in below</p>
          <GoogleSignInButton />
          <p>
            By continuing, you agree to our{' '}
            <Link to="/terms-of-service" className="link">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link to="/privacy-policy" className="link">
              Privacy Policy
            </Link>
          </p>
        </>
      )}
    </div>
  )
}
