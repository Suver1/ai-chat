import { useChatStore } from '~/state/chat'

export default function ChatMessages() {
  const history = useChatStore((state) => state.history)
  const isLoading = useChatStore((state) => state.isLoading)

  return (
    <>
      {history.map((msg, index) => (
        <p
          key={index}
          className={`flex ${
            msg.role === 'user' ? 'justify-end' : 'justify-start'
          }`}
        >
          {msg.text}
        </p>
      ))}
      {isLoading && (
        <p className="flex justify-center p-2">
          <span
            className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
            role="status"
            aria-label="Loading"
          ></span>
        </p>
      )}
    </>
  )
}
