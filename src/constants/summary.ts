export const SUMMARY_START = '[summary]:'
export const SUMMARY_END = '[/summary]'
export const SUMMARY_END_REGEX = /\[\/summary\]/g
export const SUMMARY_PROMPT = `In addition to your response for the user question below, end your response with a short one-sentence (ideally 3-6 words) summary of the conversation so far, in the user's langauge, using the following schema: ${SUMMARY_START} SUMMARY_HERE${SUMMARY_END}`
