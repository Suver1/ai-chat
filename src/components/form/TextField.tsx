type Props = {
  label: string
  name: string
  defaultValue?: string
}

export function TextField({ label, defaultValue, name }: Props) {
  return (
    <label>
      <div>{label}</div>
      <input name={name} type="text" defaultValue={defaultValue} />
    </label>
  )
}
