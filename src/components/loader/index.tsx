export default function Loader() {
  return (
    <p className="flex justify-center p-2">
      <span
        className="inline-block w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
        role="status"
        aria-label="Loading"
      ></span>
    </p>
  )
}
