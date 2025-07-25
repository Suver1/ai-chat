import { useNavigate, useLocation } from '@tanstack/react-router'
import { ChangeEvent, useCallback, useEffect, useRef, useState } from 'react'
import z from 'zod/v4'
import { SubmitButton, TextAreaSimple } from '~/components/form'
import { ModelName, modelNameSchema, models } from '~/constants/ai-models'
import { generateChatId, postMessage } from '~/serverFn/chat'
import { useChatStore } from '~/state/chat'
import { useChatListStore } from '~/state/chatList'
import { isErrorChunk, parseErrorChunk } from '~/utils/stream'
import { extractTextAndSummary } from '~/utils/string'
import useSelectedModel from '~/hooks/useModel'
import { messageSchema } from '~/utils/input'
import { SUMMARY_START } from '~/constants/summary'

export default function Message() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)
  const textAreaRef = useRef<HTMLTextAreaElement>(null)
  const appendMessage = useChatStore((state) => state.appendMessage)
  const addMessage = useChatStore((state) => state.addMessage)
  const setIsChatLoading = useChatStore((state) => state.setIsLoading)
  const stripSummary = useChatStore((state) => state.stripSummary)
  const setName = useChatStore((state) => state.setName)
  const addToChatList = useChatListStore((state) => state.addToChatList)
  const { selectedModel, updateSelectedModel } = useSelectedModel()

  const location = useLocation()
  const navigate = useNavigate()

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

  const handleModelChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
    updateSelectedModel(e.target.value as ModelName)
  }, [])

  const handleTextChunk = useCallback(
    (textChunk: string) => {
      if (isErrorChunk(textChunk)) {
        setError(parseErrorChunk(textChunk))
        return
      }
      appendMessage(textChunk)
    },
    [appendMessage, setError]
  )

  const handleStreamSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault()

      const formData = new FormData(formRef.current!)
      let isNew = true
      let chatId: string = ''

      let ctrl = new AbortController()
      if (location.pathname.includes('/chat/')) {
        chatId = z.uuidv4().parse(location.pathname.split('/').pop())
        formData.set('chatId', chatId)
        isNew = false
      } else {
        try {
          chatId = await generateChatId({
            signal: ctrl.signal,
          })
        } catch (error) {
          setError(
            error instanceof Error
              ? error.message
              : 'Failed to generate message ID'
          )
          console.error('Error generating message ID:', error)
          return
        }
        formData.set('chatId', chatId)
        navigate({ to: `/chat/${chatId}`, replace: true })
      }
      const modelNameResult = modelNameSchema.safeParse(formData.get('model'))
      if (!modelNameResult.success) {
        setError(modelNameResult.error.issues[0].message)
        console.error('modelNameResult:', modelNameResult.error)
        return
      }
      formData.set('model', modelNameResult.data)

      const messageResult = messageSchema.safeParse(formData.get('message'))
      if (!messageResult.success) {
        setError(messageResult.error.issues[0].message)
        console.error('messageResult:', messageResult.error)
        return
      }
      addMessage(messageResult.data)
      formRef.current?.reset()
      setIsChatLoading(true)
      setIsSubmitting(true)
      setCanSubmit(false)
      setError('')
      let reader: ReadableStreamDefaultReader | null = null
      let previousTexts = []
      let isSummary = false

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
            if (!isSummary) {
              handleTextChunk(textChunk)
              console.log('textChunk:', textChunk)
            }
            if (isNew) {
              // Summary should not be longer than n chunks
              if (previousTexts.length >= 10) {
                previousTexts.shift()
              }
              console.log('previousTexts:', previousTexts)
              previousTexts.push(textChunk)
              if (
                !isSummary &&
                previousTexts.join('').includes(SUMMARY_START)
              ) {
                isSummary = true
                stripSummary()
              }
              console.log('isSummary:', isSummary)
            }
          }
        }

        // flush any remaining data
        const chunkRemains = decoder.decode()
        if (chunkRemains) {
          console.log('chunkRemains:', chunkRemains)
          previousTexts.push(chunkRemains)
          if (!isSummary) {
            handleTextChunk(chunkRemains)
          }
        }

        if (isSummary) {
          const [_, summary] = extractTextAndSummary(previousTexts.join(''))
          setName(summary)
          console.log('add to chat list', summary)
          addToChatList({ chatId, name: summary })
        }
      } catch (err) {
        setError(
          'Streaming error: ' +
            (err instanceof Error ? err.message : String(err))
        )
      } finally {
        reader?.releaseLock()
        setIsChatLoading(false)
        setIsSubmitting(false)
        setCanSubmit(true)
      }
    },
    [
      location,
      navigate,
      appendMessage,
      addMessage,
      setIsChatLoading,
      setIsSubmitting,
      setCanSubmit,
      setError,
      addToChatList,
      stripSummary,
    ]
  )

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
        <div>
          <select
            name="model"
            value={selectedModel}
            onChange={handleModelChange}
          >
            {models.map((model) => (
              <option key={model.name} value={model.name}>
                {model.displayName}
              </option>
            ))}
          </select>
        </div>
        <SubmitButton
          label="Send"
          isSubmitting={isSubmitting}
          canSubmit={canSubmit}
        />
      </div>
    </form>
  )
}
