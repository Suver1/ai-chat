import { useRef, useState } from 'react'
import { SubmitButton, TextArea } from '~/components/form'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod/v4'

const messageSchema = z.string().trim().min(1, 'Message is required')
const defaultError = 'Failed to submit message'

export const postMessage = createServerFn({ method: 'POST' })
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    return messageSchema.parse(data.get('message'))
  })
  .handler(async ({ data: message }) => {
    return `Hello! You said: ${message}`
  })

const isValidMessage = (message: string) => {
  return messageSchema.safeParse(message).success
}

export default function Message() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [canSubmit, setCanSubmit] = useState(true)
  const [error, setError] = useState('')
  const formRef = useRef<HTMLFormElement>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    const formData = new FormData(formRef.current!)
    const result = messageSchema.safeParse(formData.get('message'))
    if (!result.success) {
      setError(result.error.issues[0].message)
      return
    }

    setError('')
    setCanSubmit(false)
    setIsSubmitting(true)

    try {
      const response = await postMessage({ data: formData })
      console.log('Response:', response)
      formRef.current?.reset()
      setError('')
    } catch (error) {
      setError(defaultError)
      console.warn(defaultError + ':', error)
    }

    setCanSubmit(true)
    setIsSubmitting(false)
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <TextArea label="Message" name="message" />

      <SubmitButton
        label="Submit"
        isSubmitting={isSubmitting}
        canSubmit={canSubmit}
      />
    </form>
  )
}
