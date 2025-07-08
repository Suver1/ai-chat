import { useCallback, useEffect, useRef, useState } from 'react'
import { SubmitButton, TextAreaSimple } from '~/components/form'
import { messageSchema, postMessage } from '~/serverFn/chat'
import { useChatStore } from '~/state/chat'
import {
  isDataChunk,
  isErrorChunk,
  parseDataChunk,
  parseErrorChunk,
} from '~/utils/stream'

export default function Message() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const appendMessage = useChatStore((state) => state.appendMessage)
  const addMessage = useChatStore((state) => state.addMessage)
  const setIsChatLoading = useChatStore((state) => state.setIsLoading)

  useEffect(() => {
    const textArea = textAreaRef.current
    if (!textArea) return

    const keydownHandler = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
        e.preventDefault()
        handleStreamSubmit()
      }
    }

    textArea.addEventListener('keydown', keydownHandler)
    return () => {
      textArea.removeEventListener('keydown', keydownHandler)
    }
  }, [])

  const handleTextChunk = useCallback(
    (textChunk: string) => {
      if (isDataChunk(textChunk)) {
        appendMessage(parseDataChunk(textChunk))
      } else if (isErrorChunk(textChunk)) {
        setError(parseErrorChunk(textChunk))
      } else {
        throw new Error('Unexpected chunk format: ' + textChunk)
      }
    },
    [appendMessage, setError]
  )

  const handleStreamSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    e?.preventDefault()

    const formData = new FormData(formRef.current!)
    const result = messageSchema.safeParse(formData.get('message'))
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }
    addMessage(result.data)
    formRef.current?.reset()
    setIsChatLoading(true)
    setIsSubmitting(true)
    setCanSubmit(false)
    setError('')
    let reader: ReadableStreamDefaultReader | null = null
    let ctrl = new AbortController()

    try {
      const response = await postMessage({
        signal: ctrl.signal,
        data: formData,
      })
      if (!response.ok || !response.body) {
        setError('Failed to connect to stream')
        return
      }
      reader = response.body.getReader()
      const decoder = new TextDecoder()
      let done = false

      while (!done) {
        const { value, done: streamDone } = await reader.read()
        done = streamDone
        if (value) {
          const textChunk = decoder.decode(value, { stream: !done })
          handleTextChunk(textChunk)
        }
      }

      // flush any remaining data
      const chunkRemains = decoder.decode()
      if (chunkRemains) {
        handleTextChunk(chunkRemains)
      }
    } catch (err) {
      setError(
        'Streaming error: ' + (err instanceof Error ? err.message : String(err))
      )
    } finally {
      reader?.releaseLock()
      setIsChatLoading(false)
      setIsSubmitting(false)
      setCanSubmit(true)
    }
  }

  return (
    <form ref={formRef} onSubmit={handleStreamSubmit}>
      {error && (
        <div className="error mb-0.5" role="alert">
          {error}
        </div>
      )}

      <TextAreaSimple
        accessibleLabel="Message"
        name="message"
        placeholder="Type your message here..."
        ref={textAreaRef}
      />

      <div className="flex justify-between">
        <div> </div>
        <SubmitButton
          label="Send"
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
        />
      </div>
    </form>
  )
}
