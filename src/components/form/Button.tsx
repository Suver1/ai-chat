type Props = {
  label: string
  onClick: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void
  className?: string
}

export function Button({ label, onClick, className }: Props) {
  return (
    <button
      className={`${
        className || ''
      } w-full p-2 rounded bg-primary bg-primary-foreground cursor-pointer`}
      type="button"
      onClick={onClick}
    >
      {label}
    </button>
  )
}
