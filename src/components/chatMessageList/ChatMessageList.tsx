import { useChatStore } from '~/state/chat'
import Loader from '../loader'
import { useEffect, useRef } from 'react'

const isChatNotFound = (error: unknown) => {
  if (error && typeof error === 'object' && 'isNotFound' in error) {
    return error.isNotFound
  }
  return false
}

export default function ChatMessageList() {
  const history = useChatStore((state) => state.history)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)
  const endRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    const el = endRef.current
    const scrollParent = document.getElementById('chat-scroll-container')
    if (!el || !scrollParent) return
    // If user is near bottom (within 200px) keep auto-scrolling; else respect manual scroll position
    const distanceFromBottom =
      scrollParent.scrollHeight -
      (scrollParent.scrollTop + scrollParent.clientHeight)
    if (distanceFromBottom < 200) {
      scrollParent.scrollTo({
        top: scrollParent.scrollHeight,
        behavior: 'smooth',
      })
    }
  }, [history, isLoading])

  const formatMessage = (msg: string) => {
    if (typeof msg === 'string') {
      return msg.split('\n').map((line, index) => (
        <span key={index} className="block">
          {line}
        </span>
      ))
    }
    return msg
  }

  console.log('history', history)
  return (
    <div
      ref={containerRef}
      aria-live="polite"
      aria-atomic="false"
      className="flex flex-col gap-2"
    >
      {history.map((msg, index) => (
        <div
          key={index}
          className={`w-full flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          <div
            className={
              msg.role === 'user'
                ? 'chat-bubble-user shadow-sm'
                : 'chat-bubble-ai shadow-sm'
            }
          >
            {formatMessage(msg.text)}
          </div>
        </div>
      ))}
      {isLoading && <Loader />}
      {error ? (
        isChatNotFound(error) ? (
          <p className="error" role="alert">
            Error: Chat not found
          </p>
        ) : (
          <p className="error" role="alert">
            Error: Failed to load messages
          </p>
        )
      ) : null}
      <div ref={endRef} />
    </div>
  )
}
