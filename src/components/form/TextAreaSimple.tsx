import { useRef } from 'react'
import { useAutoGrowTextarea } from '~/hooks/useAutoGrowTextarea'

type Props = {
  accessibleLabel: string
  name: string
  ref?: React.RefObject<HTMLTextAreaElement | null>
  defaultValue?: string
  placeholder?: string
  autoGrow?: boolean
}

export function TextAreaSimple({
  ref,
  accessibleLabel,
  name,
  defaultValue,
  placeholder,
  autoGrow = true,
}: Props) {
  const innerRef = useRef<HTMLTextAreaElement | null>(null)
  const targetRef = (ref as any) || innerRef
  const { onInput } = useAutoGrowTextarea(targetRef, {
    enabled: autoGrow,
    maxViewportFraction: 0.5,
  })

  return (
    <textarea
      ref={targetRef}
      name={name}
      aria-label={accessibleLabel}
      defaultValue={defaultValue}
      placeholder={placeholder}
      data-autogrow={autoGrow ? 'true' : 'false'}
      rows={1}
      className="w-full p-2 rounded-md border focus-ring leading-relaxed resize-none max-h-[50vh] overflow-auto"
      onInput={onInput}
    />
  )
}
