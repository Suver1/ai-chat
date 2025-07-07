type Props = {
  label: string
  isSubmitting?: boolean
  canSubmit?: boolean
}
export function SubmitButton({ label, isSubmitting, canSubmit }: Props) {
  return (
    <button
      type="submit"
      disabled={!canSubmit}
      className="p-2 rounded bg-primary bg-primary-foreground"
    >
      {isSubmitting ? '...' : label}
    </button>
  )
}
