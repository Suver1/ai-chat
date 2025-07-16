import { SUMMARY_END_REGEX, SUMMARY_START } from '~/constants/summary'

export const extractTextAndSummary = (text: string) => {
  let summary = ''
  if (text.includes(SUMMARY_START)) {
    const parts = text.split(SUMMARY_START)
    text = parts[0].trim()
    summary = parts[1]?.replace(SUMMARY_END_REGEX, '').trim()
  }
  return [text, summary]
}
