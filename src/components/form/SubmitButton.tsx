type Props = {
  label: string
  isSubmitting?: boolean
  canSubmit?: boolean
}
export function SubmitButton({ label, isSubmitting, canSubmit }: Props) {
  return (
    <button type="submit" disabled={!canSubmit}>
      {isSubmitting ? '...' : label}
    </button>
  )
}
