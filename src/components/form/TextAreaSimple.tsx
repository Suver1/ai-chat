type Props = {
  accessibleLabel: string
  name: string
  ref?: React.RefObject<HTMLTextAreaElement | null>
  defaultValue?: string
  placeholder?: string
}

export function TextAreaSimple({
  ref,
  accessibleLabel,
  name,
  defaultValue,
  placeholder,
}: Props) {
  return (
    <textarea
      ref={ref}
      name={name}
      aria-label={accessibleLabel}
      defaultValue={defaultValue}
      placeholder={placeholder}
      className="w-full p-2 rounded-md border resize-none"
    />
  )
}
