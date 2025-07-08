import { useChatStore } from '~/state/chat'
import { Button } from '../form/Button'
import { useCallback } from 'react'
import { useNavigate } from '@tanstack/react-router'

export default function Menu() {
  const clearMessages = useChatStore((state) => state.clearMessages)
  const navigate = useNavigate()

  const onNewChat = useCallback(() => {
    console.log('Start new chat')
    clearMessages()
    // @ts-ignore /new exists due to wildcard route
    navigate({ to: '/new', replace: true })
  }, [clearMessages, navigate])

  return (
    <div className="p-4 h-full">
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
    </div>
  )
}
