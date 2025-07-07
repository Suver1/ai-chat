type Props = {
  label: string
  name: string
  defaultValue?: string
}

export function TextArea({ label, name, defaultValue }: Props) {
  return (
    <label>
      <div>{label}</div>
      <textarea name={name} defaultValue={defaultValue} />
    </label>
  )
}
