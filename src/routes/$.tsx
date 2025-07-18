import { createFileRoute } from '@tanstack/react-router'
import Chat from '~/components/chat/Chat'
import ChatMessages from '~/components/chat/ChatMessages'
import Menu from '~/components/menu/Menu'
import PageNotFound from '~/components/PageNotFound'

export const Route = createFileRoute('/$')({
  ssr: false,
  component: Home,
  notFoundComponent: PageNotFound,
})

function Home() {
  return (
    <div className="flex">
      <aside className="w-60 h-svh">
        <div className="h-full bg-sidebar-background bg-sidebar-foreground">
          <Menu />
        </div>
      </aside>
      <main className="relative flex-1">
        <div className="absolute bottom-0 top-0 w-full bg-chat-background bg-chat-foreground">
          <div className="absolute overflow-y-scroll inset-0">
            <div className="mx-auto flex w-full flex-col h-svh max-w-3xl">
              <div className="" style={{ paddingBottom: 160 }}>
                <ChatMessages />
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full z-2 pr-4">
          <div className="relative max-w-3xl mx-auto">
            <Chat />
          </div>
        </div>
      </main>
    </div>
  )
}
