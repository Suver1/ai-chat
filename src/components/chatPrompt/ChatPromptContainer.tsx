import ChatForm from './ChatForm'

export default function ChatPromptContainer({
  disabled = false,
}: {
  disabled?: boolean
}) {
  return (
    <div
      className={`mb-2 p-2 rounded-md border bg-chat-input-background bg-chat-input-foreground bg-chat-input-border transition-opacity`}
    >
      <ChatForm disabled={disabled} />
    </div>
  )
}
