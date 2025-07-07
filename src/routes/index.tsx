import { createFileRoute } from '@tanstack/react-router'
import Chat from '~/components/chat/Chat'

export const Route = createFileRoute('/')({
  ssr: true,
  component: Home,
})

function Home() {
  return (
    <>
      {/* <Menu /> */}
      <Chat />
    </>
  )
}
