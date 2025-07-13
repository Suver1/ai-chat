export const extractTextAndSummary = (text: string) => {
  let summary = ''
  if (text.includes('```summary:')) {
    const parts = text.split('```summary:')
    text = parts[0].trim()
    summary = parts[1]?.replace(/```/g, '').trim()
  }
  return [text, summary]
}
