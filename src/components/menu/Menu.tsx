import { Button } from '../form/Button'

export default function Menu() {
  return (
    <div className="p-4 h-full">
      <div className="flex flex-col gap-2">
        <header>
          <div className="flex items-center justify-center h-8">
            <h1>AI Chat</h1>
          </div>
        </header>
        <div>
          <Button
            label="New chat"
            onClick={() => console.log('Start new chat')}
          />
        </div>
      </div>
    </div>
  )
}
