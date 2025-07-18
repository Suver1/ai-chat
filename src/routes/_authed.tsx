import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    console.log({ context })
    if (!context || !context.session) {
      throw new Error('Not authenticated')
    }
  },
  errorComponent: ({ error }) => {
    if (error.message === 'Not authenticated') {
      return (
        <div className="bg-chat-background bg-chat-foreground p-6 h-svh w-full">
          <p>
            Not authenticated.{' '}
            <Link to="/auth" replace className="link">
              Login here.
            </Link>
          </p>
        </div>
      )
    }

    throw error
  },
})
