import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/privacy-policy')({
  component: TermsOfService,
})

function TermsOfService() {
  return (
    <div className="bg-chat-background bg-chat-foreground text-center w-full h-svh p-30">
      No one should use this site. Use at own risk
    </div>
  )
}
