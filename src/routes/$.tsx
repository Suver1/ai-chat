import { createFileRoute } from '@tanstack/react-router'
import ChatPromptContainer from '~/components/chatPrompt/ChatPromptContainer'
import ChatMessageList from '~/components/chatMessageList/ChatMessageList'
import Menu from '~/components/menu/Menu'
import PageNotFound from '~/components/PageNotFound'
import { useState, useCallback } from 'react'
import { useWindowWidth, md } from '~/hooks/useWindowSize'

export const Route = createFileRoute('/$')({
  ssr: false,
  component: Home,
  notFoundComponent: PageNotFound,
})

function Home() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Auto-close when resized to not mobile
  useWindowWidth((width) => {
    if (width >= md) setIsSidebarOpen(false)
  })

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((v) => !v)
  }, [])

  const closeSidebar = useCallback(() => setIsSidebarOpen(false), [])

  return (
    <div className="flex h-svh overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`w-60 h-full bg-sidebar-background bg-sidebar-foreground sidebar-transition
        fixed z-30 top-0 left-0 md:static md:translate-x-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        md:block`}
        aria-label="Main navigation"
      >
        <div className="h-full flex flex-col">
          <div className="flex-1 min-h-0 p-4 flex flex-col gap-4">
            <Menu onNavigate={closeSidebar} />
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile when sidebar open */}
      {isSidebarOpen && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Main content */}
      <main className="relative flex-1 bg-chat-background bg-chat-foreground h-full">
        {/* Mobile menu toggle */}
        <button
          type="button"
          aria-label="Toggle menu"
          className="focus-ring absolute top-2 left-2 z-10 md:hidden p-2 rounded-md bg-sidebar-background/80 backdrop-blur-sm border border-white/10 text-sm"
          onClick={toggleSidebar}
        >
          {isSidebarOpen ? 'Close' : 'Menu'}
        </button>
        {/* Full-height scroll layer */}
        <div className="absolute inset-0" id="chat-scroll-layer">
          <div
            id="chat-scroll-container"
            className="absolute inset-0 overflow-y-auto"
          >
            <div className="mx-auto flex w-full flex-col min-h-full max-w-3xl px-4 pt-4 pb-56">
              <ChatMessageList />
            </div>
          </div>
        </div>
        {/* Overlay prompt (doesn't affect scroll height) */}
        <div
          className={`absolute bottom-0 w-full px-4 pb-2 transition-opacity ${
            isSidebarOpen ? 'pointer-events-none' : ''
          }`}
          aria-disabled={isSidebarOpen ? 'true' : 'false'}
        >
          <div className="max-w-3xl mx-auto">
            <ChatPromptContainer disabled={isSidebarOpen} />
          </div>
        </div>
      </main>
    </div>
  )
}
