import { createServerFn } from '@tanstack/react-start'
import { GoogleGenAI } from '@google/genai'
import z from 'zod/v4'

export const messageSchema = z.string().trim().min(1, 'Message is required')

export const postMessage = createServerFn({
  method: 'POST',
  response: 'raw',
})
  .validator((data) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    return messageSchema.parse(data.get('message'))
  })
  .handler(async ({ signal, data: message }) => {
    const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY })
    const response = await ai.models.generateContentStream({
      model: 'gemini-2.0-flash',
      contents: message,
      config: {
        maxOutputTokens: 200,
        abortSignal: signal,
      },
    })
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of response) {
            controller.enqueue(
              new TextEncoder().encode(`data: ${chunk.text}\n\n`)
            )
            if (signal.aborted) break
          }
        } catch (err) {
          controller.enqueue(
            new TextEncoder().encode(`event: error\ndata: ${String(err)}\n\n`)
          )
        } finally {
          controller.close()
        }
      },
    })
    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  })

export const streamEvents = createServerFn({
  method: 'GET',
  response: 'raw',
}).handler(async ({ signal }) => {
  // Create a ReadableStream to send chunks of data
  const stream = new ReadableStream({
    async start(controller) {
      // Send initial response immediately
      controller.enqueue(new TextEncoder().encode('Connection established\n'))

      let count = 0
      const interval = setInterval(() => {
        // Check if the client disconnected
        if (signal.aborted) {
          clearInterval(interval)
          controller.close()
          return
        }

        // Send a data chunk
        controller.enqueue(
          new TextEncoder().encode(
            `Event ${++count}: ${new Date().toISOString()}\n`
          )
        )

        // End after 10 events
        if (count >= 10) {
          clearInterval(interval)
          controller.close()
        }
      }, 1000)

      // Ensure we clean up if the request is aborted
      signal.addEventListener('abort', () => {
        clearInterval(interval)
        controller.close()
      })
    },
  })

  // Return a streaming response
  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
})
