import { useChatStore } from '~/state/chat'
import Loader from '../loader'

export default function ChatMessages() {
  const history = useChatStore((state) => state.history)
  const isLoading = useChatStore((state) => state.isLoading)
  const error = useChatStore((state) => state.error)

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
      {isLoading && <Loader />}
      {error && (
        <p className="error" role="alert">
          Error: Failed to load chat
        </p>
      )}
    </>
  )
}
