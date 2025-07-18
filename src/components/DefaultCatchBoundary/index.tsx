import {
  ErrorComponent,
  Link,
  rootRouteId,
  useMatch,
  useRouter,
} from '@tanstack/react-router'
import type { ErrorComponentProps } from '@tanstack/react-router'

export default function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter()
  const isRoot = useMatch({
    strict: false,
    select: (state) => state.id === rootRouteId,
  })

  console.error(error)

  return (
    <div className="bg-chat-background bg-chat-foreground text-center w-full h-svh min-w-0 flex-1 p-4 flex flex-col items-center justify-center gap-6">
      <ErrorComponent error={error} />
      <div className="flex gap-2 items-center flex-wrap">
        <button
          onClick={() => {
            router.invalidate()
          }}
          className={`w-full p-2 rounded bg-primary bg-primary-foreground cursor-pointer`}
        >
          Try Again
        </button>
        {isRoot ? (
          <Link
            to="/$"
            className={`w-full p-2 rounded bg-primary bg-primary-foreground cursor-pointer`}
          >
            Home
          </Link>
        ) : (
          <Link
            to="/$"
            className={`w-full p-2 rounded bg-primary bg-primary-foreground cursor-pointer`}
            onClick={(e) => {
              e.preventDefault()
              window.history.back()
            }}
          >
            Go Back
          </Link>
        )}
      </div>
    </div>
  )
}
