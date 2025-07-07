import Message from './Message'

export default function Chat() {
  return (
    <div className="bg-chat-input-background bg-chat-input-foreground">
      <div className="p-2 border-2 rounded-md">
        <Message />
      </div>
    </div>
  )
}
