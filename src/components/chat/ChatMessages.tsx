import { useChatStore } from '~/state/chat'

export default function ChatMessages() {
  const history = useChatStore((state) => state.history)
  const isLoading = useChatStore((state) => state.isLoading)

  // msg.text can be a string, markdown or whatever.
  // split it into paragraphs if needed.
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
    <>
      {history.map((msg, index) => (
        <p
          key={index}
          className={`flex flex-col ${
            msg.role === 'user' ? 'items-end' : 'items-start'
          }`}
        >
          {formatMessage(msg.text)}
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
