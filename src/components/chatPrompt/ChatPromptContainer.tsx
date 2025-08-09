import ChatForm from './ChatForm'

export default function ChatPromptContainer() {
  return (
    <div className="mb-2 p-2 rounded-md border-4 bg-chat-input-background bg-chat-input-foreground bg-chat-input-border">
      <ChatForm />
    </div>
  )
}
