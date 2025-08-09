import { Link } from '@tanstack/react-router'
import { useChatListStore } from '~/state/chatList'
import Loader from '../loader'

type Props = { onNavigate?: () => void }

export default function ChatHistory({ onNavigate }: Props) {
  const chatHistory = useChatListStore((state) => state.chatList)
  const isLoading = useChatListStore((state) => state.isLoading)
  const error = useChatListStore((state) => state.error)
  console.log('chatList', chatHistory)

  return (
    <>
      {isLoading && <Loader />}
      {!!error && (
        <p className="error" role="alert">
          Error: Failed to load history
        </p>
      )}
      {chatHistory && chatHistory.length > 0 && (
        <ul className="list-none p-0 m-0">
          {chatHistory.map((chat) => (
            <li key={chat.chatId} className="">
              <Link
                // @ts-expect-error path exists due to wildcard route
                to={`/chat/${chat.chatId}`}
                className="block p-2 rounded-md hover:bg-surface1/40 focus-ring transition-colors"
                onClick={() => onNavigate?.()}
              >
                {chat.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
