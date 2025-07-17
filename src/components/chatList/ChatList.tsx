import { Link } from '@tanstack/react-router'
import { useChatListStore } from '~/state/chatList'
import Loader from '../loader'

export default function ChatList() {
  const chatList = useChatListStore((state) => state.chatList)
  const isLoading = useChatListStore((state) => state.isLoading)
  const error = useChatListStore((state) => state.error)
  console.log('chatList', chatList)

  return (
    <>
      {isLoading && <Loader />}
      {!!error && (
        <p className="error" role="alert">
          Error: Failed to load history
        </p>
      )}
      {chatList && chatList.length > 0 && (
        <ul className="list-none p-0 m-0">
          {chatList.map((chat) => (
            <li key={chat.chatId} className="">
              <Link
                // @ts-expect-error path exists due to wildcard route
                to={`/chat/${chat.chatId}`}
                className="block p-2 rounded-md"
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
