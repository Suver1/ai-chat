import { useChatStore } from '~/state/chat'
import { Button } from '../form/Button'
import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'
import ChatHistory from '../chatHistory/ChatHistory'
import AuthPanel from '../auth/AuthPanel'

type Props = {
  onNavigate?: () => void
}

export default function Menu({ onNavigate }: Props) {
  const clearMessages = useChatStore((state) => state.clearMessages)
  const navigate = useNavigate()

  const onNewChat = useCallback(async () => {
    console.log('Start new chat')
    clearMessages()
    // @ts-ignore /new exists due to wildcard route
    navigate({ to: '/new', replace: true })
    onNavigate?.()
  }, [clearMessages, navigate, onNavigate])

  return (
    <div className="p-4 h-full">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <header>
            <div className="flex items-center justify-center h-8">
              <h1>AI Chat</h1>
            </div>
          </header>
          <div>
            <Button label="New chat" onClick={onNewChat} />
          </div>
        </div>
        <div>
          <ChatHistory onNavigate={onNavigate} />
        </div>
        <div>
          <AuthPanel />
        </div>
      </div>
    </div>
  )
}
