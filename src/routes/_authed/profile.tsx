import { createFileRoute } from '@tanstack/react-router'
import { useSession } from '~/auth/authClient'

export const Route = createFileRoute('/_authed/profile')({
  component: Profile,
})

function Profile() {
  const { data, isPending, error } = useSession()
  return <div>Hello {data?.user.name || 'you'}!</div>
}
