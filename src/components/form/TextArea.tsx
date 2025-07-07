type Props = {
  label: string
  name: string
  ref?: React.RefObject<HTMLTextAreaElement | null>
  defaultValue?: string
  placeholder?: string
}

export function TextArea({
  ref,
  label,
  name,
  defaultValue,
  placeholder,
}: Props) {
  return (
    <label>
      <div>{label}</div>
      <textarea
        ref={ref}
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full p-2 rounded-md border resize-none"
      />
    </label>
  )
}
